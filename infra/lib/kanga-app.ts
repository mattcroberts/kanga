import * as cdk from "aws-cdk-lib";
import { Stack, type StackProps } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import type * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import type * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import type { Construct } from "constructs";

interface KangaAppStackProps extends StackProps {
	wildCardCertificate: certificatemanager.Certificate;
	cloudFrontCertificate: certificatemanager.Certificate;
	zone: route53.IHostedZone;
	productsTable: dynamodb.Table;
	basketTable: dynamodb.Table;
}

export class KangaAppStack extends Stack {
	public readonly webFunction: lambda.DockerImageFunction;

	constructor(scope: Construct, id: string, props?: KangaAppStackProps) {
		super(scope, id, props);

		const kangaFuncClerkSecrets = secretsmanager.Secret.fromSecretNameV2(
			this,
			"KangaFuncClerkSecrets",
			"prod/KangaFunc/Clerk",
		);

		const getProductsLambda = new lambda.Function(this, "GetProductsLambda", {
			runtime: lambda.Runtime.PROVIDED_AL2023,
			handler: "bootstrap",
			code: lambda.Code.fromAsset("../packages/functions/get-products"),
		});
		const api = new apigateway.LambdaRestApi(this, "GetProductsApi", {
			handler: getProductsLambda,
			proxy: false,
			restApiName: "GetProductsService",
		});

		const products = api.root.addResource("products");
		products.addMethod("GET");

		if (!api.url || !products.path) {
			throw new Error("No Api path");
		}

		if (!props?.zone) {
			throw new Error("Hosted zone is required to create alias record");
		}

		const webFunction = new lambda.Function(this, "KangaWebFunction", {
			runtime: lambda.Runtime.NODEJS_22_X,
			architecture: lambda.Architecture.ARM_64,
			handler: "index.handler",
			code: lambda.AssetCode.fromAsset("../packages/web/.output/server/"),
			memorySize: 256,
			timeout: cdk.Duration.seconds(30),
			environment: {
				NODE_ENV: "production",
				API_GATEWAY: `${api.url}${products.path}`,
				CLERK_SECRET_ARN: kangaFuncClerkSecrets.secretArn,
				VITE_CLERK_PUBLISHABLE_KEY: kangaFuncClerkSecrets
					.secretValueFromJson("VITE_CLERK_PUBLISHABLE_KEY")
					.unsafeUnwrap(),
			},
		});

		const alias = new lambda.Alias(this, "KangaWebFunctionAlias2", {
			aliasName: "provisioned",
			version: webFunction.currentVersion,
			// provisionedConcurrentExecutions: 1, // Keep 1 instance warm at all times
		});

		kangaFuncClerkSecrets.grantRead(webFunction);

		this.webFunction = webFunction;

		const webApi = new apigateway.LambdaRestApi(this, "KangaWebApi", {
			handler: alias,
			proxy: true,
			restApiName: "KangaWebService",
		});

		const customDomain = new apigateway.DomainName(
			this,
			"KangaWebCustomDomain",
			{
				domainName: "kanga-func.irix.dev",
				certificate: props.wildCardCertificate,
				endpointType: apigateway.EndpointType.REGIONAL,
			},
		);

		// Map the API to the custom domain
		customDomain.addBasePathMapping(webApi, {
			basePath: "",
		});

		// Create S3 bucket for static assets
		const assetsBucket = new s3.Bucket(this, "KangaAssetsBucket", {
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
		});

		// Deploy static assets to S3
		new s3deploy.BucketDeployment(this, "DeployAssets", {
			sources: [s3deploy.Source.asset("../packages/web/.output/public")],
			destinationBucket: assetsBucket,
		});

		// Create CloudFront distribution
		const distribution = new cloudfront.Distribution(
			this,
			"KangaDistribution",
			{
				defaultBehavior: {
					origin: new origins.HttpOrigin(
						customDomain.domainNameAliasDomainName,
					),
					viewerProtocolPolicy:
						cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
					cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED, // Don't cache dynamic content
					originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
				},
				additionalBehaviors: {
					"/assets/*": {
						origin: new origins.S3Origin(assetsBucket),
						viewerProtocolPolicy:
							cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
						cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
					},
					"/_build/*": {
						origin: new origins.S3Origin(assetsBucket),
						viewerProtocolPolicy:
							cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
						cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
					},
				},
				domainNames: ["kanga-func.irix.dev"],
				certificate: props.cloudFrontCertificate, // Use certificate from us-east-1
			},
		); // Create A record alias pointing to CloudFront
		new route53.ARecord(this, "WebFunctionAliasRecord", {
			zone: props.zone,
			recordName: "kanga-func.irix.dev",
			target: route53.RecordTarget.fromAlias(
				new targets.CloudFrontTarget(distribution),
			),
		});

		new route53.CnameRecord(this, "ClerkKangaFuncCnameRecord", {
			zone: props.zone,
			recordName: "clerk.kanga-func.irix.dev",
			domainName: "frontend-api.clerk.services",
			ttl: cdk.Duration.minutes(5),
		});

		new route53.CnameRecord(this, "ClerkKangaFuncAccountsCnameRecord", {
			zone: props.zone,
			recordName: "accounts.kanga-func.irix.dev",
			domainName: "accounts.clerk.services",
			ttl: cdk.Duration.minutes(5),
		});

		new route53.CnameRecord(this, "ClerkKangaFuncClkmailCnameRecord", {
			zone: props.zone,
			recordName: "clkmail.kanga-func.irix.dev",
			domainName: "mail.4wo81uqkl10p.clerk.services",
			ttl: cdk.Duration.minutes(5),
		});

		new route53.CnameRecord(this, "ClerkKangaFuncClkDomainKeyCnameRecord", {
			zone: props.zone,
			recordName: "clk._domainkey.kanga-func.irix.dev",
			domainName: "dkim1.4wo81uqkl10p.clerk.services",
			ttl: cdk.Duration.minutes(5),
		});

		new route53.CnameRecord(this, "ClerkKangaFuncClk2DomainKeyCnameRecord", {
			zone: props.zone,
			recordName: "clk2._domainkey.kanga-func.irix.dev",
			domainName: "dkim2.4wo81uqkl10p.clerk.services",
			ttl: cdk.Duration.minutes(5),
		});
	}
}
