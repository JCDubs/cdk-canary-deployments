import middy from "@middy/core";
import logTimeout from "@dazn/lambda-powertools-middleware-log-timeout";
import { Logger, injectLambdaContext } from "@aws-lambda-powertools/logger";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpResponseSerializer from "@middy/http-response-serializer";
import httpEventNormalizer from "@middy/http-event-normalizer";
import { responseSerializers } from "./response-serializers";
import { logMetrics } from "@aws-lambda-powertools/metrics";
import { Metrics } from "../monitoring/metrics";
import { captureLambdaHandler, Tracer } from "@aws-lambda-powertools/tracer";
import { Handler as LambdaHandler } from "aws-lambda";
export const logger = new Logger();

export type httpWrapperOptions<RequestSchema, ResponseSchema> = {
  handler: LambdaHandler<RequestSchema, ResponseSchema>;
  serviceName: string;
};

export const httpWrapper = <RequestSchema, ResponseSchema>(
  options: httpWrapperOptions<RequestSchema, ResponseSchema>
): middy.MiddyfiedHandler => {
  const tracer = new Tracer({ serviceName: options.serviceName });
  const metrics = Metrics.getMetrics(options.serviceName, options.serviceName);
  return middy(options.handler)
    .use(captureLambdaHandler(tracer))
    .use(logMetrics(metrics, { captureColdStartMetric: true }))
    .use(injectLambdaContext(logger, { logEvent: true }))
    .use(logTimeout())
    .use(jsonBodyParser())
    .use(httpResponseSerializer(responseSerializers))
    .use(httpEventNormalizer());
};
