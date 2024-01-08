import 'react-app-polyfill/ie11';
import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { PlayerProvider } from '../.';
import PlayerExample from './PlayerExample';

const mediaLink =
  'https://firebasestorage.googleapis.com/v0/b/ismail-player.appspot.com/o/content%2Fmedia%2Fted-explained.mp4?alt=media&token=849048d2-4d18-4e03-80b8-bce3bf9fee57';

const phrasesProps = {
  phrases: [],
  randomIds: false,
};

const App = () => {
  return (
    //@ts-ignore
    <PlayerProvider
      {...{
        mediaLink,
        phrasesProps,
        wavesurferOptions: { minPxPerSec: 150 },
        regionsOptions: { contentEditable: false },
        peeks: [],
      }}
    >
      <PlayerExample />
    </PlayerProvider>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ReactDOM.render(<App />, document.getElementById('root'));
