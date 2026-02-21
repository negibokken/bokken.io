const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const config = {
  githubClientId: required("GITHUB_CLIENT_ID"),
  githubClientSecret: required("GITHUB_CLIENT_SECRET"),
  githubCallbackUrl: required("GITHUB_CALLBACK_URL"),
  sessionSecret: required("SESSION_SECRET"),
  repoOwner: required("GITHUB_REPO_OWNER"),
  repoName: required("GITHUB_REPO_NAME"),
  allowedGithubUser: required("ALLOWED_GITHUB_USER"),
  port: parseInt(process.env["PORT"] ?? "3000", 10),
};
