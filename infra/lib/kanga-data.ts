import * as cdk from "aws-cdk-lib";
import { Stack, type StackProps } from "aws-cdk-lib";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as route53 from "aws-cdk-lib/aws-route53";
import type { Construct } from "constructs";

export class KangaDataStack extends Stack {
	public readonly productsTable: dynamodb.Table;
	public readonly basketTable: dynamodb.Table;
	public readonly ordersTable: dynamodb.Table;

	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		// Products table
		this.productsTable = new dynamodb.Table(this, "ProductsTable", {
			partitionKey: { name: "productId", type: dynamodb.AttributeType.STRING },
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			removalPolicy: cdk.RemovalPolicy.RETAIN, // Protect production data
			pointInTimeRecovery: true, // Enable backups
			tableName: "kanga_products",
		});

		// Basket table
		this.basketTable = new dynamodb.Table(this, "BasketTable", {
			partitionKey: { name: "productId", type: dynamodb.AttributeType.STRING },
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			pointInTimeRecovery: false,
			tableName: "kanga_basket",
		});
	}
}
