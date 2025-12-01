import { useState, useRef, useEffect } from 'react';
import { Check, Trash2, AlertCircle, Pencil, Calendar as CalendarIcon, FileText, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task, Priority, Note } from '../../types';
import { cn } from '../../utils/cn';
import { useTasks } from '../../context/TaskContext';
import { useFocus } from '../../context/FocusContext';
import { NoteList } from './NoteList';
import { PrioritySelector } from './PrioritySelector';
import { colorMap } from '../../utils/colors';

interface TaskItemProps {
    task: Task;
    listColor?: string;
}

const priorityColors: Record<Priority, string> = {
    high: 'text-red-400',
    medium: 'text-yellow-400',
    low: 'text-blue-400',
};

export function TaskItem({ task, listColor }: TaskItemProps) {
    const { toggleTask, deleteTask, updateTask } = useTasks();
    const { startSession } = useFocus();
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [isExpanded, setIsExpanded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (editTitle.trim()) {
            updateTask(task.id, { title: editTitle });
        } else {
            setEditTitle(task.title); // Revert if empty
        }
        setIsEditing(false);
    };

    const handleAddNote = (content: string) => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            content,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const updatedNotes = [...(task.notes || []), newNote];
        updateTask(task.id, { notes: updatedNotes });
    };

    const handleDeleteNote = (noteId: string) => {
        const updatedNotes = (task.notes || []).filter(n => n.id !== noteId);
        updateTask(task.id, { notes: updatedNotes });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setEditTitle(task.title);
            setIsEditing(false);
        }
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

    const colorStyles = listColor && colorMap[listColor] ? colorMap[listColor] : null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
                opacity: 0,
                y: task.completed ? 200 : -20,
                scale: task.completed ? 0.5 : 0.95,
                transition: { duration: 0.3 }
            }}
            className="group relative"
        >
            <div className={cn(
                "flex items-center gap-4 p-4 rounded-xl transition-all duration-200 overflow-hidden outline-none ring-0",
                "bg-white/5", // Always use base background
                colorStyles ? colorStyles.hover : "hover:bg-white/10", // Apply colored hover or default hover
                task.completed && "opacity-50",
                isOverdue && "shadow-[0_0_15px_rgba(239,68,68,0.15)] border border-red-500/20"
            )}>
                <button
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                        "relative w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center flex-shrink-0",
                        task.completed
                            ? "bg-purple-500 border-purple-500"
                            : "border-white/30 hover:border-purple-400"
                    )}
                >
                    <AnimatePresence>
                        {task.completed && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            >
                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>

                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full bg-transparent border-b border-white/20 outline-none text-white pb-1"
                                placeholder="Task title"
                            />
                            <div className="flex items-center gap-2">
                                <PrioritySelector
                                    value={task.priority}
                                    onChange={(priority) => updateTask(task.id, { priority })}
                                />
                                <input
                                    type="datetime-local"
                                    value={task.dueDate ? new Date(new Date(task.dueDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => updateTask(task.id, {
                                        dueDate: e.target.value ? new Date(e.target.value) : undefined,
                                        reminderSent: false // Reset reminder when due date changes
                                    })}
                                    className="bg-white/5 text-xs text-white/70 rounded px-2 py-1 outline-none border border-white/10 [color-scheme:dark]"
                                />
                                <button
                                    onClick={handleSave}
                                    className="ml-auto text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded hover:bg-purple-500/30 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h3 className={cn(
                                "text-base font-medium transition-all duration-200 truncate",
                                colorStyles ? colorStyles.text : "text-white/90",
                                task.completed && "line-through text-white/50",
                                isOverdue && "text-red-200"
                            )}>
                                {task.title}
                            </h3>
                            {task.description && (
                                <p className="text-sm text-white/50 truncate mt-0.5">{task.description}</p>
                            )}
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {task.dueDate && !isEditing && (
                        <div className={cn(
                            "flex items-center gap-1 text-xs px-2 py-1 rounded-lg",
                            isOverdue ? "text-red-300 bg-red-500/10" : "text-white/40 bg-white/5"
                        )}>
                            <CalendarIcon className="w-3 h-3" />
                            <span>{new Date(task.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                    )}

                    {/* Focus button - appears on hover, before priority indicator */}
                    <button
                        onClick={() => startSession(task.id, listColor, 30)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 flex items-center gap-1.5"
                    >
                        <Target className="w-3.5 h-3.5" />
                        Focus
                    </button>

                    {/* Always visible priority indicator */}
                    <div className={cn("p-1.5 rounded-lg bg-white/5 transition-opacity duration-200", priorityColors[task.priority])}>
                        <AlertCircle className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">


                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                isExpanded ? "text-white bg-white/10" : "text-white/40 hover:text-white hover:bg-white/10"
                            )}
                        >
                            <div className="relative">
                                <FileText className="w-4 h-4" />
                                {(task.notes?.length || 0) > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
                                )}
                            </div>
                        </button>

                        <button
                            onClick={() => deleteTask(task.id)}
                            className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-2">
                            <NoteList
                                notes={task.notes || []}
                                onAddNote={handleAddNote}
                                onDeleteNote={handleDeleteNote}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
