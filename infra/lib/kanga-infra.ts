import * as cdk from "aws-cdk-lib";
import { Stack, type StackProps } from "aws-cdk-lib";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as route53 from "aws-cdk-lib/aws-route53";
import type { Construct } from "constructs";

export class KangaInfraStack extends Stack {
	public readonly vpc: ec2.Vpc;
	public readonly cluster: ecs.Cluster;
	public readonly zone: route53.HostedZone;
	public readonly certificate: certificatemanager.Certificate;

	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		this.vpc = new ec2.Vpc(this, "KangaVpc", {
			maxAzs: 3,
			natGateways: 0, // Disable NAT Gateways for LocalStack compatibility
		});

		this.cluster = new ecs.Cluster(this, "KangaCluster", {
			vpc: this.vpc,
		});

		this.zone = new route53.HostedZone(this, "irix.dev", {
			zoneName: "irix.dev",
		});

		this.certificate = new certificatemanager.Certificate(this, "KangaCert", {
			domainName: "kanga.irix.dev",
			validation: certificatemanager.CertificateValidation.fromDns(),
		});

		new route53.MxRecord(this, "KangaMxRecord", {
			zone: this.zone,
			recordName: "",
			values: [
				{
					priority: 10,
					hostName: "mx1.improvmx.com.",
				},
				{
					priority: 20,
					hostName: "mx2.improvmx.com.",
				},
			],
			ttl: cdk.Duration.minutes(5),
		});

		new route53.TxtRecord(this, "KangaTxtRecord", {
			zone: this.zone,
			recordName: "", // or "" for the root domain, or a subdomain
			values: [
				"v=spf1 include:spf.improvmx.com ~all",
				// Add more strings if needed
			],
			ttl: cdk.Duration.minutes(5),
		});
	}
}
