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
	export function parseSubs(text: string, extractVoices = true): Phrase[]
	// export function parseVtt(
	// 	text: string
	// ): Array<Info | Chapter | Phrase | Comment>
	// export function parseChapters(text: string): Chapter[]
}
