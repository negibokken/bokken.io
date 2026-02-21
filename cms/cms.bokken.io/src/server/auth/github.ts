import { config } from "../config.js";

export const buildAuthUrl = (state: string): string => {
  const params = new URLSearchParams({
    client_id: config.githubClientId,
    redirect_uri: config.githubCallbackUrl,
    scope: "repo",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

export const exchangeCodeForToken = async (code: string): Promise<string> => {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: config.githubClientId,
      client_secret: config.githubClientSecret,
      code,
      redirect_uri: config.githubCallbackUrl,
    }),
  });
  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
  };
  if (!data.access_token) {
    throw new Error(`Failed to exchange code: ${data.error ?? "unknown"}`);
  }
  return data.access_token;
};

export const getGithubUser = async (
  accessToken: string,
): Promise<{ login: string; avatar_url: string }> => {
  const response = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await response.json()) as { login: string; avatar_url: string };
  return data;
};
