# Architecture

## Overview

The Email Builder is a server-rendered SPA using **Inertia.js** to bridge Laravel (backend) and React (frontend). All routing and data loading happens server-side; the frontend receives props and renders without separate API calls.

```
Browser
  |
  |-- Inertia requests (standard HTTP with X-Inertia header)
  |
Laravel (routes, controllers, middleware)
  |-- Inertia::render() --> React pages (SPA navigation)
  |-- TemplateService   --> placeholder parsing, rendering
  |-- Queue jobs        --> screenshot capture (async)
  |
Database (SQLite)
  |-- templates, emails, tags, tag_template, users
```

## Data model

```
┌──────────────┐     ┌──────────────┐     ┌──────────┐
│   templates  │────<│  tag_template │>────│   tags   │
├──────────────┤     └──────────────┘     ├──────────┤
│ id           │                          │ id       │
│ name         │                          │ name     │
│ slug (unique)│                          │ color    │
│ description  │                          └──────────┘
│ screenshot   │
│ html_content │     ┌──────────────┐
│ created_by ──│────>│    users     │
│ updated_by ──│────>│              │
│ timestamps   │     └──────────────┘
└──────┬───────┘
       │ slug = template_slug
       │
┌──────┴───────┐
│    emails    │
├──────────────┤
│ id           │
│ name         │
│ template_slug│
│ placeholders │  (JSON: key-value pairs)
│ html_content │  (rendered HTML)
│ screenshot   │
│ user_id      │
│ created_by ──│────> users
│ updated_by ──│────> users
│ timestamps   │
└──────────────┘
```

### Key relationships

- **Template -> Tags**: Many-to-many via `tag_template` pivot
- **Template -> Emails**: One-to-many via `slug` / `template_slug`
- **Email -> Template**: Belongs-to via `template_slug` (inherits the template's tags)
- **Template/Email -> Users**: `created_by` and `updated_by` foreign keys for audit trail

## Backend services

### TemplateService (`app/Services/TemplateService.php`)

The core service responsible for:

- **`all()`** / **`find(slug)`** -- Load templates from the database with tags, creator/updater eager-loaded
- **`extractPlaceholders(html)`** -- Parses `{key attr="val"}` patterns from template HTML, returns structured metadata (key, name, desc, imageupload, html, default)
- **`getCleanContent(slug)`** -- Returns template HTML with placeholder attributes stripped (only `{key}` remains), used for client-side live preview
- **`render(html, values)`** -- Replaces all `{key ...}` patterns with provided values
- **`toArray(template)`** -- Serialises a Template model with parsed placeholders and relationships for the frontend

### ScreenshotService (`app/Services/ScreenshotService.php`)

Uses Spatie Browsershot (Puppeteer + headless Chrome) to render HTML and capture PNG screenshots. Called asynchronously via the `CaptureScreenshot` queue job.

### CaptureScreenshot (`app/Jobs/CaptureScreenshot.php`)

A queued job that:
1. Receives a model class, ID, and HTML content
2. Calls `ScreenshotService::capture()` to generate a PNG
3. Updates the model's `screenshot` column with the public URL
4. Fails gracefully with a log warning (doesn't break the user flow)

## Frontend architecture

### Page structure

```
resources/js/pages/
├── dashboard.tsx           # Stats, template grid, recent emails
├── emails/
│   ├── create.tsx          # Email builder form + live preview (also handles edit)
│   ├── edit.tsx            # Re-exports create.tsx (same component, edit mode)
│   ├── index.tsx           # Email listing with search, tags, actions
│   └── show.tsx            # Email preview with actions (edit, clone, download)
└── templates/
    ├── create.tsx          # Template upload form
    ├── edit.tsx            # Template edit form
    └── index.tsx           # Template browser with search, tags, management
```

### Layout system

Inertia's `app.tsx` routes pages to layouts:

- `auth/*` pages -> `AuthLayout` (login, etc.)
- `settings/*` pages -> `AppLayout` + `SettingsLayout`
- All other pages -> `AppLayout` (sidebar navigation)

Each page exports a `.layout` property with breadcrumbs.

### Key components

| Component | Purpose |
|---|---|
| `rich-text-editor.tsx` | Tiptap-based editor with toolbar (H1-H3, B/I/U, links, lists, alignment) |
| `tag-badge.tsx` | Coloured pill badge with auto-contrasting text colour |
| `tag-input.tsx` | Tag selector + inline "New Tag" creator with colour picker |
| `ImageDropzone` (in create.tsx) | Drag-and-drop image upload with Canva button overlay |

### Live preview flow

The email builder's live preview works entirely client-side:

1. The backend sends `template_html` (cleaned, only `{key}` tags) and `template.placeholders` (with metadata)
2. As the user types, `renderedHtml` is computed via `useMemo` -- string-replacing `{key}` with values
3. A 500ms debounce delays updating `debouncedHtml` (what the iframe actually renders)
4. During the debounce, the iframe fades to 40% opacity with a spinner overlay
5. The iframe uses `srcDoc` so no server round-trip is needed

The preview panel is 40% width, scaled to 75% via CSS transform.

## Request flow

### Creating an email

```
1. User visits /emails/create/{slug}
2. EmailController::create()
   -> TemplateService::find(slug)         # load template + placeholders
   -> TemplateService::getCleanContent()  # strip attributes for frontend
   -> Inertia::render('emails/create')

3. User fills in fields, sees live preview
4. User clicks "Save Email"

5. POST /emails
6. EmailController::store()
   -> TemplateService::getContent(slug)   # raw template with attributes
   -> TemplateService::render(html, vals) # replace placeholders with values
   -> Email::create(...)                  # save to DB
   -> CaptureScreenshot::dispatch(...)    # queue screenshot job
   -> redirect to /emails/{id}
```

### Screenshot generation (async)

```
1. CaptureScreenshot job picked up by queue worker
2. ScreenshotService::capture(html)
   -> Browsershot::html(html)
   -> Renders at 800x1200 in headless Chrome
   -> Saves PNG to storage/app/public/screenshots/
3. Updates model screenshot column with public URL
```

## Artisan commands

| Command | Description |
|---|---|
| `app:seed-templates` | Import `.html` files from `storage/app/private/templates/` into the database |
| `app:generate-screenshots` | Generate missing screenshots. Use `--force` to regenerate all, `--templates` or `--emails` to target specific models |
