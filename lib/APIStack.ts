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
import { HostedZone, ARecord, RecordTarget } from "@aws-cdk/aws-route53";
import { ApiGatewayv2DomainProperties } from "@aws-cdk/aws-route53-targets";
import { API_DOMAIN, API_SUBDOMAIN, DOMAIN_NAME, WEBSITE_URL } from "../Config";
const resultDotEnv = dotenv.config({
  path: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
});

if (resultDotEnv.error) {
  throw resultDotEnv.error;
}

interface APIGatewayServiceProps extends cdk.StackProps {
  getSelfInfoFunction: NodejsFunction;
  getUserByIdFunction: NodejsFunction;
  updateUserFunction: NodejsFunction;
  createOrgFunction: NodejsFunction;
  getOrgInfoFunction: NodejsFunction;
  deleteOrgFunction: NodejsFunction;
  getUsersInOrgFunction: NodejsFunction;
}

/**
 * Creates an API Gateway
 */
export default class APIStack extends cdk.Stack {
  public api: HttpApi;
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
    this.api = new HttpApi(this, `${process.env.NODE_ENV}-APIEndpoint`, {
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
        allowHeaders: ["Content-Type"],
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
    const routes = [
      {
        path: "/users/self",
        method: "GET",
        handler: props.getSelfInfoFunction,
      },
      // Users
      {
        path: `/users/{userId}`,
        method: "GET",
        handler: props.getUserByIdFunction,
      },
      {
        path: `/users/{userId}`,
        method: "PUT",
        handler: props.updateUserFunction,
      },
      {
        path: `/orgs`,
        method: "POST",
        handler: props.createOrgFunction,
      },
      {
        path: `/orgs/{orgId}`,
        method: "GET",
        handler: props.getOrgInfoFunction,
      },
      {
        path: "/orgs/{orgId}",
        method: "DELETE",
        handler: props.deleteOrgFunction,
      },
      {
        path: "/users",
        method: "GET",
        handler: props.getUsersInOrgFunction,
      },
    ];
  }
}
