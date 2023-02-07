import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Lambda } from "../shared/l4/lambda";
import path from "path";
import { API } from "../shared/l4/api";
import { HttpMethod } from "../shared/utils/http-method";
import { Table } from "aws-cdk-lib/aws-dynamodb";

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

    // Create the public API.
    const productApi = API.create(this, "ProductApi", {
      ...props,
      apiName: "ProductApi",
      description: "Product API",
      deploy: true,
    });

    // Create the get product lambda
    const getProductLambda = Lambda.create(this, "GetProductLambda", {
      entry: path.join(
        __dirname,
        "../src/handler/get-product-function/index.ts"
      ),
      description: "Get a product by product id",
      serviceName: "getProductFunction",
      environment: {
        TABLE_NAME: props.productTable.tableName,
        INDEX_NAME: props.productIdIndexName,
      },
    });

    // Create the create product lambda
    const createProductLambda = Lambda.create(this, "CreateProductLambda", {
      entry: path.join(
        __dirname,
        "../src/handler/create-product-function/index.ts"
      ),
      description: "Create a product",
      serviceName: "createProductFunction",
      environment: {
        TABLE_NAME: props.productTable.tableName,
      },
    });

    props.productTable.grantReadData(getProductLambda);
    props.productTable.grantReadWriteData(createProductLambda);

    // Create the create product api endpoint associating the path, HTTP Verb and function.
    productApi.addEndpoint({
      resourcePath: "/product",
      method: HttpMethod.POST,
      function: createProductLambda,
    });

    // Create the get product api endpoint associating the path, HTTP Verb and function.
    productApi.addEndpoint({
      resourcePath: "/product/{id}",
      method: HttpMethod.GET,
      function: getProductLambda,
    });
  }
}
