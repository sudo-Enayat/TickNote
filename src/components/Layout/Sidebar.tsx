import { useState } from 'react';
import { Layout, List, Briefcase, User, Settings, Search, Check, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { colorMap } from '../../utils/colors';
import { useTasks } from '../../context/TaskContext';
import { useAI } from '../../context/AIContext';
import { SettingsModal } from './SettingsModal';
import { AddListModal } from '../Task/AddListModal';
import { ConfirmDialog } from '../UI/ConfirmDialog';

export function Sidebar() {
    const { lists, activeListId, setActiveListId, searchQuery, setSearchQuery, addList, deleteList } = useTasks();
    const { processCommand, isProcessing, aiError, pendingAction, confirmPendingAction, cancelPendingAction } = useAI();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAddListOpen, setIsAddListOpen] = useState(false);
    const [deleteListId, setDeleteListId] = useState<string | null>(null);
    const [isAIMode, setIsAIMode] = useState(false);

    const handleInputKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            if (isAIMode && !isProcessing) {
                await processCommand(searchQuery);
                setSearchQuery('');
            }
            // For search mode, just let the searchQuery update naturally
        }
    };

    const getIcon = (slug: string) => {
        switch (slug) {
            case 'all': return Layout;
            case 'personal': return User;
            case 'work': return Briefcase;
            default: return List;
        }
    };

    const handleAddList = (name: string, color: string) => {
        addList(name, color);
    };

    const handleDeleteList = () => {
        if (deleteListId) {
            deleteList(deleteListId);
            setDeleteListId(null);
        }
    };

    return (
        <>
            <aside className="w-64 h-full flex flex-col relative z-20 glass-panel rounded-2xl">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" strokeWidth={3} />
                        </div>
                        TickNote
                    </h1>
                </div>

                <div className="px-4 mb-4">
                    <div className="relative group">
                        <div className={cn(
                            "absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg opacity-0 transition-opacity duration-300 pointer-events-none",
                            isAIMode && "opacity-20"
                        )} />

                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                            {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                            ) : (
                                <Search className="w-4 h-4 text-white/40" />
                            )}
                        </div>

                        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                            <button
                                onClick={() => setIsAIMode(!isAIMode)}
                                className={cn(
                                    "p-1 rounded-md transition-all duration-200 hover:bg-white/10",
                                    isAIMode ? "text-purple-400 bg-white/10" : "text-white/40 hover:text-white/60"
                                )}
                                title={isAIMode ? "Switch to Search" : "Switch to AI"}
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {isAIMode ? (
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                                placeholder={isProcessing ? "Thinking..." : "Ask AI..."}
                                disabled={isProcessing}
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-9 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition-colors focus:border-purple-500/50"
                            />
                        ) : (
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                                placeholder="Search tasks..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-9 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition-colors"
                            />
                        )}
                    </div>
                    {aiError && isAIMode && (
                        <div className="mt-2 text-xs text-red-400 px-1">
                            {aiError}
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {lists.map((list) => {
                        const Icon = getIcon(list.slug);
                        const isActive = activeListId === list.id;
                        const isCustom = list.slug === 'custom';

                        const colors = list.color && colorMap[list.color] ? colorMap[list.color] : colorMap.default;

                        return (
                            <button
                                key={list.id}
                                onClick={() => setActiveListId(list.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                                    isActive ? colors.active : `text-white/60 ${colors.hover}`
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive ? colors.icon : "text-white/40", list.color && !isActive && colors.text)} />
                                <span className={cn("flex-1 text-left truncate", list.color && colors.text)}>{list.name}</span>

                                {isCustom && (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteListId(list.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                                        title="Delete list"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </div>
                                )}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => setIsAddListOpen(true)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/40 hover:text-white transition-all duration-300 border border-dashed border-white/10 hover:border-transparent mt-4 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                        <Plus className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">New List</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                </div>
            </aside >

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            <AddListModal
                isOpen={isAddListOpen}
                onClose={() => setIsAddListOpen(false)}
                onSubmit={handleAddList}
            />

            <ConfirmDialog
                isOpen={!!deleteListId}
                onClose={() => setDeleteListId(null)}
                onConfirm={handleDeleteList}
                title="Delete List?"
                message="Are you sure you want to delete this list? All tasks in it will be deleted."
                confirmText="Delete List"
                isDangerous
            />

            <ConfirmDialog
                isOpen={!!pendingAction}
                onClose={cancelPendingAction}
                onConfirm={confirmPendingAction}
                title="Confirm AI Action"
                message={pendingAction?.message || ''}
                confirmText="Confirm"
                isDangerous
            />
        </>
    );
}
