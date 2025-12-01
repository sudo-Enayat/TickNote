import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Note } from '../../types';
import { NoteItem } from './NoteItem';

interface NoteListProps {
    notes: Note[];
    onAddNote: (content: string) => void;
    onDeleteNote: (id: string) => void;
}

export function NoteList({ notes, onAddNote, onDeleteNote }: NoteListProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newNoteContent.trim()) {
            onAddNote(newNoteContent.trim());
            setNewNoteContent('');
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Notes</h4>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-1 text-gray-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded transition-colors"
                    title="Add note"
                >
                    <Plus size={14} />
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="space-y-2">
                    <textarea
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="Type your note..."
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none"
                        rows={3}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                            if (e.key === 'Escape') {
                                setIsAdding(false);
                            }
                        }}
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!newNoteContent.trim()}
                            className="px-3 py-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Note
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-2">
                {notes.length === 0 && !isAdding ? (
                    <p className="text-sm text-gray-500 italic">No notes yet</p>
                ) : (
                    notes.map((note) => (
                        <NoteItem
                            key={note.id}
                            note={note}
                            onDelete={onDeleteNote}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
