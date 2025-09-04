import * as cdk from "aws-cdk-lib";
import { Stack, type StackProps } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import type * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import type { Construct } from "constructs";

interface KangaAppStackProps extends StackProps {
	cluster: ecs.Cluster;
	certificate: certificatemanager.Certificate;
	zone: route53.HostedZone;
}

export class KangaAppStack extends Stack {
	public readonly fargateService: ecs_patterns.ApplicationLoadBalancedFargateService;

	constructor(scope: Construct, id: string, props?: KangaAppStackProps) {
		super(scope, id, props);

		const clerkSecrets = secretsmanager.Secret.fromSecretNameV2(
			this,
			"KangaWebClerkSecrets",
			"dev/KangaWeb/Clerk",
		);

		if (!props?.certificate) {
			throw new Error("Certificate missing");
		}

		const getProductsLambda = new lambda.Function(this, "GetProductsLambda", {
			runtime: lambda.Runtime.PROVIDED_AL2023,
			handler: "bootstrap",
			code: lambda.Code.fromAsset("../packages/functions"),
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

		this.fargateService =
			new ecs_patterns.ApplicationLoadBalancedFargateService(
				this,
				"KangaFargateService",
				{
					cluster: props?.cluster,
					cpu: 256,
					memoryLimitMiB: 512,
					desiredCount: 2,
					runtimePlatform: {
						cpuArchitecture: ecs.CpuArchitecture.ARM64,
						operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
					},
					taskImageOptions: {
						image: ecs.ContainerImage.fromAsset("../packages/web"),
						containerName: "kanga-web",
						environment: {
							NODE_ENV: "production",
							API_GATEWAY: `${api.url}${products.path}`,
						},
						logDriver: new ecs.AwsLogDriver({ streamPrefix: "kanga-web-app" }),
						secrets: {
							VITE_CLERK_PUBLISHABLE_KEY: ecs.Secret.fromSecretsManager(
								clerkSecrets,
								"VITE_CLERK_PUBLISHABLE_KEY",
							),
							CLERK_SECRET_KEY: ecs.Secret.fromSecretsManager(
								clerkSecrets,
								"CLERK_SECRET_KEY",
							),
						},
						containerPort: 3000,
					},
					assignPublicIp: true,
					publicLoadBalancer: true,
					certificate: props?.certificate,
					redirectHTTP: true,
				},
			);

		if (!props?.zone) {
			throw new Error("Hosted zone is required to create alias record");
		}

		new route53.ARecord(this, "AliasRecord", {
			zone: props.zone,
			recordName: "kanga.irix.dev",
			target: route53.RecordTarget.fromAlias(
				new targets.LoadBalancerTarget(this.fargateService.loadBalancer),
			),
		});

		new cdk.CfnOutput(this, "APIGatewayURL", {
			value: api.url,
			exportName: "KangaAPIGatewayURL",
		});

		new cdk.CfnOutput(this, "LoadBalancerURL", {
			value: this.fargateService.loadBalancer.loadBalancerDnsName,
			description: "The URL of the Load Balancer",
			exportName: "KangaLoadBalancerURL",
		});
	}
}
