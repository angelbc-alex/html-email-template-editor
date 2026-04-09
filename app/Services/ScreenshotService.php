<?php

namespace App\Services;

use Illuminate\Support\Str;
use Spatie\Browsershot\Browsershot;

class ScreenshotService
{
    public function capture(string $html, string $directory = 'screenshots'): string
    {
        $filename = $directory . '/' . Str::uuid() . '.png';
        $path = storage_path("app/public/{$filename}");

        $dir = dirname($path);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        Browsershot::html($html)
            ->setNodeBinary($this->findNode())
            ->setNpmBinary($this->findNpm())
            ->windowSize(800, 1200)
            ->deviceScaleFactor(1)
            ->waitUntilNetworkIdle()
            ->save($path);

        return asset("storage/{$filename}");
    }

    protected function findNode(): string
    {
        $result = trim(shell_exec('where node 2>NUL') ?? '');

        return $result ? explode("\n", $result)[0] : 'node';
    }

    protected function findNpm(): string
    {
        $result = trim(shell_exec('where npm 2>NUL') ?? '');
        $lines = array_filter(explode("\n", $result), fn ($l) => str_ends_with(trim($l), '.cmd'));

        return ! empty($lines) ? trim(reset($lines)) : 'npm';
    }
}
