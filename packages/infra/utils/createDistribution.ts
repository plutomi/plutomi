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
import type { Stack } from "aws-cdk-lib";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId
} from "aws-cdk-lib/custom-resources";
import { env } from "./env";

type CreateDistributionProps = {
  stack: Stack;
  fargateService: ApplicationLoadBalancedFargateService;
  certificate: ICertificate;
  hostedZone: IHostedZone;
};

const aRecordAlias = "plutomi-alias";
const distributionName = "plutomi-distribution";

const domainName = new URL(env.NEXT_PUBLIC_BASE_URL).hostname;

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
    domainNames: [domainName],
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

  // Setup domains
  void new ARecord(stack, aRecordAlias, {
    recordName: domainName,
    zone: hostedZone,
    target: RecordTarget.fromAlias(new CloudFrontTarget(distribution))
  });

  const now = Date.now();
  const { distributionId } = distribution;
  const invalidationFunctionName = `CloudFrontInvalidationFunction-${now}`;

  // Invalidate the cache on deploys since most of our assets are cached
  // https://medium.com/techhappily/supercharge-your-cloudfront-cache-invalidation-with-aws-cdks-awscustomresource-7094df119d34
  const cloudFrontAwsResource = new AwsCustomResource(
    stack,
    invalidationFunctionName,
    {
      functionName: invalidationFunctionName,
      
      onCreate: {
        physicalResourceId: PhysicalResourceId.of(`${distributionId}-${now}`),
        service: "CloudFront",
        action: "createInvalidation",
        parameters: {
          DistributionId: distributionId,
          InvalidationBatch: {
            CallerReference: now.toString(),
            Paths: {
              Quantity: 1,
              // Invalidate everything
              Items: ["/*"]
            }
          }
        }
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE
      })
    }
  );

  cloudFrontAwsResource.node.addDependency(distribution);

  return distribution;
};
