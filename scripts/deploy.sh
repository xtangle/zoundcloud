#!/usr/bin/env bash

set -e

#
# Uploads and publishes the already packaged zip file to Chrome Web Store.
# Requires the following env variables to be set:
#
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
# - GOOGLE_REFRESH_TOKEN
# - CHROME_APP_ID
#
# for testing purposes:                CHROME_APP_ID=nbfffkjnklhmplkbpjpifhmiggkpmapj
# actual (this is public knowledge):   CHROME_APP_ID=bhnpokjikdldjiimbmoakkfekcnpkkij
#
# Steps to set up Google API and obtain these tokens are taken from this web page:
# https://circleci.com/blog/continuously-deploy-a-chrome-extension/
#

echo "Publishing extension to Chrome Web Store..."

ACCESS_TOKEN="$( curl "https://accounts.google.com/o/oauth2/token" \
  -d "client_id=${GOOGLE_CLIENT_ID}&client_secret=${GOOGLE_CLIENT_SECRET}&refresh_token=${GOOGLE_REFRESH_TOKEN}&grant_type=refresh_token&redirect_uri=urn:ietf:wg:oauth:2.0:oob" \
  | jq -r .access_token )"

curl -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-goog-api-version: 2" -X PUT -T tmp/zoundcloud-*.zip -v "https://www.googleapis.com/upload/chromewebstore/v1.1/items/${CHROME_APP_ID}"
curl -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-goog-api-version: 2" -H "Content-Length: 0" -X POST -v "https://www.googleapis.com/chromewebstore/v1.1/items/${CHROME_APP_ID}/publish"

echo "Successfully published extension to Chrome Web Store"
