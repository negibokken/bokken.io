# CMS Design Document for bokken.io

## Overview

This document outlines the design for a bespoke Content Management System (CMS) integrated into `app.bokken.io` to manage the Astro-based blog at `blog.bokken.io`. The system will leverage GitHub as the backend for content storage and version control, ensuring a "GitOps" workflow where content changes are committed and merged to trigger deployments.

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

### 1. Application: `app.bokken.io`
The existing `sites/app.bokken.io` service will be expanded into a full-stack application.
- **Backend**: Node.js with Express.
- **Frontend**: React (Single Page Application).
- **Hosting**: Docker container orchestrated via `docker-compose`.

### 2. Authentication
- **Method**: GitHub OAuth.
- **Flow**:
  1.  User clicks "Login with GitHub" on CMS.
  2.  Redirects to GitHub authorization page.
  3.  Callback to CMS backend with code.
  4.  Backend exchanges code for access token.
  5.  Token is stored in a secure HttpOnly cookie session.
- **Permissions**: `repo` scope is required to read/write content and manage pull requests.

### 3. Content Management Workflow

The CMS will treat the `main` branch as the "Published" state.

#### A. Listing Articles
- **Published**: Lists Markdown files from `astro/src/content/blog` on the `main` branch.
- **Drafts**: Lists branches matching a pattern (e.g., `cms/draft/*`) or checks for open Pull Requests associated with CMS drafts.

#### B. Creating/Editing a Draft
1.  **Create**:
    - User enters title and slug.
    - CMS creates a new branch `cms/draft/<slug>` from `main`.
    - CMS creates/updates the file `astro/src/content/blog/<date>/<slug>.md` in that branch.
2.  **Edit**:
    - User edits Markdown content and Frontmatter (Title, Date, Tags, etc.).
    - "Save" commits changes to the `cms/draft/<slug>` branch.

#### C. Publishing
1.  User clicks "Publish".
2.  CMS creates a Pull Request from `cms/draft/<slug>` to `main`.
3.  CMS automatically merges the PR (or leaves it open for review if configured, but "Publish on merge" implies immediate merge).
4.  CI/CD pipeline triggers deployment of `blog.bokken.io`.

### 4. Technical Stack

- **Backend**:
  - `express`: Web server.
  - `octokit`: GitHub API client.
  - `cookie-session`: Session management.
- **Frontend**:
  - `react`: UI library.
  - `vite`: Build tool.
  - `react-router-dom`: Navigation.
  - `react-markdown` / `monaco-editor`: Markdown editing.
  - `tailwindcss` (optional) or plain CSS for styling.

## Data Structure

### Frontmatter Schema
We will adhere to the schema defined in `astro/src/content.config.ts`:
```typescript
{
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  heroImage?: string;
  tags: string[];
}
```

## Implementation Plan

1.  **Setup `app.bokken.io`**: Initialize `package.json`, install dependencies.
2.  **Backend Implementation**:
    - Implement OAuth flow.
    - Implement GitHub API wrappers (list files, get file content, create branch, commit file, create/merge PR).
3.  **Frontend Implementation**:
    - Login Screen.
    - Dashboard (List of posts).
    - Editor (Markdown + Frontmatter form).
4.  **Integration**: Connect Frontend to Backend.
5.  **Deployment**: Update `Dockerfile` and `docker-compose.yml` to support the new build process.

## Open Questions for User
1.  Do you have a preferred Markdown editor library? (e.g., simple textarea, Monaco, or a rich text-like editor).
2.  Should "Publish" immediately merge to `main`, or just open a PR for you to review and merge manually? (Requirement said "Publish on merge", implying the merge *is* the publish action).
