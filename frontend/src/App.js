import { useState, useEffect } from 'react';
import Nav from './components/nav/Nav';
import Main from './components/main/Main';
import './App.scss';

function App() {
  const [ fetching, setFetching ] = useState(false);

  return (
    <div className="App">
      <Nav />
      <Main 
        fetching={ fetching }
      />
    </div>
  );
}

export default App;
