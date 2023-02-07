import { httpWrapper } from "../../../shared/wrapper/http-wrapper";
import { Handler } from "../../../shared/wrapper/api-gateway";
import { Metrics } from "../../../shared/monitoring/metrics";
import { NewProduct } from "../../model/new-product";
import { IProduct } from "../../model/product";
import { logger } from "../../../shared/monitoring/logger";
import { DynamoDBService } from "../../service/dynamodb-service";
import {
  GET_PRODUCT_API_CALL,
  GET_PRODUCT_API_CALL_FAILURE,
} from "src/constants";
import { MetricUnits } from "@aws-lambda-powertools/metrics";

const serviceName = "getProduct";
const nameSpace = serviceName;
const metrics = Metrics.getMetrics(serviceName, nameSpace);
const dynamoDBService = new DynamoDBService();

/**
 * Lambda handler to create a new Product.
 * @param {void} event - API Gateway event.
 * @returns {IProduct} - A saved company product.
 */
export const getProductHandler: Handler<void, IProduct> = async (event) => {
  try {
    logger.info("Received get product request", { product: event.body });
    metrics.addMetric(GET_PRODUCT_API_CALL, MetricUnits.Count, 1);
    const productId = event?.pathParameters?.id!;
    const product = await dynamoDBService.getProduct(productId);
    logger.info("Retrieved Product. Returning product details", { product });
    return {
      statusCode: 201,
      body: product,
    };
  } catch (err) {
    const error = err as Error;
    logger.error(error.message, error);
    metrics.addMetric(GET_PRODUCT_API_CALL_FAILURE, MetricUnits.Count, 1);
    return { statusCode: 500, body: { errorMessage: error.message } };
  }
};

export const main = httpWrapper({
  handler: getProductHandler,
  serviceName,
});
