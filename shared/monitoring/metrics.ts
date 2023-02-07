import { Metrics as PowerMetrics } from "@aws-lambda-powertools/metrics";

/**
 * 
 */
export class Metrics {
  static metrics: PowerMetrics;
  static readonly notApplicable: string = "N/A";

  /**
   * 
   * @param serviceName 
   * @param namespace 
   * @returns 
   */
  static getMetrics(serviceName?: string, namespace?: string): PowerMetrics {
    if (!this.metrics) {
      this.metrics = new PowerMetrics({
        namespace,
        serviceName,
        defaultDimensions: {
          aws_account_id: process.env.AWS_ACCOUNT_ID || this.notApplicable,
          aws_region: process.env.AWS_REGION || this.notApplicable,
        },
      });
    }
    return this.metrics;
  }
}
