import { readFile } from "fs/promises";
const userDict = JSON.parse(
  await readFile(new URL("../.user-dict.json", import.meta.url))
);

function getUserFromDict(githubLogin) {
  return userDict.find((user) => user.githubLogin === githubLogin);
}

export { getUserFromDict };
