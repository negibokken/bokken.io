const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN;

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

export interface StrapiTag {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

export interface StrapiArticle {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  publishedDate: string;
  updatedDate: string | null;
  tags: StrapiTag[];
  featuredImage: StrapiMedia | null;
  images: StrapiMedia[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  return headers;
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${STRAPI_URL}/api${endpoint}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getArticles(): Promise<StrapiArticle[]> {
  const response = await fetchAPI<StrapiResponse<StrapiArticle[]>>(
    '/articles?populate=*&sort=publishedDate:desc&pagination[pageSize]=100'
  );
  return response.data;
}

export async function getArticleBySlug(slug: string): Promise<StrapiArticle | null> {
  const response = await fetchAPI<StrapiResponse<StrapiArticle[]>>(
    `/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`
  );
  return response.data[0] || null;
}

export async function getTags(): Promise<StrapiTag[]> {
  const response = await fetchAPI<StrapiResponse<StrapiTag[]>>(
    '/tags?sort=name:asc&pagination[pageSize]=100'
  );
  return response.data;
}

export async function getArticlesByTag(tagSlug: string): Promise<StrapiArticle[]> {
  const response = await fetchAPI<StrapiResponse<StrapiArticle[]>>(
    `/articles?filters[tags][slug][$eq]=${encodeURIComponent(tagSlug)}&populate=*&sort=publishedDate:desc`
  );
  return response.data;
}

export function getStrapiMediaUrl(media: StrapiMedia | null): string | null {
  if (!media) return null;

  if (media.url.startsWith('http')) {
    return media.url;
  }

  return `${STRAPI_URL}${media.url}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
