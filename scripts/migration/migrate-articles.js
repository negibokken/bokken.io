import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const ARTICLES_DIR = path.resolve(__dirname, '../../sites/blog.bokken.io/articles');

if (!STRAPI_TOKEN) {
  console.error('Error: STRAPI_TOKEN environment variable is required');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

function parseMarkdown(content, dirName) {
  const lines = content.split('\n');
  let title = '';
  let tags = [];
  let createdAt = '';
  let updatedAt = '';
  const bodyLines = [];
  let inMetadata = true;

  for (const line of lines) {
    if (line.startsWith('# ') && !title) {
      title = line.replace('# ', '').trim();
      continue;
    }

    if (line.includes('@tags:')) {
      const match = line.match(/\[(.*?)\]/);
      if (match) {
        tags = match[1].split(',').map((t) => t.trim()).filter(Boolean);
      }
      continue;
    }

    if (line.includes('@date:')) {
      const match = line.match(/\[(.*?)\]/);
      if (match) {
        const dates = match[1].split(',').map((d) => d.trim());
        createdAt = dates[0];
        updatedAt = dates[1] || dates[0];
      }
      continue;
    }

    if (inMetadata && line.trim() === '') {
      continue;
    }

    if (line.startsWith('## ')) {
      inMetadata = false;
    }

    if (!inMetadata || line.startsWith('## ')) {
      inMetadata = false;
      bodyLines.push(line);
    }
  }

  const slug = `${dirName}-${title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50)}`;

  return {
    title,
    slug,
    tags,
    createdAt,
    updatedAt,
    content: bodyLines.join('\n').trim(),
  };
}

async function uploadImage(imagePath) {
  const form = new FormData();
  form.append('files', fs.createReadStream(imagePath));

  try {
    const response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: form,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Failed to upload image: ${imagePath}`, text);
      return null;
    }

    const data = await response.json();
    return data[0]?.id || null;
  } catch (error) {
    console.error(`Error uploading image: ${imagePath}`, error.message);
    return null;
  }
}

async function createOrGetTag(tagName) {
  const slug = tagName
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

  try {
    const checkResponse = await fetch(
      `${STRAPI_URL}/api/tags?filters[slug][$eq]=${encodeURIComponent(slug)}`,
      { headers }
    );
    const existing = await checkResponse.json();

    if (existing.data && existing.data.length > 0) {
      return existing.data[0].documentId;
    }

    const createResponse = await fetch(`${STRAPI_URL}/api/tags`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          name: tagName,
          slug,
        },
      }),
    });

    if (!createResponse.ok) {
      const text = await createResponse.text();
      console.error(`Failed to create tag: ${tagName}`, text);
      return null;
    }

    const newTag = await createResponse.json();
    return newTag.data?.documentId || null;
  } catch (error) {
    console.error(`Error creating tag: ${tagName}`, error.message);
    return null;
  }
}

async function migrateArticle(articleDir) {
  const dirName = path.basename(articleDir);
  const files = fs.readdirSync(articleDir);
  const mdFiles = files.filter((f) => f.endsWith('.md'));

  if (mdFiles.length === 0) {
    console.log(`No markdown files in ${articleDir}`);
    return false;
  }

  const mdPath = path.join(articleDir, mdFiles[0]);
  const content = fs.readFileSync(mdPath, 'utf-8');
  const metadata = parseMarkdown(content, dirName);

  if (!metadata.title) {
    console.log(`No title found in ${mdPath}`);
    return false;
  }

  console.log(`Migrating: ${metadata.title}`);

  const imageIds = [];
  const imgDir = path.join(articleDir, 'img');
  if (fs.existsSync(imgDir)) {
    const images = fs.readdirSync(imgDir).filter((f) =>
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f)
    );

    for (const img of images) {
      const imgPath = path.join(imgDir, img);
      console.log(`  Uploading image: ${img}`);
      const imgId = await uploadImage(imgPath);
      if (imgId) {
        imageIds.push(imgId);
      }
    }
  }

  const tagIds = [];
  for (const tagName of metadata.tags) {
    const tagId = await createOrGetTag(tagName);
    if (tagId) {
      tagIds.push(tagId);
    }
  }

  const summary = metadata.content.split('\n\n')[0]?.slice(0, 300) || '';

  const articleData = {
    data: {
      title: metadata.title,
      slug: metadata.slug,
      content: metadata.content,
      summary,
      publishedDate: metadata.createdAt,
      updatedDate: metadata.updatedAt,
      tags: tagIds,
      images: imageIds,
    },
  };

  try {
    const response = await fetch(`${STRAPI_URL}/api/articles`, {
      method: 'POST',
      headers,
      body: JSON.stringify(articleData),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Failed to create article: ${metadata.title}`, text);
      return false;
    }

    const publishResponse = await fetch(
      `${STRAPI_URL}/api/articles/${(await response.json()).data.documentId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          data: {
            publishedAt: new Date().toISOString(),
          },
        }),
      }
    );

    if (publishResponse.ok) {
      console.log(`  Success: ${metadata.title}`);
      return true;
    } else {
      console.log(`  Created (draft): ${metadata.title}`);
      return true;
    }
  } catch (error) {
    console.error(`Error creating article: ${metadata.title}`, error.message);
    return false;
  }
}

async function main() {
  console.log(`Strapi URL: ${STRAPI_URL}`);
  console.log(`Articles directory: ${ARTICLES_DIR}`);
  console.log('');

  if (!fs.existsSync(ARTICLES_DIR)) {
    console.error(`Articles directory not found: ${ARTICLES_DIR}`);
    process.exit(1);
  }

  const articleDirs = fs
    .readdirSync(ARTICLES_DIR)
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .map((d) => path.join(ARTICLES_DIR, d))
    .sort();

  console.log(`Found ${articleDirs.length} article directories`);
  console.log('');

  let success = 0;
  let failed = 0;

  for (const dir of articleDirs) {
    const result = await migrateArticle(dir);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  console.log('');
  console.log('Migration complete!');
  console.log(`  Success: ${success}`);
  console.log(`  Failed: ${failed}`);
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
