import { coreConfig, ICoreConfig } from "../config/core-config";

/**
 * NamingUtils is a utility class providing utility functions for standard naming conventions.
 */
class NamingUtils {
  readonly config: ICoreConfig;

  /**
   * Create an instance of NamingUtils.
   * @constructor
   * @param config - code configuration
   */
  constructor(config: ICoreConfig) {
    this.config = config;
  }

  /**
   * Create a resource name based on standard naming convention
   * {code}<region>-<environment>-<domain name>-<stage>-<service name>-<service type>{code}
   * @param serviceName - The name of the service.
   * @param serviceType - The type of service i.e lmb for lambda
   * @returns generated resource name
   */
  createResourceName(serviceName: string, serviceType: string): string {
    return `${this.config.region}-${this.config.appEnv}-${this.config.domain.name}-${this.config.stage}-${serviceName}-${serviceType}`;
  }
}

const namingUtils = new NamingUtils(coreConfig);
export { NamingUtils, namingUtils };
