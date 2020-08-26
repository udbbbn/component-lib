import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

import Bullet from './bullet'
import Particle from './particles'
import VirtualList, { REFRESH_STATUS } from './virtual-list'

function App() {

  const [refreshStatus, setRefreshStatus] = useState<REFRESH_STATUS>(REFRESH_STATUS.pending);

  function virtualListRefresh() {
    setRefreshStatus(REFRESH_STATUS.ongoing);
    setTimeout(() => {
      setRefreshStatus(REFRESH_STATUS.idle);
      setTimeout(() => {
        setRefreshStatus(REFRESH_STATUS.pending);
      }, 500)
    }, 1500);
  }

  return (
    <div className="App">
      {/* <Bullet></Bullet>
      <Particle></Particle> */}
      <VirtualList refreshCallBack={virtualListRefresh} refreshStatus={refreshStatus}></VirtualList>
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
