<?php

namespace App\Services;

use App\Models\Template;

class TemplateService
{
    public function all(): array
    {
        return Template::with('tags', 'creator', 'updater')->latest()->get()->map(fn (Template $t) => $this->toArray($t))->all();
    }

    public function find(string $slug): ?array
    {
        $template = Template::with('tags', 'creator', 'updater')->where('slug', $slug)->first();

        return $template ? $this->toArray($template) : null;
    }

    public function getContent(string $slug): ?string
    {
        return Template::where('slug', $slug)->value('html_content');
    }

    /**
     * Get template HTML with placeholder attributes stripped,
     * leaving only simple {key} tags for client-side replacement.
     */
    public function getCleanContent(string $slug): ?string
    {
        $content = $this->getContent($slug);

        return $content ? $this->stripPlaceholderAttributes($content) : null;
    }

    /**
     * Extract placeholders with their metadata from the template HTML.
     *
     * Supports:
     *   {key}
     *   {key name="Label" desc="Description"}
     *   {key imageupload name="Label" desc="Description"}
     *   {key html name="Label" default="value"}
     */
    public function extractPlaceholders(string $htmlContent): array
    {
        $placeholders = [];
        $seen = [];

        preg_match_all('/\{([a-z][a-z0-9]*)([^}]*)\}/', $htmlContent, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $key = $match[1];

            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;

            $attrs = trim($match[2]);
            $name = null;
            $desc = null;
            $imageupload = false;
            $html = false;
            $default = null;

            if ($attrs) {
                if (preg_match('/name=["\']([^"\']*)["\']/', $attrs, $nameMatch)) {
                    $name = $nameMatch[1];
                }
                if (preg_match('/desc=["\']([^"\']*)["\']/', $attrs, $descMatch)) {
                    $desc = $descMatch[1];
                }
                if (preg_match('/\bimageupload=["\']([^"\']*)["\']/', $attrs, $iuMatch)) {
                    $imageupload = $iuMatch[1];
                } elseif (preg_match('/\bimageupload\b/', $attrs)) {
                    $imageupload = true;
                }
                if (preg_match('/\bhtml\b/', $attrs)) {
                    $html = true;
                }
                if (preg_match('/\bdefaultimage=["\']([^"\']*)["\']/', $attrs, $diMatch)) {
                    $default = $diMatch[1];
                } elseif (preg_match('/\bdefault=["\']([^"\']*)["\']/', $attrs, $defMatch)) {
                    $default = $defMatch[1];
                }
            }

            $placeholders[] = [
                'key' => $key,
                'name' => $name,
                'desc' => $desc,
                'imageupload' => $imageupload,
                'html' => $html,
                'default' => $default,
            ];
        }

        return $placeholders;
    }

    /**
     * Render the template by replacing placeholders (with any attributes) with values.
     */
    public function render(string $htmlContent, array $values): string
    {
        foreach ($values as $key => $value) {
            $htmlContent = preg_replace('/\{' . preg_quote($key, '/') . '(?:\s[^}]*)?\}/', $value, $htmlContent);
        }

        return $htmlContent;
    }

    /**
     * Strip placeholder attributes, leaving only simple {key} tags.
     */
    public function stripPlaceholderAttributes(string $htmlContent): string
    {
        return preg_replace('/\{([a-z][a-z0-9]*)\s+[^}]*\}/', '{$1}', $htmlContent);
    }

    public function toArray(Template $template): array
    {
        return [
            'id' => $template->id,
            'slug' => $template->slug,
            'name' => $template->name,
            'description' => $template->description,
            'screenshot' => $template->screenshot,
            'placeholders' => $this->extractPlaceholders($template->html_content),
            'tags' => $template->relationLoaded('tags') ? $template->tags->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'color' => $t->color,
            ])->all() : [],
            'created_by' => $template->relationLoaded('creator') && $template->creator ? $template->creator->name : null,
            'updated_by' => $template->relationLoaded('updater') && $template->updater ? $template->updater->name : null,
            'updated_at' => $template->updated_at?->toISOString(),
        ];
    }
}
