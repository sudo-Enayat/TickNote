import { useEffect, useRef } from 'react';
import { useTasks } from '../context/TaskContext';

export function useNotification() {
    const { tasks, updateTask } = useTasks();
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        // Request permission on mount
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const checkTasks = () => {
            if (Notification.permission !== 'granted') return;

            const now = new Date();

            tasks.forEach(task => {
                if (task.dueDate && !task.completed && !task.reminderSent) {
                    const dueDate = new Date(task.dueDate);

                    // Check if task is due (within the last minute to avoid spamming old tasks)
                    // or if it's slightly in the future (e.g., due in current minute)
                    if (dueDate <= now) {
                        // Send notification
                        new Notification('Task Due: ' + task.title, {
                            body: task.description || 'This task is due now!',
                            icon: '/vite.svg' // Optional: add an icon path if available
                        });

                        // Mark as reminder sent
                        updateTask(task.id, { reminderSent: true });
                    }
                }
            });
        };

        // Check every 30 seconds
        intervalRef.current = window.setInterval(checkTasks, 30000);

        // Initial check
        checkTasks();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [tasks, updateTask]);
}
