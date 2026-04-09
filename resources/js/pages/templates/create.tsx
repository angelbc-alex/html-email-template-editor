import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useRef, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TagInput from '@/components/tag-input';
import { dashboard } from '@/routes';
import { index as templatesIndex, store as templatesStore } from '@/routes/templates';

interface Tag {
    id: number;
    name: string;
    color: string;
}

interface Props {
    allTags: Tag[];
}

export default function TemplateCreate({ allTags: initialTags }: Props) {
    const [allTags, setAllTags] = useState(initialTags);

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        slug: string;
        description: string;
        tags: number[];
        html_content: string;
    }>({
        name: '',
        slug: '',
        description: '',
        tags: [],
        html_content: '',
    });

    const htmlInputRef = useRef<HTMLInputElement>(null);

    function handleNameChange(name: string) {
        setData((prev) => ({
            ...prev,
            name,
            slug: name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, ''),
        }));
    }

    function handleHtmlFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setData('html_content', reader.result as string);
        reader.readAsText(file);
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(templatesStore.url(), {
            forceFormData: true,
        });
    }

    return (
        <>
            <Head title="Add Template" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Add Template</h1>
                    <p className="text-muted-foreground">Upload an HTML email template.</p>
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
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="e.g. CS International Speaker Announcement"
                                    required
                                />
                                {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="cs-speaker-announcement"
                                    required
                                />
                                <p className="text-muted-foreground text-xs">URL-friendly identifier. Auto-generated from name.</p>
                                {errors.slug && <p className="text-destructive text-sm">{errors.slug}</p>}
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
                            <CardDescription>Upload an HTML file or paste the content directly.</CardDescription>
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
                                placeholder="Paste HTML content here or upload a file above..."
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
                        {processing ? 'Saving...' : 'Create Template'}
                    </Button>
                </form>
            </div>
        </>
    );
}

TemplateCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Templates', href: templatesIndex() },
        { title: 'Add Template' },
    ],
};
