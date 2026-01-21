import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CreateTableCommand,
  DynamoDBClient,
  PutItemCommand,
  ResourceInUseException,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const DYNAMODB_ENDPOINT =
  process.env.DYNAMODB_ENDPOINT || "http://localhost:8050";
const SEED_DIR = "seed";

const client = new DynamoDBClient({
  endpoint: DYNAMODB_ENDPOINT,
  region: "eu-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy",
  },
});

interface TableConfig {
  TableName: string;
  KeySchema: Array<{ AttributeName: string; KeyType: string }>;
  AttributeDefinitions: Array<{ AttributeName: string; AttributeType: string }>;
  BillingMode?: string;
  ProvisionedThroughput?: {
    ReadCapacityUnits: number;
    WriteCapacityUnits: number;
  };
}

async function createTable(config: TableConfig) {
  try {
    const command = new CreateTableCommand(config);
    await client.send(command);
    console.log(`✅ Created table: ${config.TableName}`);
  } catch (error) {
    if (error instanceof ResourceInUseException) {
      console.log(
        `ℹ️  Table ${config.TableName} already exists, skipping creation`,
      );
    } else {
      throw error;
    }
  }
}

async function seedTable(tableName: string, items: Record<string, unknown>[]) {
  console.log(`📝 Seeding ${items.length} items into ${tableName}...`);

  for (const item of items) {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: marshall(item),
    });
    await client.send(command);
  }

  console.log(`✅ Seeded ${items.length} items into ${tableName}`);
}

async function seedDatabase() {
  console.log("🌱 Starting DynamoDB seed process...\n");

  const tableDirs = readdirSync(SEED_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const tableDir of tableDirs) {
    const tablePath = join(SEED_DIR, tableDir);

    console.log(`➡️  Processing table directory: ${tablePath}`);

    // Read table config
    const configPath = join(tablePath, "config.json");
    const config: TableConfig = JSON.parse(readFileSync(configPath, "utf-8"));

    // Create table
    await createTable(config);

    // Read and seed data
    const dataPath = join(tablePath, "data.json");
    const data = JSON.parse(readFileSync(dataPath, "utf-8"));

    // Support both single object and array of objects
    const items = Array.isArray(data) ? data : [data];

    await seedTable(config.TableName, items);
    console.log();
  }

  console.log("🎉 Database seeding complete!");
}

seedDatabase().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
