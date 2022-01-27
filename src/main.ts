import * as core from '@actions/core';
import * as github from '@actions/github';
import { RequestError } from '@octokit/types';

async function run(): Promise<void> {
  // try {
  const token = core.getInput('token');
  const branch = core.getInput('branch');
  const sha = core.getInput('sha');
  const force = core.getBooleanInput('force');

  const octokit = github.getOctokit(token);
  const { repo } = github.context;

  // if (ref === `refs/heads/${branch}`) {
  //   const baseBranch = ref.replace(/^(refs\/heads\/)/, '');
  //   core.warning(
  //     `'${branch}' is already up to date with '${baseBranch}', skipping.`,
  //   );
  //   return;
  // }

  const commitHash = sha.slice(0, 7);

  core.info(
    `Moving '${branch}' to '${commitHash}' (force: ${String(force)})...`,
  );

  // Let's worry about this later

  let missingBranch = false;
  try {
    await octokit.rest.git.getRef({
      ...repo,
      ref: `heads/${branch}`,
    });
  } catch (error) {
    const requestError = error as RequestError;
    if (requestError.status === 404) {
      missingBranch = true;
    }
  }

  try {
    if (missingBranch) {
      await octokit.rest.git.createRef({
        ...repo,
        ref: `heads/${branch}`,
        sha,
      });
    } else {
      await octokit.rest.git.updateRef({
        ...repo,
        ref: `heads/${branch}`,
        sha,
        force,
      });
    }
  } catch (error) {
    if (force) {
      core.setFailed((error as Error).message);
    } else {
      core.info((error as Error).message);
    }
  }

  // await octokit.rest.git.createRef({
  //   ...repo,
  //   ref: `refs/heads/production-support/${branch}`,
  //   sha,
  // });
  // core.info(`Created branch ${branch}`);

  // } catch (error) {
  //   core.setFailed((error as Error).message);
  // }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
