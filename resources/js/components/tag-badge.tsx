interface TagBadgeProps {
    name: string;
    color: string;
    onRemove?: () => void;
    onClick?: () => void;
    active?: boolean;
    size?: 'sm' | 'default';
}

function contrastColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

export default function TagBadge({ name, color, onRemove, onClick, active = true, size = 'default' }: TagBadgeProps) {
    const textColor = contrastColor(color);
    const sizeClasses = size === 'sm' ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs';

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-medium transition-opacity ${sizeClasses} ${
                onClick ? 'cursor-pointer' : ''
            } ${active ? 'opacity-100' : 'opacity-40'}`}
            style={{ backgroundColor: color, color: textColor }}
            onClick={onClick}
        >
            {name}
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="ml-0.5 rounded-full opacity-70 hover:opacity-100"
                    style={{ color: textColor }}
                >
                    &times;
                </button>
            )}
        </span>
    );
}
