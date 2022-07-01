import "dotenv/config.js";
import { Octokit } from "octokit";

// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
const octokit = new Octokit({ auth: process.env.GH_ACCESS_TOKEN });

const {
  data: commits
} = await octokit.request('GET /repos/{owner}/{repo}/commits', {
  owner: 'ashryanbeats',
  repo: 'commit-getter'
});

console.log("Here are the URLs for %s commits:", commits.length);

commits.map(commit => console.log(`\n${commit.html_url}`));