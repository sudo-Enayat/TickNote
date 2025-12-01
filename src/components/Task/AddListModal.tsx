import { useState, useEffect, useRef } from 'react';
import { Modal } from '../UI/Modal';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AddListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, color: string) => void;
}

const colors = [
    { id: 'red', value: 'bg-red-500', label: 'Red' },
    { id: 'orange', value: 'bg-orange-500', label: 'Orange' },
    { id: 'yellow', value: 'bg-yellow-400', label: 'Yellow' },
    { id: 'lime', value: 'bg-lime-500', label: 'Lime' },
    { id: 'green', value: 'bg-green-500', label: 'Green' },
    { id: 'emerald', value: 'bg-emerald-500', label: 'Emerald' },
    { id: 'teal', value: 'bg-teal-500', label: 'Teal' },
    { id: 'cyan', value: 'bg-cyan-500', label: 'Cyan' },
    { id: 'blue', value: 'bg-blue-500', label: 'Blue' },
    { id: 'indigo', value: 'bg-indigo-500', label: 'Indigo' },
    { id: 'violet', value: 'bg-violet-500', label: 'Violet' },
    { id: 'purple', value: 'bg-purple-500', label: 'Purple' },
    { id: 'fuchsia', value: 'bg-fuchsia-500', label: 'Fuchsia' },
    { id: 'pink', value: 'bg-pink-500', label: 'Pink' },
    { id: 'rose', value: 'bg-rose-500', label: 'Rose' },
];

export function AddListModal({ isOpen, onClose, onSubmit }: AddListModalProps) {
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState('indigo');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setSelectedColor('indigo');
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (name.trim()) {
            onSubmit(name.trim(), selectedColor);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New List">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">List Name</label>
                    <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter list name..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">Color Theme</label>
                    <div className="grid grid-cols-8 gap-3">
                        {colors.map((color) => (
                            <button
                                key={color.id}
                                type="button"
                                onClick={() => setSelectedColor(color.id)}
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                    color.value,
                                    selectedColor === color.id ? "ring-2 ring-white scale-110" : "opacity-60 hover:opacity-100 hover:scale-105"
                                )}
                                title={color.label}
                            >
                                {selectedColor === color.id && (
                                    <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create List
                    </button>
                </div>
            </form>
        </Modal>
    );
}
