import { useState, useEffect } from "react";
import { fetchArticle, ArticleContent } from "../api/articles.js";

export const useArticle = (branchName: string) => {
  const [data, setData] = useState<ArticleContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!branchName) return;
    setLoading(true);
    fetchArticle(branchName)
      .then(setData)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Unknown error"),
      )
      .finally(() => setLoading(false));
  }, [branchName]);

  return { data, loading, error, setData };
};
