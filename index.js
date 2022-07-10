import "dotenv/config.js";
import { dateLib } from "./date/index.js";
import { githubLib } from "./github/index.js";
import { notionLib } from "./notion/index.js";

const startDate = dateLib.getStartDate(process.argv[2]);

const commits = await githubLib.getCommits("ashryanbeats", "commit-getter", startDate);
console.log("Got info for %s GitHub commits.", commits.length);

const results = await notionLib.addCommits(commits);
console.log(
  `Added data for ${commits.length} GitHub commits in Notion page "${results.targetPageDetails.name}".`,
);
console.log(results.targetPageDetails.url);

process.exit();