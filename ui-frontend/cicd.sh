#!/bin/bash
set -e

npm run build
aws s3 sync build/ s3://us-east-1-487910207927-cf-static-resources-cognito
aws cloudfront create-invalidation --distribution-id E19X6PLQVEUXQZ --paths "/*"

sleep 5

aws cloudfront list-invalidations --distribution-id E19X6PLQVEUXQZ --output json | jq .InvalidationList.Items[0].Status