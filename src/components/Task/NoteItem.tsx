import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import type { Note } from '../../types';

interface NoteItemProps {
    note: Note;
    onDelete: (id: string) => void;
}

export function NoteItem({ note, onDelete }: NoteItemProps) {
    return (
        <div className="group flex items-start justify-between gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">{note.content}</p>
                <p className="text-[10px] text-gray-500 mt-1">
                    {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
            </div>
            <button
                onClick={() => onDelete(note.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                title="Delete note"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
}
