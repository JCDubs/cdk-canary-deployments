import { ILambdaDeploymentConfig } from "aws-cdk-lib/aws-codedeploy";
import { QualifiedFunctionBase } from "aws-cdk-lib/aws-lambda";

/**
 * Set the function as a blue green deployment.
 * @param {LambdaDeploymentConfig} lambdaDeploymentConfig - Optional LambdaDeploymentConfig value.
 * @default {LambdaDeploymentConfig.ALL_AT_ONCE}
 */
export interface Deployable {
  asBlueGreenDeployment(
    lambdaDeploymentConfig?: ILambdaDeploymentConfig
  ): QualifiedFunctionBase;
}
