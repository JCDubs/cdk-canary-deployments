import {
  NodejsFunction,
  NodejsFunctionProps,
  SourceMapMode,
} from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { deploymentUtils } from "../utils/deployment-utils";
import { namingUtils } from "../utils/naming-utils";
import { LogLevel } from "../types/log-level";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { Architecture, Tracing } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

/**
 * ILambdaProps provides all properties required to create a Lambda.
 * @extends { NodejsFunctionProps }
 */
export interface ILambdaProps extends NodejsFunctionProps {
  entry: string;
  description: string;
  serviceName: string;
}

let defaultEnvironment = {
  LOG_LEVEL: LogLevel.DEBUG,
  POWERTOOLS_LOGGER_LOG_EVENT: "true",
  POWERTOOLS_LOGGER_SAMPLE_RATE: "1",
  POWERTOOLS_TRACE_ENABLED: "enabled",
  POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS: "captureHTTPsRequests",
  POWERTOOLS_TRACER_CAPTURE_RESPONSE: "captureResult",
  NODE_OPTIONS: "",
};

if (deploymentUtils.isTestEnvironment()) {
  defaultEnvironment.NODE_OPTIONS = "--enable-source-maps";
}

/**
 * A set of fixed properties to be applied to a Lambda Function that cannot be overridden.
 * @type { NodejsFunctionProps }
 */
const fixedProps: NodejsFunctionProps = {
  runtime: lambda.Runtime.NODEJS_16_X,
  architecture: Architecture.ARM_64,
  awsSdkConnectionReuse: true,
  layers: [],
  tracing: deploymentUtils.isTestEnvironment()
    ? Tracing.ACTIVE
    : Tracing.PASS_THROUGH,
  environment: defaultEnvironment,
  currentVersionOptions: {
    removalPolicy: RemovalPolicy.RETAIN,
    description: `Version deployed on ${new Date().toISOString()}`,
  },
  bundling: {
    minify: true,
    sourceMap: deploymentUtils.isTestEnvironment(),
    sourceMapMode: SourceMapMode.INLINE,
    sourcesContent: false,
    target: "node16",
    externalModules: ["aws-sdk"],
  },
};

/**
 * A set of overridable properties to be applied to a Lambda Function
 * @type { NodejsFunctionProps }
 */
export const defaultProps: NodejsFunctionProps = {
  handler: "main",
  timeout: Duration.minutes(1),
};

/**
 * Lambda represents an AWS Lambda Resource.
 * @extends { NodejsFunction }
 */
export class Lambda extends NodejsFunction {
  private static resourceType = "lmb";

  /**
   * A private constructor allowing only the static create function to create an instance of Lambda.
   * @constructor
   * @param {Construct} scope - CDK Construct.
   * @param {string }id - Resource id.
   * @param {NodejsFunctionProps} props - Properties to be applied to the Lambda.
   */
  private constructor(
    scope: Construct,
    id: string,
    props: NodejsFunctionProps
  ) {
    super(scope, id, props);
  }

  /**
   * Create an instance of Lambda setting fixed and default configuration.
   * @param {Construct} scope -  CDK Construct.
   * @param {string} id - Id of the resource.
   * @param {ILambdaProps} props - Properties to be applied when creating the Lambda.
   * @returns {Lambda} A new instance of Lambda.
   */
  static create(scope: Construct, id: string, props: ILambdaProps): Lambda {
    const lambda = new Lambda(scope, id, {
      ...props,
      ...defaultProps,
      ...fixedProps,
      environment: {
        ...(props.environment ?? {}),
        ...fixedProps.environment,
        POWERTOOLS_METRICS_NAMESPACE: props.serviceName,
      },
      functionName: namingUtils.createResourceName(
        props.serviceName,
        this.resourceType
      ),
    });
    return lambda;
  }
}
