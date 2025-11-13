# AWS SAM Deployment

This directory contains an AWS SAM template for deploying the Kanga web application as a Lambda function.

## Prerequisites

- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) installed
- AWS credentials configured
- Node.js 22.x
- pnpm

## Architecture

The SAM template deploys:
- **Lambda Function**: Node.js 22.x runtime running the TanStack Start application (built with Nitro aws_lambda preset)
- **API Gateway HTTP API**: Routes all requests to the Lambda function
- **S3 Bucket**: Hosts static assets (assets/, _build/)
- **CloudFront Distribution**: CDN with behaviors for dynamic (Lambda) and static (S3) content

## Local Development

### Test Locally with SAM

```bash
# Run the API locally (builds first)
pnpm sam:local

# The API will be available at http://127.0.0.1:3000
```

## Deployment

### First Time Deployment

```bash
# Build and deploy with guided prompts
pnpm sam:deploy
```

This will:
1. Build your application with Vite/Nitro
2. Package the Lambda function
3. Prompt you for deployment configuration
4. Deploy the stack to AWS

### Subsequent Deployments

```bash
# Quick deployment using saved config
pnpm sam:deploy:fast

# Then deploy static assets
pnpm deploy:assets
```

### Manual Steps

```bash
# 1. Build the application
pnpm build

# 2. Build SAM artifacts
sam build

# 3. Deploy to AWS
sam deploy --guided  # First time
sam deploy           # Subsequent times

# 4. Deploy static assets to S3
./deploy.sh
```

## Environment Variables

The template includes placeholders for environment variables. Uncomment and configure in `template.yaml`:

- `CLERK_SECRET_ARN`: ARN of Clerk secrets in AWS Secrets Manager
- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `API_GATEWAY`: Backend API endpoint

## Outputs

After deployment, SAM will output:
- `ApiUrl`: API Gateway endpoint (direct Lambda access)
- `CloudFrontUrl`: CloudFront distribution URL (recommended for production)
- `AssetsBucketName`: S3 bucket name for static assets
- `FunctionArn`: Lambda function ARN

## Stack Management

```bash
# View stack outputs
aws cloudformation describe-stacks --stack-name kanga-web \
  --query 'Stacks[0].Outputs' --output table

# Delete the stack
sam delete
```

## CloudFront Cache Invalidation

After deploying new static assets, you may need to invalidate the CloudFront cache:

```bash
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name kanga-web \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
  --output text)

aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

## Monitoring

View Lambda logs:
```bash
sam logs -n KangaWebFunction --stack-name kanga-web --tail
```

## Notes

- The Lambda function uses ARM64 architecture for better performance and cost
- CloudFront caching is disabled for dynamic content (Lambda)
- Static assets are cached optimally by CloudFront
- The function has a 30-second timeout and 256MB memory (adjust in template.yaml as needed)
