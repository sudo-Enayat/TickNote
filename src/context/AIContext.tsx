import { createContext, useContext, useState, type ReactNode } from 'react';
import { GeminiService } from '../services/GeminiService';
import { useTasks } from './TaskContext';

interface PendingAction {
    type: 'delete_task' | 'complete_task' | 'delete_tasks';
    taskIds?: string[];
    message: string;
}

interface AIContextType {
    isProcessing: boolean;
    processCommand: (command: string) => Promise<void>;
    aiError: string | null;
    pendingAction: PendingAction | null;
    confirmPendingAction: () => void;
    cancelPendingAction: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const { addTask, setSearchQuery, addList, lists, deleteTask, toggleTask, tasks } = useTasks();

    const confirmPendingAction = () => {
        if (!pendingAction) return;

        try {
            switch (pendingAction.type) {
                case 'delete_task':
                case 'delete_tasks':
                    pendingAction.taskIds?.forEach(id => deleteTask(id));
                    break;
                case 'complete_task':
                    pendingAction.taskIds?.forEach(id => toggleTask(id));
                    break;
            }
        } catch (error: any) {
            setAiError(error.message || 'Failed to execute action.');
        } finally {
            setPendingAction(null);
        }
    };

    const cancelPendingAction = () => {
        setPendingAction(null);
    };

    const processCommand = async (command: string) => {
        setIsProcessing(true);
        setAiError(null);

        try {
            if (!GeminiService.isConfigured()) {
                throw new Error('Gemini API key is missing.');
            }

            // Build lists context for the AI
            const listsContext = lists
                .filter(l => l.slug !== 'all')
                .map(l => `- ${l.name} (ID: ${l.id})`)
                .join('\n');

            // Build tasks context for the AI (only incomplete tasks)
            const tasksContext = tasks
                .filter(t => !t.completed)
                .slice(0, 20) // Limit to 20 most recent tasks to avoid token overflow
                .map(t => {
                    const listName = lists.find(l => l.id === t.listId)?.name || 'Unknown';
                    return `- "${t.title}" (ID: ${t.id}, List: ${listName})`;
                })
                .join('\n');

            const availableColors = ['red', 'orange', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];

            const systemPrompt = `
You are a helpful assistant for a task management app.
The user will give you a command. You need to interpret it and return a JSON array of actions to execute.

Available Lists:
${listsContext}

Current Tasks (incomplete):
${tasksContext || 'No tasks yet'}

Available Colors for Lists:
${availableColors.join(', ')}

Available actions:
1. create_task: { type: 'create_task', title: string, listId?: string, priority?: 'low'|'medium'|'high', dueDate?: string (ISO date) }
2. search_tasks: { type: 'search_tasks', query: string }
3. create_list: { type: 'create_list', name: string, color?: string (choose from available colors, omit if not specified by user) }
4. complete_task: { type: 'complete_task', taskQuery: string, requiresConfirmation: boolean }
5. delete_task: { type: 'delete_task', taskQuery: string, requiresConfirmation: boolean }
6. unknown: { type: 'unknown', message: string }

IMPORTANT:
- Return a JSON ARRAY of actions, even if there's only one action: [{ type: '...', ... }]
- For create_task, intelligently choose the listId based on the task context and available lists
- For create_list, if user doesn't specify a color, omit the color field (app will pick one)
- For complete_task and delete_task, use taskQuery to describe which task(s) to match (e.g., "anatomy" to match "Anatomy test")
- If a list doesn't exist but seems relevant, include a create_list action first
- For tomorrow, use the date: ${new Date(Date.now() + 86400000).toISOString()}
- Current Date: ${new Date().toISOString()}
- Return ONLY the JSON array, no markdown formatting

Examples:
User: "Add buy milk to personal and finish report to work"
Response: [{"type":"create_task","title":"Buy milk","listId":"personal"},{"type":"create_task","title":"Finish report","listId":"work"}]

User: "Anatomy test tomorrow"
Response: [{"type":"create_task","title":"Anatomy test","dueDate":"${new Date(Date.now() + 86400000).toISOString()}","listId":"<bio-list-id-if-exists>"}]

User: "Create a red list named Urgent"
Response: [{"type":"create_list","name":"Urgent","color":"red"}]

User: "Mark anatomy as done"
Response: [{"type":"complete_task","taskQuery":"anatomy","requiresConfirmation":false}]
            `;

            const fullPrompt = `${systemPrompt}\n\nUser Command: ${command}`;
            const responseText = await GeminiService.generateContent(fullPrompt);

            // Clean up response
            const cleanResponse = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

            let actions = JSON.parse(cleanResponse);

            // Ensure we always have an array
            if (!Array.isArray(actions)) {
                actions = [actions];
            }

            // Process each action
            for (const action of actions) {
                switch (action.type) {
                    case 'create_task':
                        addTask(
                            action.title,
                            action.listId || 'personal',
                            action.priority || 'medium',
                            action.dueDate ? new Date(action.dueDate) : undefined
                        );
                        break;
                    case 'search_tasks':
                        setSearchQuery(action.query);
                        break;
                    case 'create_list':
                        // Pick a random color if not provided
                        const colors = ['red', 'orange', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
                        const selectedColor = action.color || colors[Math.floor(Math.random() * colors.length)];
                        addList(action.name, selectedColor);
                        break;
                    case 'complete_task':
                    case 'delete_task':
                        // Find matching tasks based on query
                        const query = action.taskQuery?.toLowerCase() || '';
                        const matchingTasks = tasks.filter(t =>
                            !t.completed && t.title.toLowerCase().includes(query)
                        );

                        if (matchingTasks.length === 0) {
                            setAiError(`No tasks found matching "${action.taskQuery}"`);
                            break;
                        }

                        const taskIds = matchingTasks.map(t => t.id);

                        // These require confirmation
                        if (action.requiresConfirmation !== false) {
                            setPendingAction({
                                type: action.type,
                                taskIds,
                                message: `Are you sure you want to ${action.type === 'complete_task' ? 'complete' : 'delete'} ${taskIds.length} task(s)? (${matchingTasks.map(t => t.title).join(', ')})`
                            });
                        } else {
                            // Execute immediately if confirmation not required
                            taskIds.forEach((id: string) => {
                                if (action.type === 'complete_task') {
                                    toggleTask(id);
                                } else {
                                    deleteTask(id);
                                }
                            });
                        }
                        break;
                    case 'unknown':
                        setAiError(action.message);
                        break;
                    default:
                        console.warn('Unknown action type:', action.type);
                }
            }

        } catch (error: any) {
            console.error('AI Processing Error:', error);
            setAiError(error.message || 'Failed to process command.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AIContext.Provider value={{
            isProcessing,
            processCommand,
            aiError,
            pendingAction,
            confirmPendingAction,
            cancelPendingAction
        }}>
            {children}
        </AIContext.Provider>
    );
}

export function useAI() {
    const context = useContext(AIContext);
    if (context === undefined) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
}
