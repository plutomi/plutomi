import type { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import type { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  type IHostedZone,
  ARecord,
  RecordTarget
} from "aws-cdk-lib/aws-route53";
import { LoadBalancerV2Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  type AddBehaviorOptions,
  AllowedMethods,
  CachePolicy,
  Distribution,
  OriginRequestPolicy,
  ViewerProtocolPolicy
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

const aRecordAlias = `${env.DEPLOYMENT_ENVIRONMENT}-plutomi-alias`;
const distributionName = `${env.DEPLOYMENT_ENVIRONMENT}-plutomi-distribution`;

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
        // In the future, WAF on the ALB will block requests without this header
        [env.CF_HEADER_KEY]: env.CF_HEADER_VALUE
      }
    }
  );
  const defaultBehavior: AddBehaviorOptions = {
    // Must be enabled!
    // https://www.reddit.com/r/aws/comments/rhckdm/comment/hoqrjmm/?utm_source=share&utm_medium=web2x&context=3
    originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
    // Everything is cached, except api
    cachePolicy: CachePolicy.CACHING_OPTIMIZED,
    allowedMethods: AllowedMethods.ALLOW_ALL,
    // Some sites remove https:// from the url, so we redirect anyway >.>
    viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
  };

  const distribution = new Distribution(stack, distributionName, {
    certificate,
    domainNames: [env.DOMAIN],
    defaultBehavior: {
      ...defaultBehavior,
      origin: loadBalancerOrigin
    }
  });

  // Disable caching
  ["/api/*"].forEach((path) => {
    distribution.addBehavior(path, loadBalancerOrigin, {
      ...defaultBehavior,
      cachePolicy: CachePolicy.CACHING_DISABLED
    });
  });

  void new ARecord(stack, aRecordAlias, {
    recordName: env.DOMAIN,
    zone: hostedZone,
    target: RecordTarget.fromAlias(new CloudFrontTarget(distribution))
  });

  return distribution;
};
