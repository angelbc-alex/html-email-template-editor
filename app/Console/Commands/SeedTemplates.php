<?php

namespace App\Console\Commands;

use App\Models\Template;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

#[Signature('app:seed-templates')]
#[Description('Import HTML templates from storage/app/private/templates into the database')]
class SeedTemplates extends Command
{
    public function handle(): void
    {
        $disk = Storage::disk('local');
        $files = $disk->files('templates');

        foreach ($files as $file) {
            if (! str_ends_with($file, '.html')) {
                continue;
            }

            $slug = pathinfo($file, PATHINFO_FILENAME);

            if (Template::where('slug', $slug)->exists()) {
                $this->info("Skipping {$slug} (already exists)");

                continue;
            }

            Template::create([
                'name' => str_replace('-', ' ', ucfirst($slug)),
                'slug' => $slug,
                'description' => null,
                'html_content' => $disk->get($file),
            ]);

            $this->info("Imported {$slug}");
        }

        $this->info('Done! ' . Template::count() . ' templates in database.');
    }
}
