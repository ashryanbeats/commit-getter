import { Client as Notion } from "@notionhq/client";
import { createNewChildren } from "./blocks.js";
import { getChildren, archiveChildren, appendChildren } from "./notionApi.js";
import { exitWithError } from "../lib/index.js";
const notion = new Notion({ auth: process.env.NO_SECRET });

async function addCommits(commits) {
  // Read
  const [children, error] = await getChildren(notion);
  error && exitWithError("Notion", error);

  // Remove
  const [archivedChildren, error2] = await archiveChildren(notion, children);
  error2 && exitWithError("Notion", error2);
  console.log("Archived %s blocks", archivedChildren.length);

  // Replace
  const newChildren = createNewChildren(commits, children);
  const [appendedChildren, error3] = await appendChildren(notion, newChildren);
  error3 && exitWithError("Notion", error3);

  return appendedChildren;
}

const notionLib = { notion, addCommits };

export { notionLib };
