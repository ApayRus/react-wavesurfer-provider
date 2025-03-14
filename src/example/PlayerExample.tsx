import * as React from 'react'
import { useContext, useEffect, useState } from 'react'
import { Phrase, PlayerContext } from '../components/Wavesurfer/Provider'
import { parseSubs } from 'frazy-parser'
import './styles.css'

function PlayerExample() {
	const { state: playerState, methods: playerMethods } =
		useContext(PlayerContext)

	const [formState, setFormState] = useState({
		mediaLink: '',
		repeatDelay: 1,
		repeatCount: 2,
		delayMeasure: 'phraseLength',
		phrasesTextarea: '',
		peaksTextarea: '',
		playbackRate: 1
	})

	const updateFormState = (newValues: any) => {
		setFormState(oldState => ({
			...oldState,
			...newValues
		}))
	}

	const onChange = (event: any) => {
		const {
			target: { id, value }
		} = event

		// Преобразуем числовые значения из строк в числа
		if (id === 'repeatDelay' || id === 'repeatCount' || id === 'playbackRate') {
			updateFormState({ [id]: Number(value) })
		} else {
			updateFormState({ [id]: value })
		}

		const playerStateIds = ['repeatDelay', 'repeatCount', 'delayMeasure']
		if (playerStateIds.includes(id)) {
			if (id === 'repeatDelay' || id === 'repeatCount') {
				playerMethods.updateState({ [id]: Number(value) })
			} else {
				playerMethods.updateState({ [id]: value })
			}
		}
		if (id === 'playbackRate') {
			playerMethods.setPlaybackRate(Number(value))
		}
	}

	useEffect(() => {
		updateFormState({
			mediaLink: playerState.mediaLink
		})
	}, [])

	useEffect(() => {
		const phrasesText = playerState.phrases
			.map(phrase => {
				const { start, end, data } = phrase
				return `${(+start).toFixed(2)}\t${(+end).toFixed(2)}\t${
					data?.text || ''
				}`
			})
			.slice(1)
			.join('\n')
		setFormState(prevState => ({
			...prevState,
			phrasesTextarea: phrasesText
		}))
	}, [playerState.phrases])

	const setMediaLink = () => {
		playerMethods.setMediaLink(formState.mediaLink)
	}

	const playDictation = () => {
		const { repeatCount, repeatDelay, delayMeasure } = formState
		playerMethods.playDictation({
			repeatCount: Number(repeatCount),
			repeatDelay: Number(repeatDelay),
			delayMeasure: delayMeasure as 'phraseLength' | 'seconds'
		})
	}

	const addPhrases = () => {
		const phrases = parseSubs(formState.phrasesTextarea, false).map(elem => {
			const { id, start, end, body: text } = elem
			return { id, start, end, data: { text } }
		}) as Phrase[]
		playerMethods.updatePhrases({ phrases, randomIds: false, replace: true })
	}

	const addPeaks = () => {
		const peaks = JSON.parse(formState.peaksTextarea)
		playerMethods.setPeaks(peaks)
	}

	return (
		<>
			<section className='player'>
				<audio controls id='mediaElement' src={playerState.mediaLink} />
				<div id='waveformContainer' />
				<div id='timelineContainer' />
			</section>
			<div className='controls-container'>
				<div className='controls-column'>
					<section className='mediaControls'>
						<h3>Media controls</h3>
						<div>
							{playerState.isPlaying ? (
								<div
									onClick={() => playerMethods.pause()}
									className='play-button'
								>
									⏸️
								</div>
							) : (
								<div
									onClick={() => playerMethods.play()}
									className='play-button'
								>
									▶️
								</div>
							)}
							<label htmlFor='playbackRate'>Speed</label>
							<input
								type='number'
								placeholder='speed'
								id='playbackRate'
								min='0.25'
								max='2'
								step='0.25'
								value={formState.playbackRate}
								{...{ onChange }}
							/>
						</div>
						<div>
							<input
								type='text'
								placeholder='mediaLink'
								id='mediaLink'
								value={formState.mediaLink}
								{...{ onChange }}
							/>
							<button onClick={setMediaLink}>set mediaLink</button>
						</div>
					</section>
					<section className='dictation'>
						<h3>Dictation</h3>
						<div>
							<label htmlFor='repeatDelay'>Repeat delay</label>
							<input
								type='number'
								placeholder='repeatDelay'
								id='repeatDelay'
								min='1'
								value={formState.repeatDelay}
								{...{ onChange }}
							/>
						</div>
						<div>
							<label htmlFor='repeatCount'>Repeat count</label>
							<input
								type='number'
								placeholder='repeatCount'
								id='repeatCount'
								min='1'
								value={formState.repeatCount}
								{...{ onChange }}
							/>
						</div>
						<div>
							<label htmlFor='delayMeasure'>Delay measure</label>
							<select
								{...{ onChange }}
								id='delayMeasure'
								value={formState.delayMeasure}
								{...{ onChange }}
							>
								<option value='phraseLength'>phrase length</option>
								<option value='seconds'>seconds</option>
							</select>
						</div>

						<button onClick={playDictation}>play dictation</button>
					</section>
					<section className='peaks'>
						<h3>Peaks</h3>
						<div>
							<textarea
								id='peaksTextarea'
								placeholder='peaks'
								{...{ onChange }}
							/>
						</div>
						<div>
							<button onClick={addPeaks}>set peaks</button>
							<button onClick={() => playerMethods.removePeaks()}>
								remove peaks
							</button>
							<button onClick={() => playerMethods.calculatePeaks()}>
								calculate peaks
							</button>
						</div>
					</section>
				</div>
				<div className='controls-column'>
					<section className='phrases'>
						<h3>Phrases</h3>

						<div>
							<textarea
								id='phrasesTextarea'
								placeholder='phrases (captions, subtitles, timed text)'
								value={formState.phrasesTextarea}
								{...{ onChange }}
							/>
						</div>
						<div>
							<button onClick={addPhrases}>set phrases</button>
							<button onClick={() => playerMethods.removePhrases()}>
								remove phrases
							</button>
						</div>
					</section>
				</div>
				<div className='controls-column'>
					<section className='playerStateCode'>
						<h3>Player state</h3>
						<pre>{JSON.stringify(playerState, null, 2)}</pre>
					</section>
				</div>
			</div>
		</>
	)
}

export default PlayerExample

/*  <div className="phrasesToPlay">
          Click to play phrase:{' '}
          {playerState.phrases.slice(1).map((elem, index) => {
            return (
              <div className="phrase" key={`phrase-${index}`}>
                <div
                  className="num"
                  onClick={() => playerMethods.playPhrase(elem.id || '')}
                >
                  {index + 1}
                </div>
                <div
                  id={elem.id}
                  className="text"
                  contentEditable="true"
                  onBlur={e => {
                    const { currentTarget } = e;
                    const { id, innerText: text } = currentTarget;
                    playerMethods.updatePhrase({ id, data: { text } });
                  }}
                >
                  {elem?.data?.text}
                </div>
              </div>
            );
          })}
        </div> */
