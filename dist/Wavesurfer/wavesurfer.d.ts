/// <reference types="react" />
import { RegionsPluginParams } from 'wavesurfer.js/src/plugin/regions';
import WaveSurfer from 'wavesurfer.js';
import { PlayerContextState, Phrase } from './Provider';
import { WaveSurferParams } from 'wavesurfer.js/types/params';
interface InitProps {
    regionsOptions?: RegionsPluginParams;
    wavesurferOptions?: WaveSurferParams;
    phrases?: Phrase[];
    setPlayerState: React.Dispatch<React.SetStateAction<PlayerContextState>>;
    peaks?: number[];
}
export declare const initWavesurfer: ({ phrases, regionsOptions, wavesurferOptions, setPlayerState, peaks }: InitProps) => WaveSurfer;
interface RenderWaveformProps {
    mediaElement: HTMLMediaElement;
    wavesurfer: WaveSurfer;
    peaks?: number[];
}
export declare function renderWaveform({ mediaElement, wavesurfer, peaks }: RenderWaveformProps): void;
export {};
