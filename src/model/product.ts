import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { NewProduct } from "./new-product";

/**
 * IProduct represents a product in the company.
 * @extends {NewProduct}
 */
export interface IProduct extends NewProduct {
  id: string;
}

/**
 * Product is the implementation of IProduct representing a product in the company.
 * @implements {IProduct}
 */
export class Product implements IProduct {
  readonly id: string;
  readonly name: string;
  readonly description: string;

  /**
   * Create an instance of Product.
   * @constructor
   * @param {string} id
   * @param {string} name
   * @param {string} description
   */
  constructor(id: string, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  /**
   * Get the product id.
   * @returns {string} id
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get the product name.
   * @returns {string} name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get the product description.
   * @returns {string} description
   */
  getDescription(): string {
    return this.description;
  }

  /**
   * Converts a Product from a DynamoDB Item to an instance of Product.
   * @param {Record<string, AttributeValue>} productItem
   * @returns {Product}
   * @throws {Error} - thrown if the product id, name or description is not present.
   */
  static fromItem(productItem: Record<string, AttributeValue>) {
    if (!productItem.id.S) {
      throw new Error(
        "Could not convert the Product Item to a ProductDTO, id is missing"
      );
    }

    if (!productItem.name.S) {
      throw new Error(
        "Could not convert the Product Item to a ProductDTO, name is missing"
      );
    }

    if (!productItem.description.S) {
      throw new Error(
        "Could not convert the Product Item to a ProductDTO, description is missing"
      );
    }

    return new Product(
      productItem.id.S,
      productItem.name.S,
      productItem.description.S
    );
  }
}
