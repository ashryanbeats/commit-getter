import { Client as Notion } from "@notionhq/client";
const notion = new Notion({ auth: process.env.NO_SECRET });

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
                  start: commit.commit.author.date,
                },
              },
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

  return response;
}

const notionLib = { notion, addCommits };

export { notionLib };
