
import { AlertCircle } from 'lucide-react';
import type { Priority } from '../../types';
import { cn } from '../../utils/cn';

interface PrioritySelectorProps {
    value: Priority;
    onChange: (priority: Priority) => void;
    className?: string;
}

const priorityColors: Record<Priority, string> = {
    low: 'text-blue-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
};

export function PrioritySelector({ value, onChange, className }: PrioritySelectorProps) {
    return (
        <div className={cn("flex items-center bg-white/5 rounded-lg p-1", className)}>
            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                    key={p}
                    type="button"
                    onClick={() => onChange(p)}
                    className={cn(
                        "p-1.5 rounded-md transition-all",
                        value === p ? "bg-white/10 shadow-sm" : "hover:bg-white/5",
                        priorityColors[p]
                    )}
                    title={p.charAt(0).toUpperCase() + p.slice(1)}
                >
                    <AlertCircle className="w-4 h-4" />
                </button>
            ))}
        </div>
    );
}
