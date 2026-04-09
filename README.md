# Email Builder

An internal tool for marketing teams to create HTML emails from pre-built templates. Marketing users fill in placeholder fields (text, images, rich HTML) and get a ready-to-send email with a live preview.

Built with **Laravel 13**, **React 19**, **Inertia.js**, **Tailwind CSS 4**, and **shadcn/ui**.

## Features

- **Template-driven emails** -- Upload HTML email templates with `{placeholder}` tags. The system parses them into form fields automatically.
- **Live preview** -- See the email update in real-time as you fill in fields, with a debounced scaled-down preview panel.
- **Rich text editor** -- Templates can mark fields as `html` to provide a full toolbar (headings, bold/italic/underline, links, lists, alignment).
- **Image upload & Canva integration** -- Drag-and-drop image upload, or link to a Canva design for the marketing team to edit and export.
- **Auto-screenshots** -- Browsershot captures a PNG preview of every email and template automatically via queued jobs.
- **Tags** -- Colour-coded tags on templates (inherited by emails) for organisation and filtering.
- **Search & filter** -- Search by name/description and filter by tag on both template and email listing pages.
- **Audit trail** -- Tracks who created and last updated each template and email.
- **Clone & edit** -- Clone any saved email to create a variant, or re-edit the original.
- **Download** -- Download the rendered HTML or copy it to clipboard for the multimedia team.

## Quick start

```bash
# Clone
git clone <repo-url> email-builder
cd email-builder

# Install dependencies
composer install
npm install

# Environment
cp .env.example .env
php artisan key:generate

# Database (SQLite by default)
touch database/database.sqlite
php artisan migrate

# Puppeteer (for auto-screenshots)
npx puppeteer browsers install chrome-headless-shell

# Storage link
php artisan storage:link

# Create a user
php artisan tinker
> \App\Models\User::factory()->create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'password']);

# Run
composer dev
```

This starts the Laravel server, queue worker, and Vite dev server concurrently.

## Documentation

| Document | Description |
|---|---|
| [Placeholder syntax](docs/placeholders.md) | How to write template placeholders with metadata |
| [Architecture](docs/architecture.md) | System design, models, and data flow |
| [Templates guide](docs/templates.md) | How to create and manage email templates |

## Tech stack

- **Backend**: Laravel 13, PHP 8.3+, SQLite
- **Frontend**: React 19, TypeScript, Inertia.js 3, Tailwind CSS 4, shadcn/ui
- **Editor**: Tiptap (rich text)
- **Screenshots**: Spatie Browsershot + Puppeteer
- **Build**: Vite 8

## License

MIT
