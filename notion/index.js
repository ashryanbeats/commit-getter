import { Client as Notion } from "@notionhq/client";
import { createNewChildren } from "./blocks.js";
import { getPageList, getChildren, archiveChildren, appendChildren } from "./notionApi.js";
import { exitWithError } from "../lib/index.js";
const notion = new Notion({ auth: process.env.NO_SECRET });

async function addCommits(commits) {
  // Find
  const [pageList, getPageListErr] = await getPageList(notion, process.env.NO_COMMIT_GETTER_DB_ID);
  getPageListErr && exitWithError("Notion", getPageListErr);

  // Read
  const targetPageId = pageList.results[0].id
  const [children, getErr] = await getChildren(notion, targetPageId);
  getErr && exitWithError("Notion", getErr);

  // Remove
  const [archivedChildren, archiveErr] = await archiveChildren(
    notion,
    children
  );
  archiveErr && exitWithError("Notion", archiveErr);
  console.log("Archived %s blocks", archivedChildren.length);

  // Replace
  const newChildren = createNewChildren(commits, children);
  const [appendedChildren, appendErr] = await appendChildren(
    notion,
    targetPageId,
    newChildren
  );
  appendErr && exitWithError("Notion", appendErr);

  return appendedChildren;
}

const notionLib = { notion, addCommits };

export { notionLib };
