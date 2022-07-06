import { Client as Notion } from "@notionhq/client";
import { Sema } from "async-sema";
import { getUserFromDict } from "./getUserFromDict.js";
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

  try {
    const response = await notion.blocks.children.list({
      block_id: process.env.NO_COMMIT_GETTER_PAGE_ID,
      page_size: 50,
    });

    const targetBlockIdx = response.results.findIndex((block) => {
      return (
        block.type === "heading_2" &&
        block.heading_2.rich_text[0].plain_text === "Docs"
      );
    });

    // console.dir(response, {depth: null});

    const s = new Sema(
      1, // Allow 1 concurrent async calls
      {
        capacity: 100 // Prealloc space for 100 tokens
      }
    );

    const response2 = await Promise.all(response.results.map(async (block) => {
      await s.acquire()
      try {
        console.log(s.nrWaiting() + ' calls to fetch are waiting')
        // ... do some async stuff with x
        const deleted = await notion.blocks.delete({ block_id: block.id });
        return deleted;
      } finally {
        s.release();
      }
    }));

    console.log("Archived %s blocks", response2.length);

    response.results.splice(targetBlockIdx + 1, 0, ...children);

    const response3 = await notion.blocks.children.append({
      block_id: process.env.NO_COMMIT_GETTER_PAGE_ID,
      children: response.results,
    });

    return response3;
  } catch (error) {
    console.error(error);
    console.log(
      "===\nError posting data to Notion. Received the above error.\nExiting..."
    );
    process.exit(1);
  }
}

const notionLib = { notion, addCommits };

export { notionLib };
