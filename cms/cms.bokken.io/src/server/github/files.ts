import { Octokit } from "octokit";

export interface FileContent {
  content: string;
  sha: string;
  path: string;
}

export const getFileContent = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref: string,
): Promise<FileContent | null> => {
  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      { owner, repo, path, ref },
    );
    const data = response.data as {
      content: string;
      sha: string;
      path: string;
    };
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return { content, sha: data.sha, path: data.path };
  } catch {
    return null;
  }
};

export const commitFile = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string,
  existingSha?: string,
): Promise<void> => {
  const encodedContent = Buffer.from(content).toString("base64");
  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path,
    message,
    content: encodedContent,
    branch,
    sha: existingSha,
  });
};

export const deleteFile = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  sha: string,
  message: string,
  branch: string,
): Promise<void> => {
  await octokit.request("DELETE /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path,
    message,
    sha,
    branch,
  });
};

export const listDirectory = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref: string,
): Promise<Array<{ name: string; path: string; type: string }>> => {
  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      { owner, repo, path, ref },
    );
    const data = response.data as Array<{
      name: string;
      path: string;
      type: string;
    }>;
    return data;
  } catch {
    return [];
  }
};

export interface TreeEntry {
  path: string;
  type: string;
  sha: string;
}

export const getRecursiveTree = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string,
): Promise<TreeEntry[]> => {
  const ref = await octokit.request("GET /repos/{owner}/{repo}/git/ref/{ref}", {
    owner,
    repo,
    ref: `heads/${branch}`,
  });
  const treeSha = ref.data.object.sha;
  const tree = await octokit.request(
    "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
    { owner, repo, tree_sha: treeSha, recursive: "1" },
  );
  return (
    tree.data.tree as Array<{ path?: string; type?: string; sha?: string }>
  )
    .filter((e) => e.path && e.type && e.sha)
    .map((e) => ({ path: e.path!, type: e.type!, sha: e.sha! }));
};
