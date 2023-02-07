import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { NewProduct } from "src/model/new-product";
import { logger } from "../../shared/monitoring/logger";
import { ulid } from "ulid";
import { Product, IProduct } from "src/model/product";
import { MetricUnits } from "@aws-lambda-powertools/metrics";
import { Metrics } from "../../shared/monitoring/metrics";
import {
  GET_PRODUCT,
  GET_PRODUCT_FAILURE,
  SAVE_PRODUCT,
  SAVE_PRODUCT_FAILURE,
} from "src/constants";
import { config } from "../config/config";

const client = new DynamoDBClient({});
const metrics = Metrics.getMetrics();

/**
 * DynamoDBService provides Product based dynamodb functionality.
 */
export class DynamoDBService {
  readonly tableName: string;
  readonly indexName: string;

  /**
   * Create an instance of the DynamoDBService.
   * @constructor
   */
  constructor() {
    this.tableName = config.get("tableName");
    this.indexName = config.get("indexName");
  }

  /**
   * Create a product.
   * @param {NewProduct} product - The product to save.
   * @returns {Product} - The saved product.
   * @throws {Error} - Thrown is there is an issue connecting to the database or saving the product.
   */
  async createProduct(newProduct: NewProduct): Promise<IProduct> {
    try {
      logger.info("Attempting to save product", { newProduct });
      const productId = ulid();
      const command = new PutItemCommand({
        TableName: this.tableName,
        Item: {
          PK: { S: "PRODUCT" },
          SK: { S: `NAME#${newProduct.name}` },
          id: { S: productId },
          name: { S: newProduct.name },
          description: { S: newProduct.description },
          updateTime: { S: new Date().toISOString() },
        },
        ConditionExpression: "attribute_not_exists(PK)",
      });
      const response = await client.send(command);
      logger.info("got response", { databaseResponse: response });
      if (response?.$metadata?.httpStatusCode !== 200) {
        metrics.addMetric(SAVE_PRODUCT_FAILURE, MetricUnits.Count, 1);
        const errorMessage = "Unable to save the Product";
        logger.error(errorMessage, { databaseResponse: response });
        throw Error(errorMessage);
      }
      metrics.addMetric(SAVE_PRODUCT, MetricUnits.Count, 1);
      logger.info("Saved product", { newProduct });
      return {
        id: productId,
        ...newProduct,
      };
    } catch (err) {
      const error = err as Error;
      logger.error(error.message, error);
      if (error.name === "ConditionalCheckFailedException") {
        return Promise.reject(
          new Error(`Product with name ${newProduct.name} already exists`)
        );
      }
      return Promise.reject(error);
    }
  }

  /**
   * Get a product using the provided product id.
   * @param {string} productId - The id of the product to retrieve.
   * @returns {IProduct} - The retrieved product matching the provided product id.
   * @throws {Error} - Thrown is there is an issue connecting to the database or retrieving the product.
   */
  async getProduct(productId: string): Promise<IProduct> {
    try {
      const queryParams = {
        TableName: this.tableName,
        IndexName: this.indexName,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: { ":id": { S: productId } },
      };
      logger.info(`Retrieving product with ID: ${productId}`, { queryParams });
      const response = await client.send(new QueryCommand(queryParams));
      logger.info("Product ID query response", { databaseResponse: response });
      if (response?.$metadata?.httpStatusCode !== 200) {
        metrics.addMetric(GET_PRODUCT_FAILURE, MetricUnits.Count, 1);
        const errorMessage = "Unable to retrieve the Product";
        logger.error(errorMessage, { databaseResponse: response });
        throw Error(errorMessage);
      }

      metrics.addMetric(GET_PRODUCT, MetricUnits.Count, 1);
      return Product.fromItem(response.Items![0]);
    } catch (err) {
      const error = err as Error;
      logger.error(error.message, error);
      return Promise.reject(error);
    }
  }
}
