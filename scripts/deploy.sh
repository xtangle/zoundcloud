#!/usr/bin/env bash

set -e

echo "Publishing extension to Chrome Web Store..."

ACCESS_TOKEN=$(curl "https://accounts.google.com/o/oauth2/token" -d "client_id=${GOOGLE_API_CLIENT_ID}&client_secret=${GOOGLE_API_CLIENT_SECRET}&refresh_token=${GOOGLE_API_REFRESH_TOKEN}&grant_type=refresh_token&redirect_uri=urn:ietf:wg:oauth:2.0:oob" | jq -r .access_token)

curl -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-goog-api-version: 2" -X PUT -T tmp/zoundcloud-*.zip -v "https://www.googleapis.com/upload/chromewebstore/v1.1/items/${CHROME_APP_ID}"
curl -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-goog-api-version: 2" -H "Content-Length: 0" -X POST -v "https://www.googleapis.com/chromewebstore/v1.1/items/${CHROME_APP_ID}/publish"

echo "Finished publishing extension to Chrome Web Store"
