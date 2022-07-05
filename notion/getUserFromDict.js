import { readFile } from "fs/promises";
const userDict = JSON.parse(
  await readFile(new URL("../.user-dict.json", import.meta.url))
);

function getUserFromDict(commit) {
  return userDict.find((user) => user.githubLogin === commit.author.login);
}

export { getUserFromDict };
