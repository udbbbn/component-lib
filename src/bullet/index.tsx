import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import ReactDOM from 'react-dom';
import Danmaku, { DanmakuUi } from './danmaku'
import './index.scss';

function useId() {
  const [id, setId] = useState(1);
  const set = () => {
    // setId()
  }
  return []
}

function usePrevious(value: any) {
  const ref = useRef();
  console.log('usePrevious', value);
  useEffect(() => {
    console.log('useEffect', value);
    ref.current = value;
    console.log('current', value);
  });
  return ref.current;
}

// 使用
function Counter() {
  const [count, setCount] = useState(0);
  console.log('counter', count);
  const prevCount = usePrevious(count);
  console.log('prevCount', prevCount);
  return <h1 onClick={() => setCount(Math.random())}>Now: {count}, before: {prevCount}</h1>;
}

export default function Bullet() {
  const [screen, setScreen] = useState<Danmaku | null>(null);
  const [count, setCount] = useState(0);
  // const [danmaku, setDanmaku] = useState([{
  //   id: 1,
  //   // width: 100,
  //   // height: 20,
  //   top: 20,
  //   left: 700,
  //   startTime: 20,
  //   duration: 15,
  //   content: '弹幕开发'
  // }]);

  let inputValue = '';

  useEffect(() => {
    const _screen = new Danmaku('.main-wrapper');
    setScreen(_screen);
  }, [])

  function pushDanmaku() {
    const msg = inputValue;
    const params = { msg } ;
    screen?.push(
      <DanmakuUi
        {...params}
      ></DanmakuUi>,
      {
        onMouseEnter: function(...arg: any){console.log(this, ...arg)},
        onMouseLeave: function(...arg: any){console.log(this, ...arg)},
        onMouseClick: (...arg: any) => {console.log(...arg)},
      }
    )
  }


  const inputHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    inputValue = value;
  }

  return (
    <React.Fragment>
      <div className='main-wrapper'>
        {
          // danmaku.map(el => (<div key={el.id} className='danmaku'>{el.content}</div>))
        }
      </div>
      <div><input type="text" onChange={(e) => inputHandler(e)} /><div onClick={pushDanmaku}>确认</div></div>
      <Counter></Counter>
    </React.Fragment>
  )
}