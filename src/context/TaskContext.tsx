/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Task, TaskList, Priority, Theme, SortOption } from '../types';

interface TaskContextType {
    tasks: Task[];
    lists: TaskList[];
    activeListId: string;
    setActiveListId: (id: string) => void;
    addList: (name: string, color: string) => void;
    deleteList: (id: string) => void;
    addTask: (title: string, listId: string, priority?: Priority, dueDate?: Date) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    reorderTasks: (newOrderedIds: string[]) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    clearAllData: () => void;
    theme: Theme;
    toggleTheme: () => void;
    sortBy: SortOption;
    setSortBy: (option: SortOption) => void;
    showCompleted: boolean;
    toggleShowCompleted: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>(() => {
        const saved = localStorage.getItem('ticknote-tasks');
        if (saved) {
            return JSON.parse(saved, (key, value) => {
                if (key === 'dueDate' || key === 'createdAt') return new Date(value);
                return value;
            });
        }
        return [];
    });

    const defaultLists: TaskList[] = [
        { id: 'all', name: 'All Tasks', slug: 'all' },
        { id: 'personal', name: 'Personal', slug: 'personal' },
        { id: 'work', name: 'Work', slug: 'work' },
    ];

    const [lists, setLists] = useState<TaskList[]>(() => {
        const saved = localStorage.getItem('ticknote-lists');
        if (saved) {
            return JSON.parse(saved);
        }
        return defaultLists;
    });

    const [activeListId, setActiveListId] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('ticknote-theme');
        return (saved as Theme) || 'light';
    });
    const [sortBy, setSortBy] = useState<SortOption>(() => {
        const saved = localStorage.getItem('ticknote-sort');
        return (saved as SortOption) || 'manual';
    });
    const [showCompleted, setShowCompleted] = useState(false);

    const toggleShowCompleted = () => setShowCompleted(prev => !prev);

    useEffect(() => {
        localStorage.setItem('ticknote-theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('ticknote-sort', sortBy);
    }, [sortBy]);

    useEffect(() => {
        localStorage.setItem('ticknote-tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('ticknote-lists', JSON.stringify(lists));
    }, [lists]);

    const addList = (name: string, color: string) => {
        const newList: TaskList = {
            id: crypto.randomUUID(),
            name,
            slug: 'custom',
            color,
        };
        setLists(prev => [...prev, newList]);
        setActiveListId(newList.id);
    };

    const deleteList = (id: string) => {
        setLists(prev => prev.filter(l => l.id !== id));
        if (activeListId === id) {
            setActiveListId('all');
        }
        // Delete tasks associated with this list
        setTasks(prev => prev.filter(t => t.listId !== id));
    };

    const addTask = (title: string, listId: string, priority: Priority = 'medium', dueDate?: Date) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            title,
            completed: false,
            priority,
            dueDate,
            listId: listId === 'all' ? 'personal' : listId,
            createdAt: new Date(),
            notes: [],
        };
        setTasks(prev => [newTask, ...prev]);
    };

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ));
    };

    const deleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, ...updates } : t
        ));
    };

    const reorderTasks = (newOrderedIds: string[]) => {
        setTasks(prev => {
            const taskMap = new Map(prev.map(t => [t.id, t]));
            const newTasks: Task[] = [];
            const processedIds = new Set(newOrderedIds);

            // Add tasks in the new order
            newOrderedIds.forEach(id => {
                const task = taskMap.get(id);
                if (task) newTasks.push(task);
            });

            // Add remaining tasks that weren't in the reordered list
            // (preserving their relative order from the original list)
            prev.forEach(task => {
                if (!processedIds.has(task.id)) {
                    newTasks.push(task);
                }
            });

            // If we're only reordering a subset, we need to be careful not to move
            // the subset to the top of the list. We should try to place them
            // back into the "slots" they occupied, or just append the rest.
            // However, a simpler approach for "All Tasks" vs "Filtered" is:
            // If we are reordering a filtered view, we effectively want to
            // update the global list order to reflect the new relative order
            // of the filtered items, while keeping other items in their relative places.

            // Better approach for stability:
            // 1. Identify indices of all items involved in the reorder in the original list.
            // 2. Sort these indices.
            // 3. Place the new ordered items into these sorted indices.

            const currentIndices = newOrderedIds
                .map(id => prev.findIndex(t => t.id === id))
                .filter(i => i !== -1)
                .sort((a, b) => a - b);

            if (currentIndices.length !== newOrderedIds.length) {
                // Fallback if something is missing (shouldn't happen)
                return prev;
            }

            const result = [...prev];
            currentIndices.forEach((originalIndex, i) => {
                const taskId = newOrderedIds[i];
                const task = taskMap.get(taskId);
                if (task) {
                    result[originalIndex] = task;
                }
            });

            return result;
        });
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const clearAllData = () => {
        setTasks([]);
        setLists(defaultLists);
        setActiveListId('all');
        setSearchQuery('');
        // Don't reset theme or sort preferences
        localStorage.removeItem('ticknote-tasks');
        localStorage.removeItem('ticknote-lists');
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            lists,
            activeListId,
            setActiveListId,
            addList,
            deleteList,
            addTask,
            toggleTask,
            deleteTask,
            updateTask,
            reorderTasks,
            searchQuery,
            setSearchQuery,
            clearAllData,
            theme,
            toggleTheme,
            sortBy,
            setSortBy,
            showCompleted,
            toggleShowCompleted
        }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}
