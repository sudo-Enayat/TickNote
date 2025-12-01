import { motion, AnimatePresence } from 'framer-motion';
import { Archive, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { cn } from '../../utils/cn';

export function Bucket() {
    const { tasks, showCompleted, toggleShowCompleted } = useTasks();
    const completedCount = tasks.filter(t => t.completed).length;

    if (completedCount === 0 && !showCompleted) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <motion.button
                onClick={toggleShowCompleted}
                layout
                className={cn(
                    "relative group flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-2xl",
                    showCompleted
                        ? "bg-purple-500/20 border-purple-500/50 text-purple-200 hover:bg-purple-500/30"
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105"
                )}
                whileTap={{ scale: 0.95 }}
            >
                <div className="relative">
                    <Archive className={cn(
                        "w-6 h-6 transition-transform duration-300",
                        showCompleted ? "rotate-180" : ""
                    )} />
                    <AnimatePresence>
                        {!showCompleted && completedCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                            >
                                {completedCount}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                        {showCompleted ? "Hide Completed" : "Completed Tasks"}
                    </span>
                    <span className="text-[10px] opacity-60 font-medium uppercase tracking-wider">
                        {showCompleted ? "Suck In" : "Throw Out"}
                    </span>
                </div>

                <motion.div
                    animate={{
                        y: showCompleted ? -2 : 2,
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        y: { duration: 2, repeat: Infinity, repeatType: "reverse" },
                        opacity: { duration: 2, repeat: Infinity }
                    }}
                >
                    {showCompleted ? (
                        <ArrowUpCircle className="w-4 h-4 opacity-50" />
                    ) : (
                        <ArrowDownCircle className="w-4 h-4 opacity-50" />
                    )}
                </motion.div>
            </motion.button>
        </div>
    );
}
