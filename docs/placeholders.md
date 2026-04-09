# Placeholder syntax

Placeholders are special tags inside your HTML email templates that get replaced with user-provided content. They look like `{key}` in the HTML source and are automatically parsed into form fields in the email builder UI.

## Basic syntax

The simplest placeholder is just a key name in curly braces:

```html
<p>{greeting}</p>
```

This creates a plain text input labelled "Greeting".

## Attributes

Placeholders support optional attributes to control the label, description, field type, and default value.

```
{key attribute1="value" attribute2="value" booleanflag}
```

### Available attributes

| Attribute | Type | Description |
|---|---|---|
| `name` | `"string"` | Label shown in the form. Defaults to the key name, title-cased. |
| `desc` | `"string"` | Help text shown below the field. |
| `default` | `"string"` | Pre-filled value. The live preview uses this immediately. |
| `html` | boolean flag | Renders a rich text editor instead of a plain text input. |
| `imageupload` | boolean flag or `"url"` | Renders an image upload dropzone. If a URL is provided, shows an "Edit in Canva" button linking to that URL. |
| `defaultimage` | `"url"` | Alias for `default` on image fields. Sets a default image URL. |

### Quoting rules

Use **single quotes** for attribute values when the placeholder sits inside an HTML attribute (to avoid clashing with the double-quoted HTML attribute):

```html
<!-- Inside src="..." -- use single quotes -->
<img src="{heroimage imageupload='https://canva.link/abc123' name='Hero Image' desc='800x430'}">

<!-- Inside href="..." -- use single quotes -->
<a href="{ctaurl name='CTA URL' default='https://example.com'}">

<!-- Inside element content -- double quotes are fine -->
<p>{bodycopy html name="Body Text" desc="The main email content."}</p>
```

## Field type detection

The field type is determined by attributes first, then by the key name as a fallback:

| Priority | Condition | Field type |
|---|---|---|
| 1 | `imageupload` attribute present | Image dropzone (+ Canva button if URL value) |
| 2 | `html` attribute present | Rich text editor (headings, bold, italic, underline, links, lists, alignment) |
| 3 | Key contains `url`, `link`, or `href` | URL input |
| 4 | Everything else | Plain text input |

## Examples

### Plain text field

```html
<h1>{headline name="Headline" default="Breaking News"}</h1>
```

Creates a text input labelled "Headline", pre-filled with "Breaking News".

### Rich text (HTML) field

```html
<div>{bodycopy html name="Body Text" desc="The main body of the email. Supports formatting."}</div>
```

Creates a rich text editor with toolbar (H1-H3, bold, italic, underline, links, bullet/ordered lists, text alignment).

### Image with Canva integration

```html
<img src="{heroimage imageupload='https://canva.link/abc123' defaultimage='https://example.com/fallback.png' name='Hero Image' desc='800x430 image'}">
```

Shows:
- A preview of the default image on load
- An "Edit in Canva" button overlaid on hover (opens the Canva link in a new tab)
- A "Replace" button to upload a new image
- Drag-and-drop support to replace the image

### Image without Canva

```html
<img src="{bannerimage imageupload name='Banner' desc='Full-width banner image'}">
```

Shows a drag-and-drop upload zone (no Canva button).

### URL field

```html
<a href="{ctaurl name='Button URL' default='https://example.com/register' desc='Where the CTA button links to'}">
```

Creates a URL input field.

## How rendering works

When an email is saved, the system:

1. Reads the raw template HTML from the database
2. Replaces each `{key ...attributes...}` with the user-provided value using regex: `\{key(?:\s[^}]*)?\}` becomes the value
3. Stores the rendered HTML in the `emails.html_content` column
4. Dispatches a background job to capture a PNG screenshot via Browsershot

For the live preview in the editor, the frontend:

1. Receives a "clean" version of the template (attributes stripped, leaving only `{key}`)
2. Replaces `{key}` with values client-side using `String.replace()`
3. Renders the result in an iframe via `srcDoc`
4. Debounces updates by 500ms to avoid excessive re-renders

## Adding a new attribute type

To support a new placeholder attribute:

1. **Backend**: Add a regex match in `TemplateService::extractPlaceholders()` (`app/Services/TemplateService.php`)
2. **Backend**: Add the new key to the returned placeholder array
3. **Frontend**: Add the field to the `Placeholder` interface in `create.tsx`, `dashboard.tsx`, and `templates/index.tsx`
4. **Frontend**: Handle the new type in the `getFieldType()` function or add rendering logic in the form
