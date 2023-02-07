import convict from "convict";

export const config = convict({
  tableName: {
    doc: "The database table where we store products",
    format: String,
    default: "ProductTable",
    env: "TABLE_NAME",
  },
  indexName: {
    doc: "The database table product id index name.",
    format: String,
    default: "productById",
    env: "INDEX_NAME",
  },
}).validate({ allowed: "strict" });
