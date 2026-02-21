import { Octokit } from "octokit";

interface BranchRef {
  name: string;
  sha: string;
}

export const listDraftBranches = async (
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<BranchRef[]> => {
  const response = await octokit.request("GET /repos/{owner}/{repo}/branches", {
    owner,
    repo,
    per_page: 100,
  });
  return response.data
    .filter((b: { name: string }) => b.name.startsWith("cms/draft/"))
    .map((b: { name: string; commit: { sha: string } }) => ({
      name: b.name,
      sha: b.commit.sha,
    }));
};

export const createBranchFromMain = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  branchName: string,
): Promise<void> => {
  const mainRef = await octokit.request(
    "GET /repos/{owner}/{repo}/git/ref/{ref}",
    { owner, repo, ref: "heads/main" },
  );
  const sha = mainRef.data.object.sha;
  await octokit.request("POST /repos/{owner}/{repo}/git/refs", {
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha,
  });
};
