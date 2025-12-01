import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import type { Priority } from '../../types';
import { cn } from '../../utils/cn';
import { PrioritySelector } from './PrioritySelector';

export function AddTask() {
    const { addTask, activeListId } = useTasks();
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const date = dueDate ? new Date(dueDate) : undefined;
        addTask(title, activeListId, priority, date);

        setTitle('');
        setPriority('medium');
        setDueDate('');
        setIsOpen(false);
    };



    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-dashed border-white/20 text-white/50 hover:bg-white/5 hover:text-white/80 transition-all duration-200 group"
            >
                <div className="w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:border-white/40">
                    <Plus className="w-4 h-4" />
                </div>
                <span className="font-medium">Add a task</span>
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <div className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-md shadow-xl">
                <input
                    autoFocus
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full bg-transparent border-none outline-none text-lg text-white placeholder:text-white/40 mb-3"
                />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative group/date">
                            <button type="button" className={cn("p-2 hover:bg-white/10 rounded-lg transition-colors", dueDate ? "text-purple-400" : "text-white/60 hover:text-white")}>
                                <CalendarIcon className="w-4 h-4" />
                            </button>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>

                        <PrioritySelector
                            value={priority}
                            onChange={setPriority}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Add Task
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
