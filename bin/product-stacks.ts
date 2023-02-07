#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProductStatefulStack } from "../lib/product-stateful-stack";
import { ProductStatelessStack } from "../lib/product-stateless-stack";

const productIdIndexName = "productById";
const app = new cdk.App();
const statefulStack = new ProductStatefulStack(app, "ProductStatefulStack", {
  productIdIndexName,
});
new ProductStatelessStack(app, "CdkL4LambdaStack", {
  productIdIndexName,
  productTable: statefulStack.productTable,
});
