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

    let refCreated = false;
    try {
      await octokit.rest.git.createRef({
        ...repo,
        ref: `refs/heads/${branch}`,
        sha,
      });
      core.info(`Created branch ${branch}`);
      refCreated = true;
    } catch (error) {
      // Do nothing in the specific case of a createRef error: if the ref already exists,
      // we'll try updating it next.
      core.info((error as Error).message);
      refCreated = false;
    }

    if (!refCreated) {
      await octokit.rest.git.updateRef({
        ...repo,
        ref: `heads/${branch}`,
        sha,
        force,
      });
      core.info(`Synced branch ${branch}`);
    }
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
