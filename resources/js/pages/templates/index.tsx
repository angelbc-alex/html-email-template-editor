import { Head, Link, router } from '@inertiajs/react';
import { LayoutTemplate, MoreHorizontal, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TagBadge from '@/components/tag-badge';
import { dashboard } from '@/routes';
import { index as templatesIndex, create as templatesCreate, edit as templatesEdit, destroy as templatesDestroy } from '@/routes/templates';

interface Tag {
    id: number;
    name: string;
    color: string;
}

interface Placeholder {
    key: string;
    name: string | null;
    desc: string | null;
    imageupload: boolean | string;
    html: boolean;
    default: string | null;
}

interface Template {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    screenshot: string | null;
    placeholders: Placeholder[];
    tags: Tag[];
    created_by: string | null;
    updated_by: string | null;
    updated_at: string;
}

interface Props {
    templates: Template[];
    allTags: Tag[];
    filters: {
        search: string | null;
        tag: string | null;
    };
}

export default function TemplatesIndex({ templates, allTags, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(templatesIndex.url(), { search: search || undefined, tag: filters.tag || undefined }, { preserveState: true });
    }

    function filterByTag(tagId: number | null) {
        router.get(templatesIndex.url(), { search: filters.search || undefined, tag: tagId || undefined }, { preserveState: true });
    }

    function clearFilters() {
        setSearch('');
        router.get(templatesIndex.url(), {}, { preserveState: true });
    }

    function handleDelete(template: Template) {
        if (confirm(`Delete "${template.name}"? This cannot be undone.`)) {
            router.delete(templatesDestroy.url(template.slug));
        }
    }

    const hasFilters = filters.search || filters.tag;

    return (
        <>
            <Head title="Templates" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Email Templates</h1>
                        <p className="text-muted-foreground">Choose a template to create a new email, or manage templates.</p>
                    </div>
                    <Button asChild>
                        <Link href={templatesCreate.url()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Template
                        </Link>
                    </Button>
                </div>

                {/* Search & tag filters */}
                <div className="space-y-3">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search templates..."
                            className="pl-9"
                        />
                    </form>
                    {(allTags.length > 0 || hasFilters) && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            {allTags.map((tag) => (
                                <TagBadge
                                    key={tag.id}
                                    name={tag.name}
                                    color={tag.color}
                                    active={String(tag.id) === filters.tag}
                                    onClick={() => filterByTag(String(tag.id) === filters.tag ? null : tag.id)}
                                />
                            ))}
                            {hasFilters && (
                                <Button variant="ghost" size="sm" className="h-6" onClick={clearFilters}>
                                    <X className="mr-1 h-3 w-3" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
                        <LayoutTemplate className="text-muted-foreground mb-3 h-10 w-10" />
                        <p className="text-muted-foreground mb-1 text-sm font-medium">
                            {hasFilters ? 'No templates match your filters' : 'No templates yet'}
                        </p>
                        {hasFilters ? (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">Clear filters</Button>
                        ) : (
                            <Button asChild size="sm" className="mt-4">
                                <Link href={templatesCreate.url()}>Add Template</Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {templates.map((template) => (
                            <Card key={template.slug} className="group hover:border-primary/50 flex flex-col overflow-hidden py-0 transition-colors">
                                {template.screenshot ? (
                                    <div className="bg-muted/30 relative h-40 overflow-hidden border-b">
                                        <img
                                            src={template.screenshot}
                                            alt={template.name}
                                            className="h-full w-full object-cover object-top"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <TemplateMenu template={template} onDelete={handleDelete} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-muted/30 relative flex h-40 items-center justify-center border-b">
                                        <LayoutTemplate className="text-muted-foreground/30 h-12 w-12" />
                                        <div className="absolute top-2 right-2">
                                            <TemplateMenu template={template} onDelete={handleDelete} />
                                        </div>
                                    </div>
                                )}
                                <CardHeader className="flex-1 pt-4 pb-2">
                                    <CardTitle className="text-base">{template.name}</CardTitle>
                                    {template.description && (
                                        <CardDescription className="line-clamp-2 text-xs">{template.description}</CardDescription>
                                    )}
                                    {template.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-1">
                                            {template.tags.map((tag) => (
                                                <TagBadge key={tag.id} name={tag.name} color={tag.color} size="sm" />
                                            ))}
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <div className="flex gap-2">
                                        <Button asChild size="sm" className="flex-1">
                                            <Link href={`/emails/create/${template.slug}`}>
                                                Use Template
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm">
                                            <a href={`/templates/${template.slug}/preview`} target="_blank" rel="noreferrer">
                                                Preview
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function TemplateMenu({ template, onDelete }: { template: Template; onDelete: (t: Template) => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-7 w-7 p-0 shadow-sm">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={templatesEdit.url(template.slug)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Template
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(template)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

TemplatesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Templates', href: templatesIndex() },
    ],
};
