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

## Requirements

- PHP 8.3+
- Node.js 18+ and npm
- Composer

## Installation

```bash
# Clone the repo
git clone https://github.com/angelbc-alex/html-email-template-editor.git
cd html-email-template-editor

# Run the setup script (installs deps, creates .env, generates key, runs migrations, builds assets)
composer setup

# Install headless Chrome for auto-screenshots
npx puppeteer browsers install chrome-headless-shell

# Create the public storage symlink
php artisan storage:link

# Create your first user
php artisan tinker
> \App\Models\User::factory()->create(['name' => 'Your Name', 'email' => 'you@example.com', 'password' => 'password']);
> exit
```

### What `composer setup` does

1. `composer install` -- installs PHP dependencies
2. Copies `.env.example` to `.env` (if `.env` doesn't exist)
3. `php artisan key:generate` -- generates the app encryption key
4. `php artisan migrate --force` -- creates the SQLite database and tables
5. `npm install` -- installs Node dependencies
6. `npm run build` -- builds the frontend assets

### Configuration

The app uses **SQLite** by default -- no database server needed. The database file is created at `database/database.sqlite` during migration.

If you want to use MySQL/PostgreSQL, update the `DB_*` variables in `.env`.

## Running the app

### Development

```bash
composer dev
```

This runs three processes concurrently:
- **Laravel dev server** (`php artisan serve`) on `http://localhost:8000`
- **Queue worker** (`php artisan queue:listen`) for processing screenshot jobs
- **Vite dev server** (`npm run dev`) for hot-reloading frontend assets

### With Laravel Herd (recommended for local dev)

If you use [Laravel Herd](https://herd.laravel.com), the app is served automatically at `http://your-folder-name.test`. You only need to run:

```bash
npm run dev                        # Vite dev server
php artisan queue:listen --tries=1 # Queue worker for screenshots
```

### Production

```bash
npm run build
php artisan serve
```

Run a persistent queue worker for screenshot generation (via Supervisor, systemd, or your hosting platform's process manager).

## Importing existing templates

Place `.html` template files in `storage/app/private/templates/`, then run:

```bash
php artisan app:seed-templates
```

Or add templates through the UI at **Templates > Add Template**.

## Generating screenshots

Screenshots are captured automatically when templates or emails are created/updated (via the queue worker). To generate screenshots for existing records:

```bash
# Generate missing screenshots
php artisan app:generate-screenshots

# Force regenerate all
php artisan app:generate-screenshots --force

# Only templates or emails
php artisan app:generate-screenshots --templates
php artisan app:generate-screenshots --emails
```

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
