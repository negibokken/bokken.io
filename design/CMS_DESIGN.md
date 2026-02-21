# CMS Design Document for bokken.io

## Overview

This document outlines the design for a bespoke Content Management System (CMS) hosted at `cms.bokken.io` to manage the Astro-based blog at `blog.bokken.io`. The system leverages GitHub as the backend for content storage and version control, ensuring a "GitOps" workflow where content changes are committed and merged to trigger deployments.

## Architecture

### Component Diagram

```mermaid
graph TD
    User[Content Author] -->|Access via Browser| CMS[CMS Frontend (React)]
    CMS -->|API Calls| API[CMS Backend (Express)]
    API -->|GitHub API (OAuth)| GH[GitHub Repository]
    GH -->|Webhook/Action| CI[CI/CD Pipeline]
    CI -->|Build & Deploy| Blog[blog.bokken.io]
```

### 1. Application: `cms.bokken.io`

The `cms/cms.bokken.io` service will be created as a full-stack application.

- **Backend**: Node.js with Express.
- **Frontend**: React (Single Page Application).
- **Hosting**: Docker container orchestrated via `docker-compose`.

### 2. Authentication

- **Method**: GitHub OAuth.
- **Authorization**: Only the GitHub user `negibokken` is permitted. Any other authenticated user receives a `403 Forbidden` response.
- **Flow**:
  1.  User clicks "Login with GitHub" on CMS.
  2.  Redirects to GitHub authorization page.
  3.  Callback to CMS backend with code.
  4.  Backend exchanges code for access token.
  5.  Backend checks that the authenticated GitHub username is `negibokken`. If not, returns `403`.
  6.  Token is stored in a secure HttpOnly cookie session.
- **Permissions**: `repo` scope is required to read/write content and manage pull requests.

### 3. Pages

#### A. Article List Page (`/`)

- Displays all articles, split into two sections:
  - **Published**: Markdown files found in `astro/src/content/blog/` on the `main` branch.
  - **Drafts**: Branches matching the pattern `cms/draft/YYYYMMDD-HHmmss` with an open associated state.
- Contains a **"Create Article"** button.
- Clicking any individual article row navigates to the **Article Edit Page** for that article.
- Clicking the **"Create Article"** button navigates to a new **Article Edit Page**.

#### B. Article Edit Page (`/edit/:branchName`)

- Provides a Markdown editor for the article body.
- Provides a form for Frontmatter fields (title, description, tags, heroImage).
- Slug is a **required** input field that determines the filename.
- Supports image attachment (see image handling below).
- Contains **"Save"** and **"Publish"** actions.

### 4. Content Management Workflow

The CMS treats the `main` branch as the "Published" state.

#### A. Creating a New Article

1.  User clicks the **"Create Article"** button on the Article List Page.
2.  The CMS generates a branch name based on the current date and time down to seconds: `cms/draft/YYYYMMDD-HHmmss` (e.g., `cms/draft/20260221-153045`).
3.  The CMS creates this branch on GitHub from `main`.
4.  The user is taken to the Article Edit Page. The **slug** field is required and determines the file path.
5.  The article file is stored at `astro/src/content/blog/YYYY-MM-DD/<slug>.md`, where `YYYY-MM-DD` is initially the draft creation date (finalized at publish time).
6.  Saving commits the current content to the draft branch.

#### B. Updating an Existing Article

1.  User clicks an article row on the Article List Page.
2.  The CMS generates a new branch name based on the current date and time down to seconds: `cms/draft/YYYYMMDD-HHmmss`.
3.  The CMS creates this branch on GitHub from `main`, copying the existing article file into it.
4.  The user edits the article on the Article Edit Page.
5.  Saving commits changes to the draft branch.
6.  On Publish, `updatedDate` in the frontmatter is set to the publish timestamp.

#### C. Image Handling

- When a user attaches an image in the editor, it is committed to `astro/src/content/blog/YYYY-MM-DD/img/<filename>` on the draft branch.
- The Markdown editor inserts a relative reference to the image.

#### D. Publishing

1.  User clicks **"Publish"** on the Article Edit Page.
2.  The CMS finalizes the content:
    - For a **new article**: sets `pubDate` to the current date/time and ensures the directory path reflects the publish date (`astro/src/content/blog/YYYY-MM-DD/` where `YYYY-MM-DD` is today).
    - For an **updated article**: sets `updatedDate` to the current date/time.
3.  The CMS commits the finalized file to the draft branch.
4.  The CMS creates a Pull Request from the draft branch to `main` and immediately merges it.
5.  The merge triggers the CI/CD pipeline, which builds and deploys `blog.bokken.io`.

### 5. Branch & File Naming Conventions

| Item            | Pattern                                       | Example                                        |
| --------------- | --------------------------------------------- | ---------------------------------------------- |
| Draft branch    | `cms/draft/YYYYMMDD-HHmmss`                   | `cms/draft/20260221-153045`                    |
| Article file    | `astro/src/content/blog/YYYY-MM-DD/<slug>.md` | `astro/src/content/blog/2026-02-21/my-post.md` |
| Image directory | `astro/src/content/blog/YYYY-MM-DD/img/`      | `astro/src/content/blog/2026-02-21/img/`       |

### 6. Technical Stack

- **Backend**:
  - `express`: Web server.
  - `octokit`: GitHub API client.
  - `cookie-session`: Session management.
- **Frontend**:
  - `react`: UI library.
  - `vite`: Build tool.
  - `react-router-dom`: Navigation.
  - `react-markdown` / `monaco-editor`: Markdown editing.
  - Plain CSS or CSS Modules for styling (no emoji in UI; use SVG icons).

## Data Structure

### Frontmatter Schema

We will adhere to the schema defined in `astro/src/content.config.ts`:

```typescript
{
  title: string;
  description: string;
  pubDate: Date;       // Set at publish time for new articles
  updatedDate?: Date;  // Set at publish time when updating an existing article
  heroImage?: string;
  tags: string[];
}
```

## Implementation Plan

1.  **Setup `cms.bokken.io`**: Initialize `package.json`, install dependencies.
2.  **Backend Implementation**:
    - Implement GitHub OAuth flow with `negibokken`-only authorization (403 for others).
    - Implement GitHub API wrappers:
      - List files on `main` branch (published articles).
      - List draft branches (`cms/draft/*`).
      - Get file content from a branch.
      - Create branch from `main`.
      - Commit file (article or image) to a branch.
      - Create and auto-merge Pull Request to `main`.
3.  **Frontend Implementation**:
    - Login Screen.
    - Article List Page: published articles + drafts, "Create Article" button.
    - Article Edit Page: Markdown editor, Frontmatter form, slug input (required), image upload, Save/Publish buttons.
4.  **Integration**: Connect Frontend to Backend API.
5.  **Deployment**: Update `docker/Dockerfile` and `docker/docker-compose.yml` to support the new build process.
