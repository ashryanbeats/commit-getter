import { Octokit } from "octokit";
const octokit = new Octokit({ auth: process.env.GH_ACCESS_TOKEN });

async function getCommits(owner, repo) {
  const { data: commits } = await octokit.request(
    "GET /repos/{owner}/{repo}/commits",
    {
      owner,
      repo,
    }
  );

  return commits;
}

const githubLib = { getCommits };

export { githubLib };
