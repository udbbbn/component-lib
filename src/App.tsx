import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

import Bullet from './bullet'
import Particle from './particles'
import VirtualList from './virtual-list'

function App() {

  return (
    <div className="App">
      {/* <Bullet></Bullet>
      <Particle></Particle> */}
      <VirtualList></VirtualList>
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
    </div>
  );
}

export default App;
