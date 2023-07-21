import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import { Button } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';

import Table from 'react-bootstrap/Table';
const NUMB_OF_WORDS = 20;
const SECONDS = 60;

const App = () => {
  const [words, setWords] = useState([]);
  const [countDownReal, setCountDownReal] = useState(SECONDS);
  const [countDown, setCountDown] = useState(SECONDS);
  const [status, setStatus] = useState('not-started');
  const [currWordIndex, setCurrWordIndex] = useState(0);
  const [currCharIndex, setCurrCharIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [wrongWords, setWrongWords] = useState([]);
  const textInput = useRef(null);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await axios.get('http://localhost:4000/get_couples');
        setWords(response.data.slice(0, NUMB_OF_WORDS));
      } catch (error) {
        console.error('Error fetching words:', error);
      }
    };

    fetchWords();
  }, []);

  useEffect(() => {
    if (status === 'started') {
      const timer = setInterval(() => {
        setCountDown(prevCountDown => prevCountDown - 1);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [status]);

  useEffect(() => {
    if (countDown === 0) {
      setStatus('finished');
    }
  }, [countDown]);

  useEffect(() => {
    if (status === 'started') {
      textInput.current.focus();
    }
  }, [status]);

  const handleInputChange = e => {
    const value = e.target.value;
    setInputValue(value);
  
    if (status === 'started') {
      if (value === words[currWordIndex]) {
        setCurrWordIndex(prevIndex => prevIndex + 1);
        setCurrCharIndex(0);
        setInputValue('');
  
        // Check if it's the last word
        if (currWordIndex === words.length - 1) {
          setStatus('finished');
          setCountDownReal(countDown);
          setCountDown(0);
        }
      } else if (words[currWordIndex].startsWith(value)) {
        setCurrCharIndex(value.length);
      } else {
        if(wrongWords.includes(words[currWordIndex]) === false){
          setWrongWords(prevWrongWords => [...prevWrongWords, words[currWordIndex]]);
        }
        setCurrCharIndex(0);
      }
    }
  };
  

  const handleStartGame = () => {
    setStatus('started');
    setCountDown(SECONDS);
    setCurrWordIndex(0);
    setCurrCharIndex(0);
    setInputValue('');
    setWrongWords([]);
  };

  const calculateTypingSpeed = (real) => {
    const wordsTyped = currWordIndex;
  const timeInSeconds = (real ? SECONDS - countDownReal : SECONDS - countDown);
  let typingSpeed;

  if (timeInSeconds === 0) {
    typingSpeed = Math.round((wordsTyped / SECONDS) * 60); // or some maximum value
  } else {
    typingSpeed = Math.round((wordsTyped / timeInSeconds) * 60);
  }

  return typingSpeed;
  };

  const calculateAccuracy = () => {
    const totalWordsTyped = currWordIndex;
    const wrongWordsTyped = wrongWords.length;
    const accuracy = Math.round(((totalWordsTyped - wrongWordsTyped) / totalWordsTyped) * 100);
    return accuracy;
  };

  return (
    <div className="App">
    <Card bg = "warning" style={{ width: '28rem', height: '28rem' }}>
      <div className="section1">
      <Card.Header><h1>Type Racer Game</h1></Card.Header></div>
      <div className="section">
        {status === 'not-started' && (
          <Button variant="info" size="lg" onClick={handleStartGame} >Start Game</Button>
          
        )}
        
        {status === 'started' && (
          <div>
          <div className="section1">
            <p>Time remaining: {countDown} seconds</p>
            <p>Type the following words:</p>
            </div>
            <p>
              {words.map((word, index) => (
                <span
                  key={index}
                  style={{
                    color:
                      index < currWordIndex
                        ? 'green'
                        : index === currWordIndex
                        ? word.startsWith(inputValue)
                          ? 'black'
                          : 'red'
                        : 'black',
                  }}
                >
                  {word}{' '}
                </span>
              ))}
            </p>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              autoFocus
              disabled={status !== 'started'}
              ref={textInput}
              style={{ width: '26rem', height:'3rem', textAlign: 'center' }}
              
            />
            
            <Table striped  style={{ marginTop:'15px' }}
              >
      <thead>
        <tr>
          
          <th>Words typed</th>
          <th>{currWordIndex}</th>
          
        </tr>
        <tr>
          
          <th>Typing speed</th>
          <th>{calculateTypingSpeed(false)}</th>
          
        </tr>
        <tr>
          
          <th>Characters typed</th>
          <th>{currCharIndex}</th>
          
        </tr>
      </thead>
     </Table>
          </div>
        )}
        {status === 'finished' && (
          <div >
            <p>Game finished!</p>
            <p>Typing speed: {calculateTypingSpeed(true)} words per minute</p>
            <p>Accuracy: {calculateAccuracy()}%</p>
            <p>Wrong words typed: {wrongWords.length}</p>
            <p>Wrong words: {wrongWords.join(', ')}</p>
           <span className='replay-btn'> <Button variant="info" size="lg" onClick={handleStartGame}>Start Again</Button> </span>
          </div>
        )}
      </div>
      </Card>
    </div>
  );
};

export default App;