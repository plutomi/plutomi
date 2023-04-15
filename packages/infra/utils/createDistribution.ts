import type { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import type { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import type { CfnWebACL } from "aws-cdk-lib/aws-waf";
import { LoadBalancerV2Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  OriginRequestPolicy
} from "aws-cdk-lib/aws-cloudfront";
import { type Stack, Duration } from "aws-cdk-lib";
import { allEnvVariables } from "../env";

type CreateDistributionProps = {
  stack: Stack;
  fargateService: ApplicationLoadBalancedFargateService;
  certificate: ICertificate;
  waf: CfnWebACL;
};

export const createDistribution = ({
  stack,
  fargateService,
  certificate,
  waf
}: CreateDistributionProps): Distribution => {
  // No caching by default, this is so we can attach WAF to CF and use the CF network.
  const defaultCachePolicy = new CachePolicy(
    stack,
    `${allEnvVariables.DEPLOYMENT_ENVIRONMENT}-Cache-Policy`,
    {
      defaultTtl: Duration.seconds(0),
      minTtl: Duration.seconds(0),
      maxTtl: Duration.seconds(0)
    }
  );

  const distribution = new Distribution(
    stack,
    `${allEnvVariables.DEPLOYMENT_ENVIRONMENT}-CF-API-Distribution`,
    {
      certificate,
      webAclId: waf.attrArn,
      domainNames: [allEnvVariables.DOMAIN],
      defaultBehavior: {
        origin: new LoadBalancerV2Origin(fargateService.loadBalancer),

        // Must be enabled!
        // https://www.reddit.com/r/aws/comments/rhckdm/comment/hoqrjmm/?utm_source=share&utm_medium=web2x&context=3
        originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
        cachePolicy: defaultCachePolicy,
        allowedMethods: AllowedMethods.ALLOW_ALL
      }
      // additionalBehaviors: {
      // TODO add /public caching behaviors here
      // }, //
    }
  );

  return distribution;
};
