import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios';
import { FaMicrophone, FaStop } from 'react-icons/fa';

function App() {

  const [transcription, setTranscription] = useState('');
  const [serverData, setServerData] = useState('');

  const fetchServerData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/data');
      setServerData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchServerData();
  }, []);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    let interimTranscription = '';
    let finalTranscription = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscription += transcript;
      } else {
        interimTranscription += transcript;
      }
    }

    setTranscription(finalTranscription);
    sendTranscription(finalTranscription); // send transcription to Flask server
  };

  recognition.onerror = (event) => {
    console.error(event);
  };

  const startTranscription = () => {
    recognition.start();
  };

  const stopTranscription = () => {
    recognition.stop();
  };

  const sendTranscription = async (transcription) => {
    try {
      const response = await axios.post('http://localhost:5000/transcription', {
        transcription: transcription
      });
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <input type="text" defaultValue={transcription}/>
      <button onClick={startTranscription}><FaMicrophone /></button>
      <button onClick={stopTranscription}><FaStop/></button>
      <p>Server data: {serverData}</p>
    </div>
  );
}

export default App
