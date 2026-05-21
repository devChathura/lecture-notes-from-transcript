import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [serverMessage, setServerMessage] = useState('Connecting to server...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setServerMessage(data.message))
      .catch((err) => setServerMessage('Failed to connect to server: ' + err.message));
  }, []);

  return (
    <div>
      <h1>Lecture Notes App</h1>
      <p>{serverMessage}</p>
    </div>
  );
}

export default App;
