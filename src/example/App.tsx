import React, { useEffect } from 'react'
import { PlayerProvider } from '../components/Wavesurfer/Provider'
import PlayerExample from './PlayerExample'

const mediaLink =
	'https://archive.org/download/aliceinwonderland_02_02/aliceinwonderland_01_01.mp3'

const phrasesProps = {
	phrases: [],
	randomIds: false
}

function App() {
	// Create the container elements when the component mounts
	useEffect(() => {
		// Create waveform container if it doesn't exist
		if (!document.getElementById('waveformContainer')) {
			const waveformContainer = document.createElement('div')
			waveformContainer.id = 'waveformContainer'
			document.body.appendChild(waveformContainer)
		}

		// Create timeline container if it doesn't exist
		if (!document.getElementById('timelineContainer')) {
			const timelineContainer = document.createElement('div')
			timelineContainer.id = 'timelineContainer'
			document.body.appendChild(timelineContainer)
		}

		// Create media element if it doesn't exist
		if (!document.getElementById('mediaElement')) {
			const mediaElement = document.createElement('audio')
			mediaElement.id = 'mediaElement'
			mediaElement.src = mediaLink
			// mediaElement.style.display = 'none'
			document.body.appendChild(mediaElement)
		}
	}, [])

	return (
		<div className='App'>
			<header className='App-header'>
				<h1>React Wavesurfer Provider</h1>
				<p>
					A React provider wrapper for wavesurfer.js, for subtitles editor and
					phrasal player
				</p>
			</header>

			<main>
				<div className='demo-section'>
					<div className='player-container'>
						<PlayerProvider
							{...{
								mediaLink,
								phrasesProps,
								wavesurferOptions: {
									minPxPerSec: 150,
									container: '#waveformContainer' as any
								},
								regionsOptions: { contentEditable: true },
								peeks: []
							}}
						>
							<PlayerExample />
						</PlayerProvider>
					</div>
				</div>

				<div className='info-section'>
					<h3>About This Component</h3>
					<p>
						This WaveSurfer React component provides a powerful interface for
						audio visualization and manipulation. It supports regions, timeline,
						and various audio controls.
					</p>
					<p>Features include:</p>
					<ul>
						<li>Audio waveform visualization</li>
						<li>Timeline display</li>
						<li>Region selection and manipulation</li>
						<li>Playback controls</li>
						<li>Customizable appearance</li>
					</ul>
				</div>
			</main>

			<footer className='App-footer'>
				<p>React Wavesurfer Provider &copy; {new Date().getFullYear()}</p>
			</footer>
		</div>
	)
}

export default App
