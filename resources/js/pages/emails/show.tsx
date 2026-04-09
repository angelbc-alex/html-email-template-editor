import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Copy, CopyPlus, Download, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { index as emailsIndex, edit as emailsEdit, preview as emailsPreview, download as emailsDownload, destroy as emailsDestroy } from '@/routes/emails';
import { clone as emailsClone } from '@/routes/emails';

interface Email {
    id: number;
    name: string;
    template_slug: string;
    placeholders: Record<string, string>;
    html_content: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    email: Email;
}

export default function EmailShow({ email }: Props) {
    const [copied, setCopied] = useState(false);

    function handleCopyHtml() {
        navigator.clipboard.writeText(email.html_content).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    function handleDelete() {
        if (confirm(`Delete "${email.name}"? This cannot be undone.`)) {
            router.delete(emailsDestroy.url(email.id));
        }
    }

    return (
        <>
            <Head title={email.name} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={emailsIndex.url()}
                            className="text-muted-foreground hover:text-foreground mb-1 inline-flex items-center gap-1 text-sm"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Back to emails
                        </Link>
                        <h1 className="text-2xl font-semibold tracking-tight">{email.name}</h1>
                        <p className="text-muted-foreground text-sm">
                            Template: {email.template_slug} &middot; Created{' '}
                            {new Date(email.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" asChild>
                            <Link href={emailsEdit.url(email.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.post(emailsClone.url(email.id))}
                        >
                            <CopyPlus className="mr-2 h-4 w-4" />
                            Clone
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCopyHtml}>
                            <Copy className="mr-2 h-4 w-4" />
                            {copied ? 'Copied!' : 'Copy HTML'}
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href={emailsDownload.url(email.id)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href={emailsPreview.url(email.id)} target="_blank" rel="noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open in Tab
                            </a>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                    <Card className="overflow-hidden py-0">
                        <CardContent className="p-0">
                            <iframe
                                srcDoc={email.html_content}
                                className="h-[700px] w-full"
                                title="Email Preview"
                            />
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Placeholder Values</CardTitle>
                                <CardDescription>The values used to build this email.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {Object.entries(email.placeholders).map(([key, value]) => (
                                    <div key={key}>
                                        <p className="text-muted-foreground mb-0.5 font-mono text-xs">
                                            {'{' + key + '}'}
                                        </p>
                                        <p className="break-all text-sm">
                                            {String(value).length > 100
                                                ? String(value).substring(0, 100) + '...'
                                                : String(value) || (
                                                      <span className="text-muted-foreground italic">Empty</span>
                                                  )}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

EmailShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Emails', href: emailsIndex() },
        { title: 'View Email' },
    ],
};
