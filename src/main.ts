import * as core from '@actions/core';
import * as github from '@actions/github';

async function run(): Promise<void> {
  try {
    const branch = core.getInput('branch');
    const force = core.getBooleanInput('force');
    const token = core.getInput('token');

    const octokit = github.getOctokit(token);
    const { ref, repo, sha } = github.context;

    if (ref === `refs/heads/${branch}`) {
      const baseBranch = ref.replace(/^(refs\/heads\/)/, '');
      core.warning(
        `'${branch}' is already up to date with '${baseBranch}', skipping.`,
      );
      return;
    }

    const commitHash = sha.slice(0, 7);

    core.info(`Fast-forwarding '${branch}' to '${commitHash}'...`);

    try {
      await octokit.rest.git.createRef({
        ...repo,
        ref: `heads/${branch}`,
        sha,
      });
    } catch (error) {
      // Do nothing in the case of a createRef error, since in that case the ref exists,
      // and we'll be updating it next
    }

    await octokit.rest.git.updateRef({
      ...repo,
      ref: `heads/${branch}`,
      sha,
      force,
    });
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
