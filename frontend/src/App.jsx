import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/messages', {
        msg: inputValue,
      });
  
      const checkAudioReady = setInterval(async () => {
        const audioResponse = await axios.get(`http://localhost:3000/`, {
          responseType: 'blob',
        });
  
        if (audioResponse !== 'not ready') {
          setAudioBlob(audioResponse.data);
          setLoading(false);
          clearInterval(checkAudioReady); // Stop polling
        }
      }, 1000); // Adjust the polling interval as needed
    } catch (error) {
      console.error(error);
    }
  };
  
  
  useEffect(() => {
    if (audioBlob) {
      const audioElement = document.getElementById('audioElement');
      audioElement.src = URL.createObjectURL(audioBlob);
    }
  }, [audioBlob]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={inputValue} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
      {audioBlob && (
        <div>
          {loading ? <p>Loading...</p> : null}
          {loading ? null :
          <audio id="audioElement" autoPlay>
            Your browser does not support the audio element.
          </audio>}
        </div>
      )}
    </div>
  );
}

export default App;
