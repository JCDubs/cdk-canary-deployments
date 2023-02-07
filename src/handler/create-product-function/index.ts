import { httpWrapper } from "../../../shared/wrapper/http-wrapper";
import { Handler } from "../../../shared/wrapper/api-gateway";
import { Metrics } from "../../../shared/monitoring/metrics";
import { NewProduct } from "../../model/new-product";
import { IProduct } from "../../model/product";
import { logger } from "../../../shared/monitoring/logger";
import { DynamoDBService } from "../../service/dynamodb-service";
import {
  CREATE_PRODUCT_API_CALL,
  CREATE_PRODUCT_API_CALL_FAILURE,
} from "src/constants";
import { MetricUnits } from "@aws-lambda-powertools/metrics";

const serviceName = "createCustomerAccount";
const nameSpace = serviceName;
const metrics = Metrics.getMetrics(serviceName, nameSpace);
const dynamoDBService = new DynamoDBService();

/**
 * Create a new product.
 * @param {NewProduct} event - An API Gateway event containing a NewProduct as the body.
 * @returns {IProduct} - The newly created product as the response body.
 */
export const createProductHandler: Handler<NewProduct, IProduct> = async (
  event
) => {
  try {
    logger.info("Received create product request", { product: event.body });
    metrics.addMetric(CREATE_PRODUCT_API_CALL, MetricUnits.Count, 1);
    const product = await dynamoDBService.createProduct(event.body);
    logger.info("Product saved, returning saved product details", { product });
    return {
      statusCode: 201,
      body: product,
    };
  } catch (err) {
    const error = err as Error;
    logger.error(error.message, error);
    metrics.addMetric(CREATE_PRODUCT_API_CALL_FAILURE, MetricUnits.Count, 1);
    return { statusCode: 500, body: { errorMessage: error.message } };
  }
};

export const main = httpWrapper({
  handler: createProductHandler,
  serviceName,
});
