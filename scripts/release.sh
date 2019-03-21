#!/usr/bin/env bash

set -e

# triggers a release build in CI environment (currently Travis CI)

function trigger_release {
  local -r owner="xtangle"
  local -r repo_name="zoundcloud"
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

  local -r repo_slug="${owner}%2F${repo_name}"
  curl -fsS -X POST \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Travis-API-Version: 3" \
    -H "Authorization: token ${TRAVIS_TOKEN}" \
    -d "${body}" \
    https://api.travis-ci.com/repo/${repo_slug}/requests

  echo -e "\nSuccessfully triggered release build on Travis CI"
}

if [[ -z "${TRAVIS_TOKEN}" ]]; then
  echo "ERROR Environment variable \"TRAVIS_TOKEN\" is required for triggering builds on Travis CI."
  exit 1
fi

trigger_release
