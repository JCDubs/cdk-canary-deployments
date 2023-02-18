import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Lambda } from "../shared/L3/lambda";
import path from "path";
import { API } from "../shared/L3/api";
import { HttpMethod } from "../shared/utils/http-method";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { LambdaDeploymentConfig } from "aws-cdk-lib/aws-codedeploy";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";

/**
 * ProductStatefulStackProps contains properties required by the ProductStatefulStack.
 * @extends {cdk.StackProps}
 */
export interface ProductStatelessStackProps extends cdk.StackProps {
  productTable: Table;
  productIdIndexName: string;
}

/**
 * ProductStatelessStack contains all stateless resources in the Product Stack.
 * @extends {cdk.Stack}
 */
export class ProductStatelessStack extends cdk.Stack {
  /**
   * Create the ProductStatelessStack stack.
   * @constructor
   * @param {Construct} scope
   * @param {string} id
   * @param {ProductStatefulStackProps} props
   */
  constructor(scope: Construct, id: string, props: ProductStatelessStackProps) {
    super(scope, id, props);

    // Create the API.
    const productApi = API.create(this, "ProductApi", {
      ...props,
      apiName: "ProductApi",
      description: "Product API update",
      deploy: true,
    });

    // Create the create product lambda
    const createProductLambda = Lambda.create(this, "CreateCityProduct", {
      entry: path.join(
        __dirname,
        "../src/handler/create-product-function/index.ts"
      ),
      description: "Create a product with change - alias is live-1",
      serviceName: "createCityProduct",
      environment: {
        TABLE_NAME: props.productTable.tableName,
      },
    });

    // Create the blue green deployment as a 10% percent canary over 5 minutes.
    const createProductAlias = createProductLambda.asBlueGreenDeployment(
      LambdaDeploymentConfig.CANARY_10PERCENT_15MINUTES
    );

    props.productTable.grantReadWriteData(createProductLambda);

    productApi.addEndpoint({
      resourcePath: "/product",
      method: HttpMethod.POST,
      function: createProductAlias,
    });

    // createProductAlias.addPermission("PermitAPIGInvocation", {
    //   principal: new ServicePrincipal("apigateway.amazonaws.com"),
    //   sourceArn: productApi.arnForExecuteApi(HttpMethod.POST, "/product"),
    // });
  }
}
