#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { KangaAppStack } from "../lib/kanga-app";
import { KangaInfraStack } from "../lib/kanga-infra";

const app = new cdk.App();
const env = { account: "814588431593", region: "eu-west-2" };
const NAME = "Kanga";

const { vpc, cluster, zone, certificate } = new KangaInfraStack(
	app,
	`${NAME}-InfraStack`,
	{
		env,
	},
);

const appStack = new KangaAppStack(app, `${NAME}-AppStack`, {
	env,
	cluster,
	certificate,
	zone,
});
