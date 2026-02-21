import { useState, useEffect } from "react";
import { fetchArticles, ArticlesResponse } from "../api/articles.js";

export const useArticles = () => {
  const [data, setData] = useState<ArticlesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    setLoading(true);
    fetchArticles()
      .then(setData)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Unknown error"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refetch();
  }, []);

  return { data, loading, error, refetch };
};
