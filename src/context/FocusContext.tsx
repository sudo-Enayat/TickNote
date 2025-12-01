/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useRef } from 'react';
import type { FocusSession } from '../types';
import { useFocusSound } from '../hooks/useFocusSound';
import { useTasks } from './TaskContext';

interface FocusContextType {
    session: FocusSession | null;
    startSession: (taskId: string, taskColor: string | undefined, durationMinutes: number) => void;
    stopSession: () => void;
    pauseSession: () => void;
    resumeSession: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

const WORK_DURATION = 25 * 60; // 25 minutes in seconds
const BREAK_DURATION = 5 * 60; // 5 minutes in seconds
const WARNING_TIME = 30; // 30 seconds before break ends

export function FocusProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<FocusSession | null>(() => {
        const saved = localStorage.getItem('ticknote-focus-session');
        if (saved) {
            return JSON.parse(saved);
        }
        return null;
    });

    const { playTransitionDing, playWarningDing } = useFocusSound();
    const { activeListId, tasks } = useTasks();
    const warningPlayedRef = useRef(false);

    // Save session to localStorage
    useEffect(() => {
        if (session) {
            localStorage.setItem('ticknote-focus-session', JSON.stringify(session));
        } else {
            localStorage.removeItem('ticknote-focus-session');
        }
    }, [session]);

    // Stop session when navigating to a different list
    useEffect(() => {
        if (session && session.isActive) {
            const task = tasks.find(t => t.id === session.taskId);
            if (task && task.listId !== activeListId && activeListId !== 'all') {
                stopSession();
            }
        }
    }, [activeListId, session, tasks]);

    const startSession = useCallback((taskId: string, taskColor: string | undefined, durationMinutes: number) => {
        const cycleCount = Math.ceil(durationMinutes / 30);
        setSession({
            taskId,
            taskColor,
            durationMinutes,
            elapsedSeconds: 0,
            isBreak: false,
            cycleCount,
            currentCycle: 1,
            isActive: false, // Start paused
            startTime: Date.now(),
        });
        warningPlayedRef.current = false;
    }, []);

    const stopSession = useCallback(() => {
        setSession(null);
        warningPlayedRef.current = false;
    }, []);

    const pauseSession = useCallback(() => {
        setSession(prev => prev ? { ...prev, isActive: false } : null);
    }, []);

    const resumeSession = useCallback(() => {
        setSession(prev => prev ? { ...prev, isActive: true, startTime: Date.now() - (prev.elapsedSeconds * 1000) } : null);
    }, []);

    // Timer logic
    useEffect(() => {
        if (!session || !session.isActive) return;

        const interval = setInterval(() => {
            setSession(prev => {
                if (!prev || !prev.isActive) return prev;

                const elapsed = Math.floor((Date.now() - prev.startTime) / 1000);
                const phaseDuration = prev.isBreak ? BREAK_DURATION : WORK_DURATION;

                // Check if current phase is complete
                if (elapsed >= phaseDuration) {
                    playTransitionDing();

                    if (prev.isBreak) {
                        // Break ended, move to next work cycle
                        if (prev.currentCycle >= prev.cycleCount) {
                            // All cycles complete
                            return null;
                        }
                        warningPlayedRef.current = false;
                        return {
                            ...prev,
                            isBreak: false,
                            currentCycle: prev.currentCycle + 1,
                            elapsedSeconds: 0,
                            startTime: Date.now(),
                        };
                    } else {
                        // Work ended, start break
                        return {
                            ...prev,
                            isBreak: true,
                            elapsedSeconds: 0,
                            startTime: Date.now(),
                        };
                    }
                }

                // Warning for break ending soon
                if (prev.isBreak && !warningPlayedRef.current && (phaseDuration - elapsed) <= WARNING_TIME) {
                    playWarningDing();
                    warningPlayedRef.current = true;
                }

                return {
                    ...prev,
                    elapsedSeconds: elapsed,
                };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [session?.isActive, playTransitionDing, playWarningDing]);

    return (
        <FocusContext.Provider value={{
            session,
            startSession,
            stopSession,
            pauseSession,
            resumeSession,
        }}>
            {children}
        </FocusContext.Provider>
    );
}

export function useFocus() {
    const context = useContext(FocusContext);
    if (context === undefined) {
        throw new Error('useFocus must be used within a FocusProvider');
    }
    return context;
}
