import { useCallback } from 'react';

export function useFocusSound() {
    const playDing = useCallback(() => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800; // 800 Hz tone
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            // Fail silently if audio is blocked or not supported
            console.warn('Audio notification failed:', error);
        }
    }, []);

    const playTransitionDing = useCallback(() => {
        playDing();
    }, [playDing]);

    const playWarningDing = useCallback(() => {
        playDing();
    }, [playDing]);

    return {
        playTransitionDing,
        playWarningDing,
    };
}
