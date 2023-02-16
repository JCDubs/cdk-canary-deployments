import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";

export interface ProductStatefulStackProps extends cdk.StackProps {
  productIdIndexName: string;
}

/**
 * ProductStatefulStack contains all stateful resources.
 * @extends {Stack}
 */
export class ProductStatefulStack extends cdk.Stack {
  public readonly productTable: dynamodb.Table;
  readonly productBucket: s3.Bucket;

  /**
   * Create the ProductStatefulStack.
   * @constructor
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps} props
   */
  constructor(scope: Construct, id: string, props: ProductStatefulStackProps) {
    super(scope, id, props);

    // create the dynamodb table for storing our orders
    this.productTable = new dynamodb.Table(this, "ProductTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: false,
      contributorInsightsEnabled: true,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: "PK",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: dynamodb.AttributeType.STRING,
      },
    });

    this.productTable.addGlobalSecondaryIndex({
      indexName: props.productIdIndexName,
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });
  }
}
