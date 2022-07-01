import "dotenv/config.js";
import { Octokit } from "octokit";
import { Client as Notion } from "@notionhq/client";

const octokit = new Octokit({ auth: process.env.GH_ACCESS_TOKEN });
const notion = new Notion({ auth: process.env.NO_SECRET });

const {
  data: commits
} = await octokit.request('GET /repos/{owner}/{repo}/commits', {
  owner: 'ashryanbeats',
  repo: 'commit-getter'
});

console.log("Got URLs for %s GitHub commits.", commits.length);
// commits.map(commit => console.log(`\n${commit.html_url}`));

async function addCommits(commits) {
  const children = commits.map(commit => {
    return {
      object: "block",
      type: "bookmark",
      bookmark: {
        url: commit.html_url
      }
    }
  });

  const response = await notion.blocks.children.append({
    block_id: process.env.NO_COMMIT_GETTER_PAGE_ID,
    children
  });
  console.log("Created bookmarks for %s GitHub commits in Notion.", response.results.length);
};

addCommits(commits);