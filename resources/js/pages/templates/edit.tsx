import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TagInput from '@/components/tag-input';
import { dashboard } from '@/routes';
import { index as templatesIndex, update as templatesUpdate } from '@/routes/templates';

interface Tag {
    id: number;
    name: string;
    color: string;
}

interface TemplateModel {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    screenshot: string | null;
    html_content: string;
    tags: Tag[];
}

interface Props {
    template: TemplateModel;
    allTags: Tag[];
}

export default function TemplateEdit({ template, allTags: initialTags }: Props) {
    const [allTags, setAllTags] = useState(initialTags);

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        description: string;
        html_content: string;
        tags: number[];
    }>({
        name: template.name,
        description: template.description || '',
        html_content: template.html_content,
        tags: template.tags?.map((t) => t.id) ?? [],
    });

    const htmlInputRef = useRef<HTMLInputElement>(null);

    function handleHtmlFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setData('html_content', reader.result as string);
        reader.readAsText(file);
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(templatesUpdate.url(template.slug));
    }

    return (
        <>
            <Head title={`Edit ${template.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Edit Template</h1>
                    <p className="text-muted-foreground">{template.name}</p>
                </div>

                <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <Input value={template.slug} disabled className="opacity-60" />
                                <p className="text-muted-foreground text-xs">Slug cannot be changed after creation.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief description of this template..."
                                />
                                {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <TagInput
                                    allTags={allTags}
                                    selectedIds={data.tags}
                                    onChange={(ids) => setData('tags', ids)}
                                    onCreateTag={(tag) => setAllTags((prev) => [...prev, tag])}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>HTML Content</CardTitle>
                            <CardDescription>Edit the template HTML or upload a replacement file.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Button type="button" variant="outline" size="sm" onClick={() => htmlInputRef.current?.click()}>
                                    Upload HTML File
                                </Button>
                                <input
                                    ref={htmlInputRef}
                                    type="file"
                                    accept=".html,.htm"
                                    onChange={handleHtmlFile}
                                    className="hidden"
                                />
                            </div>
                            <textarea
                                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[200px] w-full rounded-md border px-3 py-2 font-mono text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                value={data.html_content}
                                onChange={(e) => setData('html_content', e.target.value)}
                                required
                            />
                            {data.html_content && (
                                <p className="text-muted-foreground text-xs">
                                    {data.html_content.length.toLocaleString()} characters
                                </p>
                            )}
                            {errors.html_content && <p className="text-destructive text-sm">{errors.html_content}</p>}
                        </CardContent>
                    </Card>

                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Saving...' : 'Update Template'}
                    </Button>
                </form>
            </div>
        </>
    );
}

TemplateEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Templates', href: templatesIndex() },
        { title: 'Edit Template' },
    ],
};
