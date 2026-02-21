export interface User {
  username: string;
  avatarUrl: string;
}

export const fetchMe = async (): Promise<User | null> => {
  const res = await fetch("/api/auth/me");
  if (!res.ok) return null;
  return res.json() as Promise<User>;
};

export const logout = async (): Promise<void> => {
  await fetch("/api/auth/logout", { method: "POST" });
};
