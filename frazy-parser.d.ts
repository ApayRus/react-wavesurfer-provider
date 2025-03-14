declare module 'frazy-parser' {
	export interface Phrase {
		id?: string
		start: number
		end: number
		body?: string
		data?: { text: string }
	}

	export function formatSecondsToTime(time: number): string
	export function findCurrentPhraseNum(phrases: Phrase[], time: number): number
	export function parseSubs(text: string, extractVoices?: boolean): Phrase[]
}
