import { Client as Notion } from "@notionhq/client";
import { getChildren, archiveChildren, appendChildren } from "./notionApi.js";
import { getUserFromDict } from "./getUserFromDict.js";
import { exitWithError } from "../lib/index.js";
const notion = new Notion({ auth: process.env.NO_SECRET });

async function addCommits(commits) {
  const children = commits
    .map((commit) => {
      const user = getUserFromDict(commit);

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
                content: `By `,
              },
            },
            {
              type: "text",
              text: {
                content: ` (`,
              },
            },
            {
              type: "text",
              text: {
                content: `${commit.author.login}`,
                link: {
                  type: "url",
                  url: `${commit.author.html_url}`,
                },
              },
            },
            {
              type: "text",
              text: {
                content: `) on `,
              },
            },
            {
              type: "mention",
              mention: {
                date: {
                  start: commit.commit.author.date,
                },
              },
            },
          ],
        },
      };

      user
        ? bookmark.bookmark.caption.splice(1, 0, {
            type: "mention",
            mention: {
              user: {
                id: user.notionUserId,
              },
            },
          })
        : bookmark.bookmark.caption.splice(1, 0, {
            type: "text",
            text: {
              content: commit.commit.author.name,
            },
          });

      return [paragraph, bookmark];
    })
    .flat();

  const [pageChildren, error] = await getChildren(notion);
  error && exitWithError("Notion", error);

  const targetBlockIdx = pageChildren.results.findIndex((block) => {
    return (
      block.type === "heading_2" &&
      block.heading_2.rich_text[0].plain_text === "Docs"
    );
  });

  const [archivedChildren, error2] = await archiveChildren(
    notion,
    pageChildren
  );
  error2 && exitWithError("Notion", error2);

  console.log("Archived %s blocks", archivedChildren.length);

  pageChildren.results.splice(targetBlockIdx + 1, 0, ...children);

  const [appendedChildren, error3] = await appendChildren(notion, pageChildren);
  error3 && exitWithError("Notion", error3);

  return appendedChildren;
}

const notionLib = { notion, addCommits };

export { notionLib };
