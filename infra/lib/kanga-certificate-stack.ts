import { Stack, type StackProps } from "aws-cdk-lib";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import type * as route53 from "aws-cdk-lib/aws-route53";
import type { Construct } from "constructs";

interface KangaCertificateStackProps extends StackProps {
	zone: route53.IHostedZone;
}

export class KangaCertificateStack extends Stack {
	public readonly cloudFrontCertificate: certificatemanager.Certificate;

	constructor(scope: Construct, id: string, props: KangaCertificateStackProps) {
		super(scope, id, props);

		// CloudFront certificate MUST be in us-east-1
		this.cloudFrontCertificate = new certificatemanager.Certificate(
			this,
			"CloudFrontCert",
			{
				domainName: "*.irix.dev",
				validation: certificatemanager.CertificateValidation.fromDns(
					props.zone,
				),
			},
		);
	}
}
