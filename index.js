import "dotenv/config.js";
import { Octokit } from "octokit";
import { Client as Notion } from "@notionhq/client";

const octokit = new Octokit({ auth: process.env.GH_ACCESS_TOKEN });
const notion = new Notion({ auth: process.env.NO_SECRET });

const { data: commits } = await octokit.request(
  "GET /repos/{owner}/{repo}/commits",
  {
    owner: "ashryanbeats",
    repo: "commit-getter",
  }
);

console.log("Got info for %s GitHub commits.", commits.length);

async function addCommits(commits) {
  const children = commits
    .map((commit) => {
      const paragraph = {
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: `Commit `,
              },
            },
            {
              type: "text",
              annotations: {
                code: true,
              },
              text: {
                content: `${commit.sha.substring(0, 7)}`,
              },
            },
            {
              type: "text",
              annotations: {
                bold: true,
              },
              text: {
                content: `: ${commit.commit.message}`,
              },
            },
          ],
        },
      };

      const bookmark = {
        object: "block",
        type: "bookmark",
        bookmark: {
          url: commit.html_url,
          caption: [
            {
              type: "text",
              text: {
                content: `By ${commit.commit.author.name} (${commit.author.login}) on `,
              },
            },
            {
              type: "mention",
              mention: {
                date: {
                  start: commit.commit.author.date
                }
              }
            },
          ],
        },
      };

      return [paragraph, bookmark];
    })
    .flat();

  const response = await notion.blocks.children.append({
    block_id: process.env.NO_COMMIT_GETTER_PAGE_ID,
    children,
  });
  
  console.log(
    "Created bookmarks for %s GitHub commits in Notion.",
    response.results.length
  );
}

addCommits(commits);
