import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler as LambdaHandler,
} from "aws-lambda";

export type ErrorResponseBody = { errorMessage: string };

export type Handler<TRequestBody, TResponseBody> = LambdaHandler<
  Omit<APIGatewayProxyEvent, "body"> & { body: TRequestBody },
  Omit<APIGatewayProxyResult, "body"> & {
    body: TResponseBody | ErrorResponseBody;
  }
>;
