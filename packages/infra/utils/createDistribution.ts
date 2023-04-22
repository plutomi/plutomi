import type { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import type { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  type IHostedZone,
  ARecord,
  RecordTarget
} from "aws-cdk-lib/aws-route53";
import { LoadBalancerV2Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  OriginRequestPolicy
} from "aws-cdk-lib/aws-cloudfront";
import { type Stack } from "aws-cdk-lib";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { env } from "../env";

type CreateDistributionProps = {
  stack: Stack;
  fargateService: ApplicationLoadBalancedFargateService;
  certificate: ICertificate;
  hostedZone: IHostedZone;
};

// ! TODO: Remove - don't want a conflict with maintenance page, create a separate PR
const temporaryDomain = `temporary.${env.DOMAIN}`;

export const createDistribution = ({
  stack,
  fargateService,
  certificate,
  hostedZone
}: CreateDistributionProps): Distribution => {
  const loadBalancerOrigin = new LoadBalancerV2Origin(
    fargateService.loadBalancer,
    {
      customHeaders: {
        // WAF on the ALB will block requests without this header
        [env.CF_HEADER_KEY]: env.CF_HEADER_VALUE
      }
    }
  );

  const distribution = new Distribution(
    stack,
    `${env.DEPLOYMENT_ENVIRONMENT}-CF-API-Distribution`,
    {
      certificate,
      domainNames: [temporaryDomain],
      defaultBehavior: {
        origin: loadBalancerOrigin,
        // Must be enabled!
        // https://www.reddit.com/r/aws/comments/rhckdm/comment/hoqrjmm/?utm_source=share&utm_medium=web2x&context=3
        originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
        // Disabled for /api/ routes by default, cache on an as needed basis under additional behaviors
        cachePolicy: CachePolicy.CACHING_DISABLED,
        allowedMethods: AllowedMethods.ALLOW_ALL
      },

      // Cache static routes
      additionalBehaviors: {
        "/_next/*": {
          origin: loadBalancerOrigin,
          cachePolicy: CachePolicy.CACHING_OPTIMIZED
        },
        "/public/*": {
          origin: loadBalancerOrigin,
          cachePolicy: CachePolicy.CACHING_OPTIMIZED
        }
      }
    }
  );

  void new ARecord(stack, "APIAlias", {
    recordName: temporaryDomain,
    zone: hostedZone,
    target: RecordTarget.fromAlias(new CloudFrontTarget(distribution))
  });

  return distribution;
};
