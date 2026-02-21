import { useState, useEffect, useRef } from "react";
import { fetchArticle, ArticleContent } from "../api/articles.js";

export const useArticle = (branchName: string, filePath?: string) => {
  const [data, setData] = useState<ArticleContent | null>(null);
  const [loading, setLoading] = useState(branchName.length > 0);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const isRefreshRef = useRef(false);

  useEffect(() => {
    if (!branchName) return;
    const shouldRefresh = isRefreshRef.current;
    isRefreshRef.current = false;
    setLoading(true);
    fetchArticle(branchName, filePath, shouldRefresh)
      .then(setData)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Unknown error"),
      )
      .finally(() => setLoading(false));
  }, [branchName, filePath, refreshKey]);

  const refresh = () => {
    isRefreshRef.current = true;
    setRefreshKey((k) => k + 1);
  };

  return { data, loading, error, setData, refresh };
};
