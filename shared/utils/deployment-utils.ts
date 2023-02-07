import { Environment } from "../types/environment";
import { coreConfig, ICoreConfig } from "../config/core-config";

/**
 * DeploymentUtils provides utility methods to help with deployments.
 */
class DeploymentUtils {
  readonly coreConfig: ICoreConfig;
  static deploymentUtils: DeploymentUtils;

  /**
   * Create an instance of DeploymentUtils
   * @param coreConfig An instance of ICoreConfig
   */
  constructor(coreConfig: ICoreConfig) {
    this.coreConfig = coreConfig;
  }

  /**
   * Determine whether the environment is a test environment.
   * @returns true|false
   */
  isTestEnvironment(): boolean {
    return this.coreConfig.appEnv !== Environment.PRD;
  }
}

const deploymentUtils = new DeploymentUtils(coreConfig);
export { DeploymentUtils, deploymentUtils };
