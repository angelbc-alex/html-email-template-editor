<?php

namespace App\Http\Controllers;

use App\Jobs\CaptureScreenshot;
use App\Models\Email;
use App\Models\Tag;
use App\Services\TemplateService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmailController extends Controller
{
    public function __construct(
        protected TemplateService $templateService,
    ) {}

    public function index(Request $request)
    {
        $query = Email::with('template.tags', 'creator', 'updater')->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('template_slug', 'like', "%{$search}%");
            });
        }

        if ($tagId = $request->input('tag')) {
            $query->whereHas('template.tags', fn ($q) => $q->where('tags.id', $tagId));
        }

        $emails = $query->get()->map(function (Email $email) {
            return [
                'id' => $email->id,
                'name' => $email->name,
                'template_slug' => $email->template_slug,
                'screenshot' => $email->screenshot,
                'tags' => $email->template?->tags->map(fn ($t) => [
                    'id' => $t->id,
                    'name' => $t->name,
                    'color' => $t->color,
                ])->all() ?? [],
                'created_by' => $email->creator?->name,
                'updated_by' => $email->updater?->name,
                'created_at' => $email->created_at->toISOString(),
                'updated_at' => $email->updated_at->toISOString(),
            ];
        });

        return Inertia::render('emails/index', [
            'emails' => $emails,
            'allTags' => Tag::orderBy('name')->get(),
            'filters' => [
                'search' => $search,
                'tag' => $tagId,
            ],
        ]);
    }

    public function create(string $slug)
    {
        $template = $this->templateService->find($slug);

        if (! $template) {
            abort(404);
        }

        return Inertia::render('emails/create', [
            'template' => $template,
            'template_html' => $this->templateService->getCleanContent($slug),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'template_slug' => 'required|string',
            'placeholders' => 'required|array',
        ]);

        $content = $this->templateService->getContent($validated['template_slug']);

        if (! $content) {
            abort(404);
        }

        $html = $this->templateService->render($content, $validated['placeholders']);

        $email = Email::create([
            'name' => $validated['name'],
            'template_slug' => $validated['template_slug'],
            'placeholders' => $validated['placeholders'],
            'html_content' => $html,
            'user_id' => $request->user()->id,
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        CaptureScreenshot::dispatch(Email::class, $email->id, $html);

        return redirect()->route('emails.show', $email)->with('success', 'Email created successfully.');
    }

    public function show(Email $email)
    {
        $email->load('template.tags', 'creator', 'updater');

        return Inertia::render('emails/show', [
            'email' => [
                ...$email->toArray(),
                'tags' => $email->template?->tags->map(fn ($t) => [
                    'id' => $t->id,
                    'name' => $t->name,
                    'color' => $t->color,
                ])->all() ?? [],
                'created_by_name' => $email->creator?->name,
                'updated_by_name' => $email->updater?->name,
            ],
        ]);
    }

    public function edit(Email $email)
    {
        $template = $this->templateService->find($email->template_slug);

        if (! $template) {
            abort(404, 'The template used for this email no longer exists.');
        }

        return Inertia::render('emails/edit', [
            'email' => $email,
            'template' => $template,
            'template_html' => $this->templateService->getCleanContent($email->template_slug),
        ]);
    }

    public function update(Request $request, Email $email)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'placeholders' => 'required|array',
        ]);

        $content = $this->templateService->getContent($email->template_slug);

        if (! $content) {
            abort(404);
        }

        $html = $this->templateService->render($content, $validated['placeholders']);

        $email->update([
            'name' => $validated['name'],
            'placeholders' => $validated['placeholders'],
            'html_content' => $html,
            'updated_by' => $request->user()->id,
        ]);

        CaptureScreenshot::dispatch(Email::class, $email->id, $html);

        return redirect()->route('emails.show', $email)->with('success', 'Email updated.');
    }

    public function preview(Email $email)
    {
        return response($email->html_content)->header('Content-Type', 'text/html');
    }

    public function destroy(Email $email)
    {
        $email->delete();

        return redirect()->route('emails.index')->with('success', 'Email deleted successfully.');
    }

    public function clone(Request $request, Email $email)
    {
        $clone = Email::create([
            'name' => $email->name . ' (Copy)',
            'template_slug' => $email->template_slug,
            'placeholders' => $email->placeholders,
            'html_content' => $email->html_content,
            'user_id' => $request->user()->id,
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return redirect()->route('emails.edit', $clone)->with('success', 'Email cloned.');
    }

    public function download(Email $email)
    {
        $filename = str($email->name)->slug().'.html';

        return response($email->html_content)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }
}
