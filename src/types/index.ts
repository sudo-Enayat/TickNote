export type Priority = 'low' | 'medium' | 'high';

export interface Note {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: Priority;
    dueDate?: Date;
    listId: string;
    createdAt: Date;
    notes: Note[];
    reminderSent?: boolean;
}

export interface TaskList {
    id: string;
    name: string;
    slug: string;
    color?: string;
}

export type Theme = 'light' | 'dark';

export type SortOption = 'manual' | 'time-asc' | 'time-desc' | 'priority';

export interface FocusSession {
    taskId: string;
    taskColor?: string;
    durationMinutes: number;
    elapsedSeconds: number;
    isBreak: boolean;
    cycleCount: number;
    currentCycle: number;
    isActive: boolean;
    startTime: number;
}
