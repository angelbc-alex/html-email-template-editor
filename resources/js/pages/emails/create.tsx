import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useMemo, useState, useCallback, useEffect, DragEvent, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, ImagePlus, Pencil, Upload, X } from 'lucide-react';
import RichTextEditor from '@/components/rich-text-editor';
import { dashboard } from '@/routes';
import { index as templatesIndex } from '@/routes/templates';
import { store as emailsStore, update as emailsUpdate, index as emailsIndex } from '@/routes/emails';

interface Placeholder {
    key: string;
    name: string | null;
    desc: string | null;
    imageupload: boolean | string;
    html: boolean;
    default: string | null;
}

interface Template {
    slug: string;
    name: string;
    placeholders: Placeholder[];
}

interface EmailModel {
    id: number;
    name: string;
    template_slug: string;
    placeholders: Record<string, string>;
}

interface Props {
    template: Template;
    template_html: string;
    email?: EmailModel;
}

function getFieldType(p: Placeholder): 'image' | 'richtext' | 'url' | 'text' {
    if (p.imageupload) return 'image';
    if (p.html) return 'richtext';
    const key = p.key;
    if (key.includes('url') || key.includes('link') || key.includes('href')) return 'url';
    return 'text';
}

function placeholderLabel(p: Placeholder): string {
    if (p.name) return p.name;
    return p.key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/(^|\s)\S/g, (t) => t.toUpperCase());
}

function placeholderHelp(p: Placeholder): string {
    if (p.desc) return p.desc;
    return `Value for {${p.key}}`;
}

