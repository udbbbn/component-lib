import React, { useState } from 'react';

function Test() {

  const [number, setNumber] = useState(0);


  if (number === 5) {
    throw 'error'
  } 

  return (
    <div>
      <button onClick={() =>setNumber(prev => ++prev)}>set Number</button>
      {number}
    </div>
  );
}

export default Test;
