#!/usr/bin/env bash

set -e

#
# Triggers a release build in CI environment (currently Travis CI)
# Requires the following env variables to be set:
#
# - TRAVIS_TOKEN
#

function check_env_var {
  local -r ENV_VAR_NAME="${1}"
  if [[ -z "${!ENV_VAR_NAME}" ]]; then
    echo "ERROR Environment variable \"${ENV_VAR_NAME}\" is required for triggering builds on Travis CI."
    exit 1
  fi
}

function trigger_release {
  local -r owner="xtangle"
  local -r repo="zoundcloud"
  local -r branch="release-test"
  local -r commit_msg="Release build"

  read -r -d '' body <<- EOM || true
{
  "request": {
    "message": "${commit_msg}",
    "branch":"${branch}",
    "config": {
      "env": {
        "global": ["RELEASE_BUILD=true"]
      }
    }
  }
}
EOM

  local -r repo_slug="${owner}%2F${repo}"
  curl -fsS -X POST \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Travis-API-Version: 3" \
    -H "Authorization: token ${TRAVIS_TOKEN}" \
    -d "${body}" \
    https://api.travis-ci.com/repo/${repo_slug}/requests

  echo -e "\nSuccessfully triggered release build on Travis CI"
}

check_env_var TRAVIS_TOKEN
trigger_release
