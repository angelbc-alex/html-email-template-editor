import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { CopyPlus, Download, Eye, FileText, Mail, MoreHorizontal, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { index as emailsIndex, show as emailsShow, edit as emailsEdit, download as emailsDownload, destroy as emailsDestroy, clone as emailsClone } from '@/routes/emails';
import { index as templatesIndex } from '@/routes/templates';

interface Tag {
    id: number;
    name: string;
    color: string;
}

interface Email {
    id: number;
    name: string;
    template_slug: string;
    screenshot: string | null;
    tags: Tag[];
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    emails: Email[];
    allTags: Tag[];
    filters: {
        search: string | null;
        tag: string | null;
    };
}

export default function EmailsIndex({ emails, allTags, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(emailsIndex.url(), { search: search || undefined, tag: filters.tag || undefined }, { preserveState: true });
    }

    function filterByTag(tagId: number | null) {
        router.get(emailsIndex.url(), { search: filters.search || undefined, tag: tagId || undefined }, { preserveState: true });
    }

    function clearFilters() {
        setSearch('');
        router.get(emailsIndex.url(), {}, { preserveState: true });
    }

    function handleDelete(email: Email) {
        if (confirm(`Delete "${email.name}"? This cannot be undone.`)) {
            router.delete(emailsDestroy.url(email.id));
        }
    }

    const hasFilters = filters.search || filters.tag;

    return (
        <>
            <Head title="Saved Emails" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Saved Emails</h1>
                        <p className="text-muted-foreground">All emails you've built from templates.</p>
                    </div>
                    <Button asChild>
                        <Link href={templatesIndex.url()}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Email
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
                            placeholder="Search emails..."
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

                {emails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
                        <Mail className="text-muted-foreground mb-3 h-10 w-10" />
                        <p className="text-muted-foreground mb-1 text-sm font-medium">
                            {hasFilters ? 'No emails match your filters' : 'No emails yet'}
                        </p>
                        {hasFilters ? (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">Clear filters</Button>
                        ) : (
                            <>
                                <p className="text-muted-foreground mb-4 text-xs">Create your first email from a template.</p>
                                <Button asChild size="sm">
                                    <Link href={templatesIndex.url()}>Browse Templates</Link>
                                </Button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {emails.map((email) => (
                            <Card key={email.id} className="hover:bg-muted/30 py-0 transition-colors">
                                <CardContent className="flex items-center gap-4 py-3">
                                    {email.screenshot ? (
                                        <div className="bg-muted/50 h-12 w-20 shrink-0 overflow-hidden rounded-md border">
                                            <img src={email.screenshot} alt="" className="h-full w-full object-cover object-top" />
                                        </div>
                                    ) : (
                                        <div className="bg-primary/10 text-primary shrink-0 rounded-lg p-2.5">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={emailsShow.url(email.id)}
                                                className="hover:underline truncate text-sm font-medium"
                                            >
                                                {email.name}
                                            </Link>
                                            {email.tags.map((tag) => (
                                                <TagBadge
                                                    key={tag.id}
                                                    name={tag.name}
                                                    color={tag.color}
                                                    size="sm"
                                                    onClick={() => filterByTag(tag.id)}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-muted-foreground text-xs">
                                            {email.template_slug}
                                            {email.created_by && <> &middot; by {email.created_by}</>}
                                            {' '}&middot;{' '}
                                            {new Date(email.created_at).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={emailsEdit.url(email.id)}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={emailsDownload.url(email.id)}>
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={emailsShow.url(email.id)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={emailsEdit.url(email.id)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => router.post(emailsClone.url(email.id))}
                                                >
                                                    <CopyPlus className="mr-2 h-4 w-4" />
                                                    Clone
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <a href={emailsDownload.url(email.id)}>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download HTML
                                                    </a>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(email)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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

EmailsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Emails', href: emailsIndex() },
    ],
};
