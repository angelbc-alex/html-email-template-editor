import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TagBadge from '@/components/tag-badge';

interface Tag {
    id: number;
    name: string;
    color: string;
}

const PRESET_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
    '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#1e293b',
];

interface TagInputProps {
    allTags: Tag[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    onCreateTag?: (tag: Tag) => void;
}

export default function TagInput({ allTags, selectedIds, onChange, onCreateTag }: TagInputProps) {
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
    const [showCreate, setShowCreate] = useState(false);

    function toggleTag(id: number) {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((t) => t !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    }

    const handleCreate = useCallback(async () => {
        if (!newName.trim()) return;

        const xsrfToken = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1];
        const res = await fetch('/tags', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
            },
            body: JSON.stringify({ name: newName.trim(), color: newColor }),
        });

        if (res.ok) {
            const tag = await res.json();
            onCreateTag?.(tag);
            onChange([...selectedIds, tag.id]);
            setNewName('');
            setShowCreate(false);
        }
    }, [newName, newColor, selectedIds, onChange, onCreateTag]);

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                    <TagBadge
                        key={tag.id}
                        name={tag.name}
                        color={tag.color}
                        active={selectedIds.includes(tag.id)}
                        onClick={() => toggleTag(tag.id)}
                    />
                ))}
                {allTags.length === 0 && !showCreate && (
                    <p className="text-muted-foreground text-xs">No tags yet.</p>
                )}
            </div>

            {showCreate ? (
                <div className="flex items-center gap-2">
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Tag name"
                        className="h-8 text-xs"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreate())}
                        autoFocus
                    />
                    <div className="flex shrink-0 gap-0.5">
                        {PRESET_COLORS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setNewColor(c)}
                                className={`h-5 w-5 rounded-full border-2 transition-transform ${
                                    newColor === c ? 'scale-110 border-foreground' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                    <Button type="button" size="sm" className="h-8 shrink-0" onClick={handleCreate}>
                        Add
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0" onClick={() => setShowCreate(false)}>
                        Cancel
                    </Button>
                </div>
            ) : (
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowCreate(true)}>
                    <Plus className="mr-1 h-3 w-3" />
                    New Tag
                </Button>
            )}
        </div>
    );
}
