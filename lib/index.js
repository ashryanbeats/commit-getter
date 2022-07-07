import { readFile } from "fs/promises";
const userDict = JSON.parse(
  await readFile(new URL("../.user-dict.json", import.meta.url))
);

const promiser = (promise) => {
  if (Array.isArray(promise)) promise = Promise.all(promise);
  return promise.then((data) => [data, null]).catch((error) => [null, error]);
};

const exitWithError = (errorSource, error) => {
  console.error(error);
  console.log(
    `===\nError with ${errorSource}. Received the above error.\nExiting...`
  );
  process.exit(1);
};

const getUserFromDict = (commit) => {
  return userDict.find((user) => user.githubLogin === commit.author.login);
};

export { promiser, exitWithError, getUserFromDict };
