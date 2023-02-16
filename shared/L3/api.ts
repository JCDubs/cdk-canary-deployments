import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { coreConfig } from "../config/core-config";
import { HttpMethod } from "../utils/http-method";
import * as logs from "aws-cdk-lib/aws-logs";
import { CfnOutput } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

const fixedProps: Omit<apiGateway.LambdaRestApiProps, "handler"> = {
  minimumCompressionSize: 0,
  endpointConfiguration: { types: [apiGateway.EndpointType.REGIONAL] },
  cloudWatchRole: true,
  proxy: false,
};

/**
 * Representation of an APIEndpoint configuration.
 */
export type APIEndpoint = {
  resourcePath: string;
  method: HttpMethod;
  function: NodejsFunction;
};

/**
 * Redefined API Props for the API L4 Construct implementation.
 */
export interface APIProps
  extends Omit<apiGateway.LambdaRestApiProps, "handler"> {
  apiName: string;
  description: string;
  deploy?: boolean;
}

/**
 * API L4 CDK Construct implementing fixed and default API Configuration.
 * @extends {RestApi}
 */
export class API extends apiGateway.RestApi {
  private static resourceType = "api";

  /**
   * Private API Constructor only allowing instances to be created in the factory method.
   * @constructor
   * @param {Construct} scope
   * @param {string} id
   * @param {APIProps} props
   */
  private constructor(scope: Construct, id: string, props: APIProps) {
    super(scope, id, props);
  }

  /**
   * Create an instance of API implementing default and fixed values.
   * @param {Construct} scope
   * @param {string} id
   * @param {APIProps} props
   * @returns {API}
   */
  static create(scope: Construct, id: string, props: APIProps): API {
    const deployOptions = {
      stageName: coreConfig.stage,
      loggingLevel: apiGateway.MethodLoggingLevel.INFO,
      metricsEnabled: true,
      accessLogDestination: new apiGateway.LogGroupLogDestination(
        new logs.LogGroup(
          scope,
          `/aws/api-gateway/${coreConfig.stage}/${props.apiName}-access-logs`
        )
      ),
      accessLogFormat: apiGateway.AccessLogFormat.jsonWithStandardFields({
        caller: true,
        httpMethod: true,
        ip: true,
        protocol: true,
        requestTime: true,
        resourcePath: true,
        responseLength: true,
        status: true,
        user: true,
      }),
    };

    const api = new API(scope, id, {
      ...props,
      ...fixedProps,
      deploy: props.deploy ?? false,
      ...(props.deploy && { deployOptions }),
    });

    new CfnOutput(scope, `APIGatewayRestApiId`, {
      value: api.restApiId,
    });
    return api;
  }

  /**
   * Add an endpoint to the API.
   * @param {APIEndpoint} resourceToAdd - The resource to create.
   * @returns {API}
   */
  addEndpoint(resourceToAdd: APIEndpoint): API {
    const apiResource = this.root.resourceForPath(resourceToAdd.resourcePath);
    apiResource.addMethod(
      resourceToAdd.method,
      new apiGateway.LambdaIntegration(resourceToAdd.function, {
        proxy: true,
      })
    );
    return this;
  }
}
