<?php

namespace App\Jobs;

use App\Services\ScreenshotService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CaptureScreenshot implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public function __construct(
        protected string $modelClass,
        protected int $modelId,
        protected string $html,
    ) {}

    public function handle(ScreenshotService $screenshotService): void
    {
        try {
            $url = $screenshotService->capture($this->html);

            $model = $this->modelClass::find($this->modelId);

            if ($model) {
                $model->update(['screenshot' => $url]);
            }
        } catch (\Throwable $e) {
            Log::warning("Screenshot capture failed for {$this->modelClass}#{$this->modelId}: {$e->getMessage()}");
        }
    }
}
