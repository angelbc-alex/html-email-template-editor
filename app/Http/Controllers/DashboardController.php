<?php

namespace App\Http\Controllers;

use App\Models\Email;
use App\Services\TemplateService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected TemplateService $templateService,
    ) {}

    public function __invoke()
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'templates' => count($this->templateService->all()),
                'emails' => Email::count(),
            ],
            'recent_emails' => Email::latest()->take(5)->get(),
            'templates' => $this->templateService->all(),
        ]);
    }
}
