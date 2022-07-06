import { Sema } from "async-sema";
import { promiser } from "../lib/index.js";

const s = new Sema(1); // Allow 1 concurrent async call

const getChildren = async (notion) => {
  return await promiser(
    notion.blocks.children.list({
      block_id: process.env.NO_COMMIT_GETTER_PAGE_ID,
      page_size: 50,
    })
  );
};

const archiveChildren = async (notion, children) => {
  return await promiser(
    Promise.all(
      children.results.map(async (block) => {
        // Notion currently allows only 1 open API call at a time.
        // Running afoul of this limit results in a 409 conflict_error.
        // We use semaphore `s` to ensure that only 1 async call is open at a time.
        await s.acquire();
        try {
          console.log(s.nrWaiting() + " blocks are waiting to be archived...");

          const archivedBlock = await notion.blocks.delete({
            block_id: block.id,
          });

          return archivedBlock;
        } finally {
          s.release();
        }
      })
    )
  );
};

const appendChildren = async (notion, children) => {
  return await promiser(
    notion.blocks.children.append({
      block_id: process.env.NO_COMMIT_GETTER_PAGE_ID,
      children: children.results,
    })
  );
};

export { getChildren, archiveChildren, appendChildren };
