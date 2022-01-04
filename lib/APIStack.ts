import * as dotenv from "dotenv";
import * as cdk from "@aws-cdk/core";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import {
  HttpApi,
  DomainName,
  CorsHttpMethod,
  HttpMethod,
} from "@aws-cdk/aws-apigatewayv2";
import { Certificate } from "@aws-cdk/aws-certificatemanager";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Runtime, Architecture } from "@aws-cdk/aws-lambda";
import { HostedZone, ARecord, RecordTarget } from "@aws-cdk/aws-route53";
import { ApiGatewayv2DomainProperties } from "@aws-cdk/aws-route53-targets";
import { API_DOMAIN, API_SUBDOMAIN, DOMAIN_NAME, WEBSITE_URL } from "../Config";
import path from "path";
const resultDotEnv = dotenv.config({
  path: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface APIGatewayServiceProps extends cdk.StackProps {
  requestLoginLinkFunction: NodejsFunction;
  loginFunction: NodejsFunction;
  logoutFunction: NodejsFunction;
  sessionInfoFunction: NodejsFunction;
  getUserByIdFunction: NodejsFunction;
  updateUserFunction: NodejsFunction;
  getUserInvites: NodejsFunction;
}

const DEFAULT_LAMBDA_CONFIG = {
  memorySize: 256,
  timeout: cdk.Duration.seconds(5),
  runtime: Runtime.NODEJS_14_X,
  architecture: Architecture.ARM_64,
  bundling: {
    minify: true,
    externalModules: ["aws-sdk"],
  },
  handler: "main",
  reservedConcurrentExecutions: 1, // TODO change to sane defaults
};

/**
 * Creates an API Gateway
 */
export default class APIStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: APIGatewayServiceProps
  ) {
    super(scope, id, props);

    // Retrieves the hosted zone from Route53
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, `HostedZone`, {
      hostedZoneId: process.env.HOSTED_ZONE_ID,
      zoneName: DOMAIN_NAME,
    });

    // Retrieves the certificate that we are using for our domain
    const apiCert = Certificate.fromCertificateArn(
      this,
      `CertificateArn`,
      `arn:aws:acm:${cdk.Stack.of(this).region}:${
        cdk.Stack.of(this).account
      }:certificate/${process.env.ACM_CERTIFICATE_ID}`
    );

    // Creates a domain for our API
    const domain = new DomainName(this, `APIDomain`, {
      domainName: API_DOMAIN,
      certificate: apiCert,
    });

    // Defines an http API Gateway
    const api = new HttpApi(this, `${process.env.NODE_ENV}-APIEndpoint`, {
      defaultDomainMapping: {
        domainName: domain,
      },
      corsPreflight: {
        allowMethods: [
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
        ],
        allowCredentials: true,
        allowOrigins: [WEBSITE_URL],
      },
    });

    // Creates an A record to point to our API
    new ARecord(this, `APIAlias`, {
      zone: hostedZone,
      recordName: API_SUBDOMAIN,
      target: RecordTarget.fromAlias(
        new ApiGatewayv2DomainProperties(
          domain.regionalDomainName,
          domain.regionalHostedZoneId
        )
      ),
    });

    /**
     * Authorizer function
     */
    const authorizerFunction = new NodejsFunction(
      this,
      `${process.env.NODE_ENV}-authorizer-function`,
      {
        functionName: `${process.env.NODE_ENV}-authorizer-function`,
        ...DEFAULT_LAMBDA_CONFIG,
        environment: {
          SESSION_PASSWORD: process.env.SESSION_PASSWORD,
        },
        entry: path.join(__dirname, `../functions/auth/authorizer.ts`),
      }
    );

    const routes = [
      {
        path: "/request-login-link",
        methods: [HttpMethod.POST],
        integration: new LambdaProxyIntegration({
          handler: props.requestLoginLinkFunction,
        }),
      },
      {
        path: "/login",
        methods: [HttpMethod.GET],
        integration: new LambdaProxyIntegration({
          handler: props.loginFunction,
        }),
      },
      {
        path: "/logout",
        methods: [HttpMethod.POST],
        integration: new LambdaProxyIntegration({
          handler: props.logoutFunction,
        }),
      },
      {
        path: "/users/self",
        methods: [HttpMethod.GET],
        integration: new LambdaProxyIntegration({
          handler: props.sessionInfoFunction,
        }),
      },

      {
        path: `/users/{userId}`,
        methods: [HttpMethod.GET],
        integration: new LambdaProxyIntegration({
          handler: props.getUserByIdFunction,
        }),
      },

      {
        path: `/users/{userId}`,
        methods: [HttpMethod.PUT],
        integration: new LambdaProxyIntegration({
          handler: props.updateUserFunction,
        }),
      },
      {
        path: `/users/{userId}/invites`,
        methods: [HttpMethod.GET],
        integration: new LambdaProxyIntegration({
          handler: props.getUserInvites,
        }),
      },
    ];

    for (const route of routes) {
      api.addRoutes(route);
    }
  }
}
