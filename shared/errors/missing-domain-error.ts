/**
 * MissingDomainError should be thrown when
 * a provided domain name doesn't exist.
 */
export class MissingDomainError extends Error {
  /**
   * Create an instance of MissingDomainError.
   * @constructor
   * @param domainName - The name of the missing domain.
   */
  constructor(domainName: string) {
    super(`Domain with name "${domainName}" does not exist.`);
    this.name = "MissingDomainError";
  }
}
