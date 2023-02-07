import { MissingDomainError } from "../errors/missing-domain-error";

export interface IDomain {
  readonly name: string;
}

/**
 * Domain represents a business domain.
 */
export class Domain implements IDomain {
  readonly name: string;

  /**
   * Create an instance of Domain.
   * @constructor
   * @param name The name of the domain.
   */
  constructor(name: string) {
    this.name = name;
  }

  /**
   * Get a Domain that matches the provided domain name.
   * @param domainName The name of the domain.
   * @returns Domain - The Domain matching the provided domain name.
   * @throws MissingDomainError
   */
  static getDomainByName(domainName: string): Domain {
    const filteredDomainList = domainList.filter(
      (domain) => domain.name === domainName
    );
    if (filteredDomainList.length === 0) {
      throw new MissingDomainError(domainName);
    }
    return filteredDomainList[0];
  }
}

/**
 * IDomains type provides a accessor for all Domains.
 */
export type IDomains = {
  priceDomain: Domain;
  saleDomain: Domain;
  purchaseDomain: Domain;
  orderDomain: Domain;
  customerDomain: Domain;
  productDomain: Domain;
};

const priceDomain = new Domain("price");
const saleDomain = new Domain("sale");
const purchaseDomain = new Domain("purchase");
const orderDomain = new Domain("order");
const customerDomain = new Domain("customer");
const productDomain = new Domain("product");

const domainList = [
  priceDomain,
  saleDomain,
  purchaseDomain,
  orderDomain,
  customerDomain,
  productDomain,
];

export const domains: IDomains = {
  priceDomain,
  saleDomain,
  purchaseDomain,
  orderDomain,
  customerDomain,
  productDomain,
};
