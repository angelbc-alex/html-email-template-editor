<?php

namespace App\Http\Controllers;

use App\Jobs\CaptureScreenshot;
use App\Models\Tag;
use App\Models\Template;
use App\Services\TemplateService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TemplateController extends Controller
{
    public function __construct(
        protected TemplateService $templateService,
    ) {}

    public function index(Request $request)
    {
        $query = Template::with('tags', 'creator', 'updater');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($tagId = $request->input('tag')) {
            $query->whereHas('tags', fn ($q) => $q->where('tags.id', $tagId));
        }

        $templates = $query->latest()->get()->map(fn (Template $t) => $this->templateService->toArray($t));

        return Inertia::render('templates/index', [
            'templates' => $templates,
            'allTags' => Tag::orderBy('name')->get(),
            'filters' => [
                'search' => $search,
                'tag' => $tagId,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('templates/create', [
            'allTags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:templates,slug|regex:/^[a-z0-9-]+$/',
            'description' => 'nullable|string|max:1000',
            'html_content' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'integer|exists:tags,id',
        ]);

        $validated['created_by'] = $request->user()->id;
        $validated['updated_by'] = $request->user()->id;

        $template = Template::create($validated);

        if (! empty($validated['tags'])) {
            $template->tags()->sync($validated['tags']);
        }

        CaptureScreenshot::dispatch(Template::class, $template->id, $template->html_content);

        return redirect()->route('templates.index')->with('success', 'Template created.');
    }

    public function show(string $slug)
    {
        return redirect()->route('templates.edit', $slug);
    }

    public function edit(string $slug)
    {
        $template = Template::with('tags')->where('slug', $slug)->firstOrFail();

        return Inertia::render('templates/edit', [
            'template' => $template,
            'allTags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, string $slug)
    {
        $template = Template::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'html_content' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'integer|exists:tags,id',
        ]);

        $validated['updated_by'] = $request->user()->id;

        $htmlChanged = $template->html_content !== $validated['html_content'];

        $template->update($validated);
        $template->tags()->sync($validated['tags'] ?? []);

        if ($htmlChanged) {
            CaptureScreenshot::dispatch(Template::class, $template->id, $template->html_content);
        }

        return redirect()->route('templates.index')->with('success', 'Template updated.');
    }

    public function destroy(string $slug)
    {
        Template::where('slug', $slug)->firstOrFail()->delete();

        return redirect()->route('templates.index')->with('success', 'Template deleted.');
    }

    public function preview(string $slug)
    {
        $content = $this->templateService->getContent($slug);

        if (! $content) {
            abort(404);
        }

        return response($content)->header('Content-Type', 'text/html');
    }
}
