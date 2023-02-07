/**
 * MissingEnvironmentVariableError represents an error that should be thrown when
 * an environment variable is has not been provided and is missing.
 */
export class MissingEnvironmentVariableError extends Error {
  /**
   * Create an instance of MissingEnvironmentVariableError.
   * @constructor
   * @param variableName - The name of the missing environment variable.
   */
  constructor(variableName: string) {
    super(`Environment variable "${variableName}" is missing.`);
    this.name = "MissingEnvironmentVariableError";
  }
}
