import * as React from 'react';
import { RegionsPluginParams } from 'wavesurfer.js/src/plugin/regions';
import { WaveSurferParams } from 'wavesurfer.js/types/params';
import WaveSurfer from 'wavesurfer.js';
export interface Phrase {
    id?: string;
    start: number;
    end: number;
    data?: {
        text: string;
    };
}
interface UpdatePhrasesProps {
    phrases: Phrase[];
    randomIds?: boolean;
    replace?: boolean;
}
interface Props {
    children: JSX.Element;
    mediaLink?: string;
    phrasesProps?: UpdatePhrasesProps;
    regionsOptions?: RegionsPluginParams;
    wavesurferOptions?: WaveSurferParams;
    peaks?: number[];
}
export type DelayMeasure = 'phraseLength' | 'seconds';
export interface PlayerContextState {
    phrases: Phrase[];
    mediaLink: string;
    currentTime: number;
    isPlaying: boolean;
    isReady: boolean;
    isFinished: boolean;
    currentPhraseNum: number;
    currentPhraseId: string;
    duration: number;
    peaks: number[];
    playMode: 'all' | 'phrase' | 'dictation';
    currentRepeatNum: number;
    timerId: number;
}
interface PlayDictationProps {
    repeatCount: number;
    repeatDelay: number;
    delayMeasure: DelayMeasure;
}
interface PlayerContextMethods {
    setMediaLink: (mediaLink: string) => void;
    setCurrentTime: (currentTime: number) => void;
    setPeaks: (peaks: number[]) => void;
    setRepeatDelay: (repeatDelay: number) => void;
    setRepeatCount: (repeatCount: number) => void;
    setDelayMeasure: (delayMeasure: DelayMeasure) => void;
    getWavesurferInstance: () => WaveSurfer | null;
    calculatePeaks: () => void;
    removePeaks: () => void;
    updatePhrases: (props: UpdatePhrasesProps) => void;
    updatePhrase: (phraseUpdate: Partial<Phrase>) => void;
    removePhrase: (id: string) => void;
    removePhrases: () => void;
    play: () => void;
    pause: () => void;
    playPhrase: (phraseId: string) => void;
    playDictation: (props: PlayDictationProps) => void;
    updateState: (newValues: Partial<PlayerContextState>) => void;
    setPlaybackRate: (rate: number) => void;
}
interface PlayerContextType {
    state: PlayerContextState;
    methods: PlayerContextMethods;
}
export declare const PlayerContext: React.Context<PlayerContextType>;
export declare const defaultPlayerState: PlayerContextState;
export declare const PlayerProvider: React.FC<Props>;
export {};
