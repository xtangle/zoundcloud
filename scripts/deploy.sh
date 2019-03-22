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
# For reference documentation on Google Chrome Web Store API, see here:
# https://developer.chrome.com/webstore/using_webstore_api
#

function check_env_var {
  local -r env_var_name="${1}"
  local -r err_msg="${2-ERROR Environment variable \"${env_var_name}\" is required for publishing to Chrome Web Store.}"
  if [[ -z "${!env_var_name}" ]]; then
    echo "${err_msg}"
    exit 1
  fi
}

function publish {
  echo "Publishing extension to Chrome Web Store..."

  local -r access_token="$( curl "https://accounts.google.com/o/oauth2/token" \
    -d "client_id=${GOOGLE_CLIENT_ID}&client_secret=${GOOGLE_CLIENT_SECRET}&refresh_token=${GOOGLE_REFRESH_TOKEN}&grant_type=refresh_token&redirect_uri=urn:ietf:wg:oauth:2.0:oob" \
    | jq -r .access_token )"

  check_env_var access_token "Unable to fetch access token from Google Accounts API"

  curl -fsS -X PUT -T tmp/zoundcloud-*.zip \
    -H "Authorization: Bearer ${access_token}" \
    -H "x-goog-api-version: 2" \
    -v "https://www.googleapis.com/upload/chromewebstore/v1.1/items/${CHROME_APP_ID}"

  curl -fsS -X POST \
    -H "Authorization: Bearer ${access_token}" \
    -H "x-goog-api-version: 2" \
    -H "Content-Length: 0" \
    -H "publishTarget: trustedTesters" \
    -v "https://www.googleapis.com/chromewebstore/v1.1/items/${CHROME_APP_ID}/publish"

  echo -e "\nSuccessfully published extension to Chrome Web Store"
}

check_env_var GOOGLE_CLIENT_ID
check_env_var GOOGLE_CLIENT_SECRET
check_env_var GOOGLE_REFRESH_TOKEN
check_env_var CHROME_APP_ID
publish
