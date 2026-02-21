import { Octokit } from "octokit";

export const createOctokit = (accessToken: string): Octokit =>
  new Octokit({ auth: accessToken });
