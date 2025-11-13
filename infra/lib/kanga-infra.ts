import * as cdk from "aws-cdk-lib";
import { Stack, type StackProps } from "aws-cdk-lib";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import type { Construct } from "constructs";

export class KangaInfraStack extends Stack {
	public readonly zone: route53.IHostedZone;
	public readonly wildCardCertificate: certificatemanager.Certificate;

	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		this.zone = new route53.HostedZone(this, "irix.dev", {
			zoneName: "irix.dev",
		});

		this.wildCardCertificate = new certificatemanager.Certificate(
			this,
			"KangaWildCardCert",
			{
				domainName: "*.irix.dev",
				validation: certificatemanager.CertificateValidation.fromDns(),
			},
		);

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
