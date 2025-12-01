import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md glass-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            {title && (
                                <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                                    <button
                                        onClick={onClose}
                                        className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                            {!title && (
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors z-10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                {children}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
