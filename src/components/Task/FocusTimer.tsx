import { X, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocus } from '../../context/FocusContext';
import { useTasks } from '../../context/TaskContext';

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

export function FocusTimer() {
    const { session, stopSession, pauseSession, resumeSession, startSession } = useFocus();
    const { tasks } = useTasks();

    if (!session) return null;
    
    

    const task = tasks.find(t => t.id === session.taskId);
    if (!task) {
        stopSession();
        return null;
    }

    const phaseDuration = session.isBreak ? BREAK_DURATION : WORK_DURATION;
    const remainingSeconds = phaseDuration - session.elapsedSeconds;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    const handleDurationSelect = (totalMinutes: number) => {
        stopSession();
        startSession(session.taskId, session.taskColor, totalMinutes);
    };

    const renderProgressBars = () => {
        const bars = [];
        for (let i = 0; i < session.cycleCount; i++) {
            const isCurrentCycle = i + 1 === session.currentCycle;
            const isPastCycle = i + 1 < session.currentCycle;

            bars.push(
                <div key={i} className="relative w-full h-8 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm">
                    {isPastCycle ? null : isCurrentCycle ? (
                        <>
                            {/* Work portion - empties from left */}
                            <motion.div
                                className={`absolute top-0 h-full ${getColorClass(session.taskColor)} transition-all duration-1000`}
                                style={{
                                    right: session.isBreak ? '100%' : '25%', // Position from right
                                    width: session.isBreak
                                        ? '0%'
                                        : `${Math.max(0, (1 - session.elapsedSeconds / WORK_DURATION) * 75)}%`
                                }}
                            />
                            {/* Break portion - empties from left */}
                            <motion.div
                                className={`absolute top-0 h-full ${getTranslucentColorClass(session.taskColor)} transition-all duration-1000`}
                                style={{
                                    right: '0%', // Always at the right edge
                                    width: session.isBreak
                                        ? `${Math.max(0, (1 - session.elapsedSeconds / BREAK_DURATION) * 25)}%`
                                        : '25%'
                                }}
                            />
                        </>
                    ) : (
                        <>
                            {/* Upcoming cycle - full bar */}
                            <div className={`absolute right-0 top-0 h-full w-3/4 ${getColorClass(session.taskColor)}`} style={{ right: '25%' }} />
                            <div className={`absolute right-0 top-0 h-full w-1/4 ${getTranslucentColorClass(session.taskColor)}`} />
                        </>
                    )}
                </div>
            );
        }
        return bars;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
            >
                <div className="relative w-full max-w-2xl p-8">
                    {/* Close button */}
                    <button
                        onClick={stopSession}
                        className="absolute top-4 right-4 p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Task title */}
                    <h2 className={`text-2xl font-bold ${getTextColorClass(session.taskColor)} mb-8 text-center`}>{task.title}</h2>

                    {/* Timer Display */}
                    <div className="flex flex-col items-center mb-12">
                        {session.isBreak ? (
                            <>
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className="text-8xl font-bold text-green-400 mb-4"
                                >
                                    BREAK
                                </motion.div>
                                <div className={`text-4xl font-mono ${getTextColorClass(session.taskColor)}`}>
                                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                </div>
                            </>
                        ) : (
                            <div className={`text-8xl font-mono font-bold ${getTextColorClass(session.taskColor)}`}>
                                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                            </div>
                        )}
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-3 mb-8">
                        {renderProgressBars()}
                    </div>

                    {/* Controls */}
                    {!session.isActive ? (
                        <div className="flex items-center justify-center mb-8">
                            <button
                                onClick={resumeSession}
                                className={`px-12 py-4 rounded-full ${getButtonGradientClass(session.taskColor)} text-white font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105`}
                            >
                                Start
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <button
                                onClick={pauseSession}
                                className={`p-4 rounded-full ${getColorClass(session.taskColor)} hover:opacity-80 text-white transition-all`}
                            >
                                <Pause className="w-6 h-6" />
                            </button>
                        </div>
                    )}

                    {/* Duration Selector */}
                    <div className="flex items-center justify-center gap-3">
                        {[30, 60, 90, 120].map(duration => (
                            <button
                                key={duration}
                                onClick={() => handleDurationSelect(duration)}
                                className={`
                                    w-16 h-16 rounded-full border-2 transition-all font-bold
                                    ${session.durationMinutes === duration
                                        ? `${getColorClass(session.taskColor)} border-transparent ${getTextColorClass(session.taskColor)} shadow-lg`
                                        : `bg-white/5 border-white/30 text-white/60 hover:${getTextColorClass(session.taskColor)} hover:border-current`
                                    }
                                `}
                            >
                                <div className="text-sm">{duration === 30 ? '30m' : `${duration / 60}h`}</div>
                            </button>
                        ))}
                    </div>

                    {/* Cycle indicator */}
                    <div className="text-center mt-6 text-white/50 text-sm">
                        Cycle {session.currentCycle} of {session.cycleCount}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

function getColorClass(color: string | undefined): string {
    if (!color) return 'bg-purple-500/60';

    const colorName = color.toLowerCase();
    const tailwindColors: Record<string, string> = {
        red: 'bg-red-500/60',
        orange: 'bg-orange-500/60',
        yellow: 'bg-yellow-500/60',
        green: 'bg-green-500/60',
        blue: 'bg-blue-500/60',
        indigo: 'bg-indigo-500/60',
        violet: 'bg-violet-500/60',
        purple: 'bg-purple-500/60',
        pink: 'bg-pink-500/60',
        rose: 'bg-rose-500/60',
        fuchsia: 'bg-fuchsia-500/60',
        teal: 'bg-teal-500/60',
        cyan: 'bg-cyan-500/60',
        emerald: 'bg-emerald-500/60',
        lime: 'bg-lime-500/60',
    };

    return tailwindColors[colorName] || 'bg-purple-500/60';
}

function getTranslucentColorClass(color: string | undefined): string {
    if (!color) return 'bg-purple-500/20';

    const colorName = color.toLowerCase();
    const tailwindColors: Record<string, string> = {
        red: 'bg-red-500/20',
        orange: 'bg-orange-500/20',
        yellow: 'bg-yellow-500/20',
        green: 'bg-green-500/20',
        blue: 'bg-blue-500/20',
        indigo: 'bg-indigo-500/20',
        violet: 'bg-violet-500/20',
        purple: 'bg-purple-500/20',
        pink: 'bg-pink-500/20',
        rose: 'bg-rose-500/20',
        fuchsia: 'bg-fuchsia-500/20',
        teal: 'bg-teal-500/20',
        cyan: 'bg-cyan-500/20',
        emerald: 'bg-emerald-500/20',
        lime: 'bg-lime-500/20',
    };

    return tailwindColors[colorName] || 'bg-purple-500/20';
}

function getTextColorClass(color: string | undefined): string {
    if (!color) return 'text-purple-400';

    const colorName = color.toLowerCase();
    const tailwindColors: Record<string, string> = {
        red: 'text-red-400',
        orange: 'text-orange-400',
        yellow: 'text-yellow-400',
        green: 'text-green-400',
        blue: 'text-blue-400',
        indigo: 'text-indigo-400',
        violet: 'text-violet-400',
        purple: 'text-purple-400',
        pink: 'text-pink-400',
        rose: 'text-rose-400',
        fuchsia: 'text-fuchsia-400',
        teal: 'text-teal-400',
        cyan: 'text-cyan-400',
        emerald: 'text-emerald-400',
        lime: 'text-lime-400',
    };

    return tailwindColors[colorName] || 'text-purple-400';
}

function getButtonGradientClass(color: string | undefined): string {
    if (!color) return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600';

    const colorName = color.toLowerCase();
    const gradients: Record<string, string> = {
        red: 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
        orange: 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600',
        yellow: 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600',
        green: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
        blue: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
        indigo: 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600',
        violet: 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600',
        purple: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
        pink: 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600',
        rose: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600',
        fuchsia: 'bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600',
        teal: 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600',
        cyan: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600',
        emerald: 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600',
        lime: 'bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600',
    };

    return gradients[colorName] || 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600';
}

