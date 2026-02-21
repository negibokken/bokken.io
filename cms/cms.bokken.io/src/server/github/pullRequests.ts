import { Octokit } from "octokit";

export const createAndMergePR = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  head: string,
  title: string,
): Promise<void> => {
  const pr = await octokit.request("POST /repos/{owner}/{repo}/pulls", {
    owner,
    repo,
    title,
    head,
    base: "main",
    body: "Published from CMS",
  });
  const prNumber = pr.data.number;
  await octokit.request("PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge", {
    owner,
    repo,
    pull_number: prNumber,
    merge_method: "squash",
  });
};
