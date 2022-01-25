#!/bin/sh -l
set -euxo pipefail

## Based on https://github.com/dfm/force-push-branch-action/blob/main/entrypoint.sh

# Get the current branch name
CURRENT_BRANCH=`git rev-parse --abbrev-ref HEAD`

# Set the path to the clone
TARGET_DIRECTORY=$(mktemp -d)
echo $TARGET_DIRECTORY

# Do it.
# git checkout -b $BRANCH # production-support

git status
git branch

# git checkout master
# git branch -D production-support
git checkout -b production-support

git -c user.name='ca-branch-bot' -c user.email='ca-branch-bot' commit --allow-empty -m "Syncing production-support branch"

git push --force https://x-access-token:${TOKEN}@github.com/${GITHUB_REPOSITORY} production-support
