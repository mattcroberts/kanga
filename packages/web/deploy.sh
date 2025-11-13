#!/bin/bash

# Build the web application
echo "Building web application..."
pnpm build

# Deploy static assets to S3
echo "Deploying static assets..."
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name kanga-web \
  --query "Stacks[0].Outputs[?OutputKey=='AssetsBucketName'].OutputValue" \
  --output text 2>/dev/null)

if [ -n "$BUCKET_NAME" ]; then
  echo "Syncing assets to $BUCKET_NAME..."
  aws s3 sync .output/public/ "s3://$BUCKET_NAME/" --delete
else
  echo "Stack not yet deployed. Assets will be uploaded after first deployment."
fi

echo "Deployment complete!"
