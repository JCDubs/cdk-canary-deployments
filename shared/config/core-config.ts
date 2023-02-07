import { Account } from "../types/account";
import { Environment } from "../types/environment";
import { Region } from "../types/region";
import { StackProps } from "aws-cdk-lib";
import { IDomain, Domain } from "../types/domain";
import { EnvironmentUtils } from "../utils/environment-utils";
import { Props } from "./props";

/**
 * ICoreConfig extends StackProps and provides the default configuration required
 * by CDK stacks. ICoreConfig can also be used within non CDK stacks.
 * @extends {StackProps}
 */
export interface ICoreConfig extends StackProps {
  account: Account;
  appEnv: Environment;
  region: Region;
  stage: string;
  domain: IDomain;
}

/**
 * CoreConfig implements ICoreConfig providing a Class to set and access all core configuration.
 * @implements {ICoreConfig}
 */
class CoreConfig implements ICoreConfig {
  readonly account: Account;
  readonly appEnv: Environment;
  readonly region: Region;
  readonly stage: string;
  readonly domain: IDomain;

  /**
   *
   * @constructor
   * @param {{ [key: string]: string | undefined }} processEnv
   */
  constructor(processEnv: { [key: string]: string | undefined }) {
    const environmentUtils = new EnvironmentUtils(processEnv);
    this.account = environmentUtils.getEnumFromEnvironmentVariable(
      Props.ACCOUNT,
      Account
    );
    this.appEnv = environmentUtils.getEnumFromEnvironmentVariable(
      Props.ENVIRONMENT,
      Environment
    );
    this.region = environmentUtils.getEnumFromEnvironmentVariable(
      Props.REGION,
      Region
    );
    this.stage = environmentUtils.getEnvironmentVariable(Props.STAGE);

    const domainName = environmentUtils.getEnvironmentVariable(Props.DOMAIN);
    this.domain = Domain.getDomainByName(domainName);
  }
}

const coreConfig = new CoreConfig(process.env);
export { CoreConfig, coreConfig };
