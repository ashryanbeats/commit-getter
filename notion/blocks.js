import { getUserFromDict } from "../lib/index.js";

const createNewChildren = (commits, children) => {
  const commitBlocks = createCommitBlocks(commits);
  const insertIdx = findInsertIdx(children);
  children.results.splice(insertIdx, 0, ...commitBlocks);

  return children;
};

const createCommitBlocks = (commits) => {
  const commitBlocks = commits.map((commit) => {
    const commitPar = createCommitPar(commit);
    const commitBookmark = createCommitBookmark(commit);

    return [commitPar, commitBookmark];
  });

  return commitBlocks.flat();
};

const createCommitPar = (commit) => {
  return {
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
};

const createCommitBookmark = (commit) => {
  const commitBookmark = {
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

  return insertUserMentionOrName(commit, commitBookmark);
};

const insertUserMentionOrName = (commit, commitBookmark) => {
  const user = getUserFromDict(commit);

  user
    ? commitBookmark.bookmark.caption.splice(1, 0, {
        type: "mention",
        mention: {
          user: {
            id: user.notionUserId,
          },
        },
      })
    : commitBookmark.bookmark.caption.splice(1, 0, {
        type: "text",
        text: {
          content: commit.commit.author.name,
        },
      });

  return commitBookmark;
};

const findInsertIdx = (blocks) => {
  const targetBlockIdx = blocks.results.findIndex((block) => {
    return (
      block.type === "heading_2" &&
      block.heading_2.rich_text[0].plain_text === "Docs"
    );
  });

  return targetBlockIdx + 1;
};

export { createNewChildren };
