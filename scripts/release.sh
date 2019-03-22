#!/usr/bin/env bash

set -e

#
# Triggers a release build in CI environment (currently Travis CI)
# Requires the following env variables to be set:
#
# - TRAVIS_TOKEN
#

function check_env_var {
  local -r env_var_name="${1}"
  if [[ -z "${!env_var_name}" ]]; then
    echo "ERROR Environment variable \"${env_var_name}\" is required for triggering builds on Travis CI."
    exit 1
  fi
}

function trigger_release {
  local -r owner="xtangle"
  local -r repo="zoundcloud"
  local -r branch="master"
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
