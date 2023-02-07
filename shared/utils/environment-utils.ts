import { MissingEnvironmentVariableError } from "../errors/missing-environment-variable-error";

/**
 * Environment Utils provides utility methods for the processing of environment variables.
 */
class EnvironmentUtils {
  processEnv: { [key: string]: string | undefined };

  /**
   * Create an instance of EnvironmentUtils
   * @constructor
   * @param processEnv - The `env` object within the system process.
   */
  constructor(processEnv: { [key: string]: string | undefined }) {
    this.processEnv = processEnv;
  }

  /**
   * Get an environment variable as the defined Enum.
   * @param environmentVariableName - The name of the environment variable.
   * @param variableType - The enum to convert the environment variable to.
   * @returns Enum of type <T>
   * @throws MissingEnvironmentVariableError - Thrown if the environment variable is missing.
   */
  getEnumFromEnvironmentVariable<T extends { [s: number]: string }>(
    environmentVariableName: string,
    variableType: { [s: number]: string }
  ): T {
    const value = this.getEnvironmentVariable(environmentVariableName);

    if (variableType && !Object.values(variableType).includes(value)) {
      throw new MissingEnvironmentVariableError(environmentVariableName);
    }

    const index = Object.values(variableType).indexOf(value);
    return variableType[Object.keys(variableType)[index]];
  }

  /**
   * Get the environment variable of the provided name.
   * @param environmentVariableName The name of the environment variable to retrieve.
   * @returns environment variable as string.
   * @throws MissingEnvironmentVariableError - Thrown if the environment variable is missing.
   */
  getEnvironmentVariable(environmentVariableName: string): string {
    if (!this.processEnv[environmentVariableName]) {
      throw new MissingEnvironmentVariableError(environmentVariableName);
    }

    return this.processEnv[environmentVariableName]!;
  }
}

const environmentUtils = new EnvironmentUtils(process.env);
export { EnvironmentUtils, environmentUtils };
