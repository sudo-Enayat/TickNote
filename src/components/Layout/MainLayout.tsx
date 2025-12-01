import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { cn } from '../../utils/cn';
import { useTasks } from '../../context/TaskContext';

interface MainLayoutProps {
    children: ReactNode;
    className?: string;
}

const gradients: Record<string, string> = {
    red: 'from-red-500 via-orange-500 to-yellow-500',
    orange: 'from-orange-500 via-amber-500 to-yellow-500',
    yellow: 'from-yellow-400 via-orange-500 to-red-500',
    green: 'from-green-500 via-emerald-500 to-teal-500',
    blue: 'from-blue-500 via-cyan-500 to-teal-500',
    indigo: 'from-indigo-500 via-purple-500 to-pink-500',
    violet: 'from-violet-500 via-purple-500 to-fuchsia-500',
    default: 'from-indigo-600 via-purple-600 to-pink-500'
};

const darkGradients: Record<string, string> = {
    red: 'from-red-900 via-orange-900 to-yellow-900',
    orange: 'from-orange-900 via-amber-900 to-yellow-900',
    yellow: 'from-yellow-900 via-orange-900 to-red-900',
    green: 'from-green-900 via-emerald-900 to-teal-900',
    blue: 'from-blue-900 via-cyan-900 to-teal-900',
    indigo: 'from-indigo-900 via-purple-900 to-pink-900',
    violet: 'from-violet-900 via-purple-900 to-fuchsia-900',
    default: 'from-indigo-950 via-purple-950 to-pink-950'
};

export function MainLayout({ children, className }: MainLayoutProps) {
    const { lists, activeListId, theme } = useTasks();
    const activeList = lists.find(l => l.id === activeListId);

    const currentGradients = theme === 'dark' ? darkGradients : gradients;
    const gradient = activeList?.color && currentGradients[activeList.color]
        ? currentGradients[activeList.color]
        : currentGradients.default;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn(
                "flex h-screen w-full p-4 gap-4 overflow-hidden bg-gradient-to-br transition-all duration-500 ease-in-out",
                gradient
            )}
        >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay pointer-events-none" />

            <Sidebar />

            <main className={cn("flex-1 glass-panel rounded-2xl p-6 overflow-hidden flex flex-col z-10", className)}>
                {children}
            </main>
        </motion.div>
    );
}
