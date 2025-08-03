import React from 'react';

function TestApp() {
  return React.createElement('div', {
    style: { 
      padding: '20px', 
      backgroundColor: 'red', 
      minHeight: '100vh',
      color: 'white',
      fontSize: '24px'
    }
  }, [
    React.createElement('h1', { key: '1' }, 'REACT IS WORKING!'),
    React.createElement('p', { key: '2' }, 'If you can see this red background, React is rendering correctly.'),
    React.createElement('p', { key: '3' }, `Current time: ${new Date().toLocaleTimeString()}`)
  ]);
}

export default TestApp;
