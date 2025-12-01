import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { Modal } from '../UI/Modal';
import { ConfirmDialog } from '../UI/ConfirmDialog';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { clearAllData, theme, toggleTheme } = useTasks();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleClearData = () => {
        clearAllData();
        setIsConfirmOpen(false);
        onClose();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Settings">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Appearance</h3>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <h4 className="text-base font-medium text-white">Dark Mode</h4>
                                <p className="text-sm text-white/60">Adjust the appearance for low light</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent ${theme === 'dark' ? 'bg-purple-500' : 'bg-white/20'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Data Management</h3>

                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-base font-medium text-red-400">Danger Zone</h4>
                                    <p className="text-sm text-red-400/60 mt-1">
                                        Clear all your tasks and lists. This action is irreversible.
                                    </p>
                                    <button
                                        onClick={() => setIsConfirmOpen(true)}
                                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Clear All Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-xs text-white/20 pt-4 border-t border-white/5">
                        <p>TickNote v1.0.0</p>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleClearData}
                title="Clear All Data?"
                message="Are you sure you want to clear ALL data? This includes all tasks and custom lists. This action cannot be undone."
                confirmText="Clear All Data"
                isDangerous
            />
        </>
    );
}