function ImageDropzone({
    value,
    onChange,
    help,
    canvaUrl,
}: {
    value: string;
    onChange: (url: string) => void;
    help: string;
    canvaUrl?: string | null;
}) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const upload = useCallback(async (file: File) => {
        setError(null);
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const xsrfToken = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
            const res = await fetch('/images/upload', {
                method: 'POST',
                headers: xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {},
                body: formData,
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message || 'Upload failed');
            }

            const { url } = await res.json();
            onChange(url);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    }, [onChange]);

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            upload(file);
        } else {
            setError('Please drop an image file');
        }
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) upload(file);
    }

    if (value) {
        return (
            <div className="space-y-2">
                <div
                    className="group bg-muted/50 relative overflow-hidden rounded-lg border"
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >
                    <img
                        src={value}
                        alt="Uploaded"
                        className="h-auto max-h-48 w-full object-contain"
                    />
                    {/* Overlay controls */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                        {canvaUrl && (
                            <a
                                href={canvaUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 rounded-lg bg-[#00C4CC] px-3 py-2 text-xs font-medium text-white shadow-md transition-colors hover:bg-[#00b0b8]"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit in Canva
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-background/90 hover:bg-background flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium shadow-md"
                        >
                            <Upload className="h-3.5 w-3.5" />
                            Replace
                        </button>
                    </div>
                    {/* Clear button always visible */}
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="bg-background/80 hover:bg-background absolute top-2 right-2 rounded-full border p-1 shadow-sm"
                    >
                        <X className="h-3 w-3" />
                    </button>
                    {/* Drag overlay */}
                    {dragging && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <p className="text-sm font-medium text-white">Drop to replace</p>
                        </div>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                {error && <p className="text-destructive text-xs">{error}</p>}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
                    dragging
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30'
                } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
            >
                {uploading ? (
                    <>
                        <Upload className="text-muted-foreground mb-2 h-8 w-8 animate-pulse" />
                        <p className="text-muted-foreground text-sm">Uploading...</p>
                    </>
                ) : (
                    <>
                        <ImagePlus className="text-muted-foreground mb-2 h-8 w-8" />
                        <p className="text-sm font-medium">
                            {canvaUrl ? 'Drop exported image here or click to browse' : 'Drop an image here or click to browse'}
                        </p>
                        <p className="text-muted-foreground text-xs">{help}</p>
                    </>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>
            {canvaUrl && (
                <a
                    href={canvaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00C4CC] px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#00b0b8]"
                >
                    <Pencil className="h-4 w-4" />
                    Edit in Canva
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
            )}
            {error && <p className="text-destructive text-xs">{error}</p>}
        </div>
    );
}

export default function EmailCreate({ template, template_html, email }: Props) {
    const isEditing = !!email;

    const initialPlaceholders: Record<string, string> = {};
    template.placeholders.forEach((p) => {
        initialPlaceholders[p.key] = (email?.placeholders?.[p.key]) ?? p.default ?? '';
    });

    const { data, setData, post, put, processing, errors } = useForm({
        name: email?.name ?? '',
        template_slug: template.slug,
        placeholders: initialPlaceholders,
    });

    const renderedHtml = useMemo(() => {
        let html = template_html;
        for (const [key, value] of Object.entries(data.placeholders)) {
            const escaped = value.replace(/\$/g, '$$$$');
            html = html.replace(new RegExp(`\\{${key}\\}`, 'g'), escaped);
        }
        return html;
    }, [template_html, data.placeholders]);

    const [debouncedHtml, setDebouncedHtml] = useState(renderedHtml);
    const [previewStale, setPreviewStale] = useState(false);

    useEffect(() => {
        setPreviewStale(true);
        const timer = setTimeout(() => {
            setDebouncedHtml(renderedHtml);
            setPreviewStale(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [renderedHtml]);

    const filledCount = Object.values(data.placeholders).filter(Boolean).length;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (isEditing) {
            put(emailsUpdate.url(email.id));
        } else {
            post(emailsStore.url());
        }
    }

    function setPlaceholder(key: string, value: string) {
        setData('placeholders', { ...data.placeholders, [key]: value });
    }

    return (
        <>
            <Head title={`${isEditing ? 'Edit' : 'Create'} Email - ${template.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{isEditing ? 'Edit' : 'Create'} Email</h1>
                        <p className="text-muted-foreground">
                            Using template: <span className="font-medium">{template.name}</span>
                            <span className="ml-2 text-xs">
                                ({filledCount}/{template.placeholders.length} fields filled)
                            </span>
                        </p>
                    </div>
                </div>

                <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_40%]">
                    {/* Left: Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Email Name</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. April Newsletter, Speaker Announcement..."
                                    required
                                />
                                {errors.name && <p className="text-destructive mt-1 text-sm">{errors.name}</p>}
                            </CardContent>
                        </Card>

                        <Card className="flex-1">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Template Fields</CardTitle>
                                <CardDescription>Fill these in and see the preview update live.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {template.placeholders.map((p) => {
                                    const fieldType = getFieldType(p);
                                    const label = placeholderLabel(p);
                                    const help = placeholderHelp(p);
                                    const filled = !!data.placeholders[p.key];
                                    return (
                                        <div key={p.key} className="space-y-1.5">
                                            <Label htmlFor={`field-${p.key}`} className="flex items-center gap-2">
                                                <span
                                                    className={`h-2 w-2 shrink-0 rounded-full transition-colors ${
                                                        filled ? 'bg-green-500' : 'bg-muted-foreground/30'
                                                    }`}
                                                />
                                                {label}
                                                <span className="text-muted-foreground font-mono text-xs font-normal">
                                                    {'{' + p.key + '}'}
                                                </span>
                                            </Label>

                                            {fieldType === 'image' ? (
                                                <ImageDropzone
                                                    value={data.placeholders[p.key] || ''}
                                                    onChange={(url) => setPlaceholder(p.key, url)}
                                                    help={help}
                                                    canvaUrl={typeof p.imageupload === 'string' ? p.imageupload : null}
                                                />
                                            ) : fieldType === 'richtext' ? (
                                                <RichTextEditor
                                                    value={data.placeholders[p.key] || ''}
                                                    onChange={(html) => setPlaceholder(p.key, html)}
                                                    placeholder={help}
                                                />
                                            ) : (
                                                <Input
                                                    id={`field-${p.key}`}
                                                    type={fieldType === 'url' ? 'url' : 'text'}
                                                    value={data.placeholders[p.key] || ''}
                                                    onChange={(e) => setPlaceholder(p.key, e.target.value)}
                                                    placeholder={help}
                                                />
                                            )}
                                            {fieldType !== 'image' && (
                                                <p className="text-muted-foreground text-xs">{help}</p>
                                            )}
                                            {errors[`placeholders.${p.key}` as keyof typeof errors] && (
                                                <p className="text-destructive text-sm">
                                                    {errors[`placeholders.${p.key}` as keyof typeof errors]}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        <Button type="submit" disabled={processing} className="w-full">
                            {processing ? 'Saving...' : isEditing ? 'Update Email' : 'Save Email'}
                        </Button>
                    </form>

                    {/* Right: Live Preview */}
                    <Card className="flex flex-col overflow-hidden py-0">
                        <CardHeader className="shrink-0 pt-4 pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">Live Preview</CardTitle>
                                <div className="flex items-center gap-2">
                                    {previewStale && (
                                        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                            <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
                                            Updating...
                                        </span>
                                    )}
                                    <span className="text-muted-foreground text-xs">
                                        {filledCount === template.placeholders.length
                                            ? 'All fields filled'
                                            : `${template.placeholders.length - filledCount} field${template.placeholders.length - filledCount !== 1 ? 's' : ''} remaining`}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative flex-1 overflow-hidden p-0">
                            <div className="h-full w-[133.33%] origin-top-left scale-75 border-t">
                                <iframe
                                    srcDoc={debouncedHtml}
                                    className={`h-[133.33%] w-full transition-opacity duration-200 ${previewStale ? 'opacity-40' : 'opacity-100'}`}
                                    title="Live Email Preview"
                                />
                            </div>
                            {previewStale && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="bg-background/80 rounded-lg px-4 py-2 shadow-sm">
                                        <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

EmailCreate.layout = (props: Props) => ({
    breadcrumbs: props.email
        ? [
            { title: 'Dashboard', href: dashboard() },
            { title: 'Emails', href: emailsIndex() },
            { title: 'Edit Email' },
        ]
        : [
            { title: 'Dashboard', href: dashboard() },
            { title: 'Templates', href: templatesIndex() },
            { title: 'Create Email' },
        ],
});
