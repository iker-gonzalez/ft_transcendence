import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Welcome to <code>ft_transcendence</code>project made by<br />
          @ikgonzal<br /> @ngasco<br />@zcanales<br />@dgerwig
        </p>
        <a
          className="App-link"
          href="https://github.com/iker-gonzalez/ft_transcendence"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to source code
        </a>
      </header>
    </div>
  );
}

export default App;
