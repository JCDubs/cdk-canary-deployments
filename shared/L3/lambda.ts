import {
  NodejsFunction,
  NodejsFunctionProps,
  SourceMapMode,
} from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { deploymentUtils } from "../utils/deployment-utils";
import { LogLevel } from "../types/log-level";
import { namingUtils } from "../utils/naming-utils";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import {
  Alias,
  Architecture,
  QualifiedFunctionBase,
  Tracing,
} from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { Alarm } from "aws-cdk-lib/aws-cloudwatch";
import {
  ILambdaDeploymentConfig,
  LambdaDeploymentConfig,
  LambdaDeploymentGroup,
} from "aws-cdk-lib/aws-codedeploy";
import { Deployable } from "../types/deployable";
import packageJson from "../../package.json";

/**
 * ILambdaProps provides all properties required to create a City Lambda.
 * @extends {NodejsFunctionProps}
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
  VERSION: `${packageJson.version}`,
};

if (deploymentUtils.isTestEnvironment()) {
  defaultEnvironment["NODE_OPTIONS"] = "--enable-source-maps";
}

/**
 * A set of fixed properties to be applied to a City Lambda Function
 * that cannot be overridden.
 * @type {NodejsFunctionProps}
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
 * A set of overridable properties to be applied to a City Lambda Function
 * @type {NodejsFunctionProps}
 */
export const defaultProps: NodejsFunctionProps = {
  handler: "main",
  timeout: Duration.minutes(1),
};

/**
 * PublicLambda represents an AWS Public Lambda Resource.
 * @extends {NodejsFunction}
 */
export class Lambda extends NodejsFunction implements Deployable {
  private static resourceType = "lmb";

  /**
   * A private constructor allowing only the
   * static create function to create an instance of PublicLambda.
   * @constructor
   * @param {Construct} scope - CDK Construct.
   * @param {string }id - Resource id.
   * @param {NodejsFunctionProps} props - Properties to be applied to the PublicLambda.
   */
  private constructor(
    scope: Construct,
    id: string,
    props: NodejsFunctionProps
  ) {
    super(scope, id, props);
  }

  /**
   * Create an instance of PublicLambda setting fixed and default
   * configuration.
   * @param {Construct} scope -  CDK Construct.
   * @param {string} id - Id of the resource.
   * @param {IPublicLambdaProps} props - Properties to be applied when creating the Public Lambda.
   * @returns {PublicLambda} A new instance of PublicLambda.
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
      currentVersionOptions: {
        removalPolicy: RemovalPolicy.RETAIN,
        description: `Version deployed on ${new Date().toISOString()}`,
      },
    });
    return lambda;
  }

  /**
   * Set the function as a blue green deployment.
   * @param {LambdaDeploymentConfig} lambdaDeploymentConfig - Optional LambdaDeploymentConfig value.
   * @default {LambdaDeploymentConfig.ALL_AT_ONCE}
   * @returns {QualifiedFunctionBase} - The alias created for the blue green deployment.
   */
  asBlueGreenDeployment(
    lambdaDeploymentConfig?: ILambdaDeploymentConfig
  ): QualifiedFunctionBase {
    const newVersion = this.currentVersion;
    newVersion.applyRemovalPolicy(RemovalPolicy.RETAIN);

    const alias = new Alias(this, "BlueGreenAlias", {
      aliasName: "live",
      version: newVersion,
    });

    const failureAlarm = new Alarm(this, "DeploymentAlarm", {
      metric: alias.metricErrors(),
      threshold: 1,
      alarmDescription: `${this.functionName} ${newVersion.version} blue green deployment failure alarm`,
      evaluationPeriods: 1,
    });

    new LambdaDeploymentGroup(this, "LambdaDeploymentGroup", {
      alias,
      deploymentConfig:
        lambdaDeploymentConfig ?? LambdaDeploymentConfig.ALL_AT_ONCE,
      alarms: [failureAlarm],
    });
    return alias;
  }
}
