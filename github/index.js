import { Octokit } from "octokit";
const octokit = new Octokit({ auth: process.env.GH_ACCESS_TOKEN });

async function getCommits(owner, repo) {
  try {
    const { data: commits } = await octokit.request(
      "GET /repos/{owner}/{repo}/commits",
      {
        owner,
        repo,
      }
    );

    return commits;
  } catch (error) {
    console.error(error);
    console.log(
      "===\nUnable to retrieve data from GitHub. Received the above error.\nExiting..."
    );
    process.exit(1);
  }
}

const githubLib = { getCommits };

export { githubLib };
