import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface SplashScreenProps {
    onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.8, ease: "easeInOut" }}
            onAnimationComplete={onComplete}
        >
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                className="flex flex-col items-center gap-4"
            >
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-purple-500/20">
                    <Check className="w-12 h-12 text-white" strokeWidth={3} />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">TickNote</h1>
            </motion.div>
        </motion.div>
    );
}
