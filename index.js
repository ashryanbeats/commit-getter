import "dotenv/config.js";
import { Octokit } from "octokit";
import { Client as Notion } from "@notionhq/client";

const octokit = new Octokit({ auth: process.env.GH_ACCESS_TOKEN });
const notion = new Notion({ auth: process.env.NO_SECRET });

const databaseId = process.env.NO_COMMIT_GETTER_DB_ID;

const {
  data: commits
} = await octokit.request('GET /repos/{owner}/{repo}/commits', {
  owner: 'ashryanbeats',
  repo: 'commit-getter'
});

console.log("Here are the URLs for %s commits:", commits.length);

commits.map(commit => console.log(`\n${commit.html_url}`));

async function addCommit(commit) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        title: {
          title: [
            {
              "text": {
                "content": commit.html_url
              }
            }
          ]
        }
      },
    });

    console.log(response);
    console.log("Success! Entry added.");
  } catch (error) {
    console.error(error.body);
  }
}

commits.map(commit => {
  addCommit(commit);
});