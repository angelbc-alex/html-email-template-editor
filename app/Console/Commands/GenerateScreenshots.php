<?php

namespace App\Console\Commands;

use App\Models\Email;
use App\Models\Template;
use App\Services\ScreenshotService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:generate-screenshots {--templates} {--emails} {--all} {--force}')]
#[Description('Generate screenshots for templates and/or emails')]
class GenerateScreenshots extends Command
{
    public function handle(ScreenshotService $screenshotService): void
    {
        $doTemplates = $this->option('templates') || $this->option('all');
        $doEmails = $this->option('emails') || $this->option('all');
        $force = $this->option('force');

        if (! $doTemplates && ! $doEmails) {
            $doTemplates = $doEmails = true;
        }

        if ($doTemplates) {
            $query = Template::query();
            if (! $force) {
                $query->whereNull('screenshot');
            }

            $templates = $query->get();
            $this->info("Processing {$templates->count()} templates...");

            foreach ($templates as $template) {
                try {
                    $url = $screenshotService->capture($template->html_content);
                    $template->update(['screenshot' => $url]);
                    $this->info("  {$template->slug}: OK");
                } catch (\Throwable $e) {
                    $this->error("  {$template->slug}: {$e->getMessage()}");
                }
            }
        }

        if ($doEmails) {
            $query = Email::query();
            if (! $force) {
                $query->whereNull('screenshot');
            }

            $emails = $query->get();
            $this->info("Processing {$emails->count()} emails...");

            foreach ($emails as $email) {
                try {
                    $url = $screenshotService->capture($email->html_content);
                    $email->update(['screenshot' => $url]);
                    $this->info("  #{$email->id} {$email->name}: OK");
                } catch (\Throwable $e) {
                    $this->error("  #{$email->id} {$email->name}: {$e->getMessage()}");
                }
            }
        }

        $this->info('Done!');
    }
}
