import { Head, Link } from '@inertiajs/react';
import { FileText, LayoutTemplate, Mail, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { index as templatesIndex } from '@/routes/templates';
import { index as emailsIndex, show as emailsShow } from '@/routes/emails';

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
    description: string | null;
    screenshot: string | null;
    placeholders: Placeholder[];
}

interface Email {
    id: number;
    name: string;
    template_slug: string;
    created_at: string;
}

interface Props {
    stats: {
        templates: number;
        emails: number;
    };
    recent_emails: Email[];
    templates: Template[];
}

export default function Dashboard({ stats, recent_emails, templates }: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Email Builder</h1>
                    <p className="text-muted-foreground">Create HTML emails from templates for the multimedia team.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Templates</CardTitle>
                            <LayoutTemplate className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.templates}</div>
                            <p className="text-muted-foreground text-xs">Available email templates</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Emails Created</CardTitle>
                            <Mail className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.emails}</div>
                            <p className="text-muted-foreground text-xs">Total emails built</p>
                        </CardContent>
                    </Card>
                    <Card className="border-dashed">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
                            <Plus className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Button asChild size="sm">
                                <Link href={templatesIndex.url()}>Browse Templates</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {templates.length > 0 && (
                    <div>
                        <h2 className="mb-3 text-lg font-semibold">Templates</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {templates.map((template) => (
                                <Card key={template.slug} className="group hover:border-primary/50 overflow-hidden py-0 transition-colors">
                                    {template.screenshot && (
                                        <div className="bg-muted/30 h-32 overflow-hidden border-b">
                                            <img
                                                src={template.screenshot}
                                                alt={template.name}
                                                className="h-full w-full object-cover object-top"
                                            />
                                        </div>
                                    )}
                                    <CardHeader className="pt-4">
                                        <CardTitle className="text-base">{template.name}</CardTitle>
                                        <CardDescription>
                                            {template.placeholders.length} field{template.placeholders.length !== 1 ? 's' : ''} to fill in
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <Button asChild size="sm" className="w-full">
                                            <Link href={`/emails/create/${template.slug}`}>
                                                Use Template
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {recent_emails.length > 0 && (
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Recent Emails</h2>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={emailsIndex.url()}>View all</Link>
                            </Button>
                        </div>
                        <div className="grid gap-2">
                            {recent_emails.map((email) => (
                                <Link
                                    key={email.id}
                                    href={emailsShow.url(email.id)}
                                    className="hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                                >
                                    <FileText className="text-muted-foreground h-5 w-5 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{email.name}</p>
                                        <p className="text-muted-foreground text-xs">
                                            {email.template_slug} &middot;{' '}
                                            {new Date(email.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
