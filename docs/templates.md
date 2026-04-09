# Templates guide

## What is a template?

A template is an HTML email layout with placeholder tags that the marketing team fills in to create individual emails. Templates are stored in the database with a name, slug, description, tags, and the raw HTML content.

## Creating a template

### Via the UI

1. Go to **Templates** > **Add Template**
2. Fill in the name (slug is auto-generated), description, and tags
3. Either upload an `.html` file or paste the HTML content directly
4. Click **Create Template**

A screenshot is automatically captured in the background.

### Via artisan (bulk import)

Place `.html` files in `storage/app/private/templates/` then run:

```bash
php artisan app:seed-templates
```

This creates a database record for each file (skips duplicates by slug).

## Writing template HTML

Templates are standard HTML email markup. The only special syntax is placeholder tags.

### Minimal example

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Newsletter</title>
</head>
<body>
    <h1>{headline name="Headline" default="Our Latest News"}</h1>
    <img src="{heroimage imageupload name='Hero Image' desc='800x430 banner'}" width="800">
    <div>{bodycopy html name="Body" desc="Main email content"}</div>
    <a href="{ctaurl name='Button URL' default='https://example.com'}">
        {cta name="Button Text" default="Learn More"}
    </a>
</body>
</html>
```

This creates 5 fields in the email builder:
- **Headline** -- text input, pre-filled with "Our Latest News"
- **Hero Image** -- image upload dropzone
- **Body** -- rich text editor with formatting toolbar
- **Button URL** -- URL input, pre-filled
- **Button Text** -- text input, pre-filled with "Learn More"

See [Placeholder syntax](placeholders.md) for the full reference.

## Canva integration

For image placeholders, you can link to a Canva design so the marketing team can customise it:

```html
<img src="{heroimage imageupload='https://canva.link/your-link-here' defaultimage='https://example.com/fallback.png' name='Hero Image'}">
```

The workflow:
1. Create a Canva design at the correct dimensions
2. Get the template/share link from Canva
3. Put the URL in the `imageupload` attribute
4. Optionally set a `defaultimage` as a fallback

In the email builder, the marketing user sees:
- The default image displayed immediately
- An "Edit in Canva" button on hover that opens Canva in a new tab
- A drag-and-drop zone to upload the exported image back

## Quoting rules

When a placeholder sits inside an HTML attribute (`src="..."`, `href="..."`), use **single quotes** for the placeholder's own attributes to avoid breaking the HTML:

```html
<!-- Correct: single quotes inside double-quoted attribute -->
<img src="{heroimage name='Hero' desc='Banner image'}">

<!-- Wrong: double quotes clash -->
<img src="{heroimage name="Hero" desc="Banner image"}">
```

When a placeholder is inside element content (not an attribute), either quote style works:

```html
<p>{bodycopy name="Body Text" desc="Main content"}</p>
```

## Tags

Tags are colour-coded labels for organising templates. They are managed inline on the template create/edit forms -- click existing tags to toggle them, or create new ones with a name and colour.

Emails inherit their parent template's tags automatically. Both the templates and emails listing pages can be filtered by tag.

## Screenshots

Screenshots are generated automatically whenever:
- A template is created
- A template's HTML content is updated
- An email is created or updated

Screenshots are captured asynchronously via a queued job using Browsershot (headless Chrome). Make sure a queue worker is running:

```bash
php artisan queue:listen
```

To regenerate screenshots manually:

```bash
# All missing screenshots
php artisan app:generate-screenshots

# Force regenerate everything
php artisan app:generate-screenshots --force

# Only templates or emails
php artisan app:generate-screenshots --templates
php artisan app:generate-screenshots --emails
```

## Managing templates

From the **Templates** page:

- **Use Template** -- start creating a new email from this template
- **Preview** -- opens the raw template HTML in a new tab
- **Edit** -- modify the name, description, tags, or HTML content
- **Delete** -- permanently removes the template (existing emails are not affected, but can no longer be edited)
