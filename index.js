import "dotenv/config.js";
import { githubLib } from "./github/index.js";
import { notionLib } from "./notion/index.js";

const commits = await githubLib.getCommits("ashryanbeats", "commit-getter");
console.log("Got info for %s GitHub commits.", commits.length);

const response = await notionLib.addCommits(commits);
console.log(
  "Created %s blocks for %s GitHub commits in Notion.",
  response.results.length,
  commits.length
);
