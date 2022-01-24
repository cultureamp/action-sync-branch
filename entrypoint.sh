#!/bin/sh -l
set -e

## Based on https://github.com/dfm/force-push-branch-action/blob/main/entrypoint.sh

# Get the current branch name
CURRENT_BRANCH=`git rev-parse --abbrev-ref HEAD`

# Set the path to the clone
TARGET_DIRECTORY=$(mktemp -d)
echo $TARGET_DIRECTORY

# Do it.
git checkout $BRANCH
git push --force https://x-access-token:${TOKEN}@github.com/${GITHUB_REPOSITORY} ${BRANCH}
