#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { KangaAppStack } from "../lib/kanga-app";
import { KangaCertificateStack } from "../lib/kanga-certificate-stack";
import { KangaDataStack } from "../lib/kanga-data";
import { KangaInfraStack } from "../lib/kanga-infra";

const app = new cdk.App();
const env = { account: "814588431593", region: "eu-west-2" };
const usEast1Env = { account: "814588431593", region: "us-east-1" };
const NAME = "Kanga";

const { zone, wildCardCertificate } = new KangaInfraStack(
	app,
	`${NAME}-InfraStack`,
	{
		env,
		crossRegionReferences: true,
	},
);

// Create CloudFront certificate in us-east-1 (required by CloudFront)
const { cloudFrontCertificate } = new KangaCertificateStack(
	app,
	`${NAME}-CertificateStack`,
	{
		env: usEast1Env,
		zone,
		crossRegionReferences: true,
	},
);

const { productsTable, basketTable } = new KangaDataStack(
	app,
	`${NAME}-DataStack`,
	{
		env,
	},
);

const appStack = new KangaAppStack(app, `${NAME}-AppStack`, {
	env,
	wildCardCertificate,
	cloudFrontCertificate,
	zone,
	crossRegionReferences: true,
	productsTable,
	basketTable,
});
