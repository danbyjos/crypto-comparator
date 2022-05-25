import React, { useState } from "react";
import './App.css';
import logo from './images/crypto.jpg';
import LandingPage from './pages/LandingPage';
import "./styles/StylingFile.css";

const App = () => {

  const [showLanding, setShowLanding] = useState(false);

  const showLandingPage = (e) => {
    setShowLanding(true);
  }

  return (
    <div>
      {(showLanding) ?
      <div><LandingPage/></div> :
      <div className="App">
          <header className="App-header">
          <div class="padding-bottom-tiny">
            Welcome to Crypto Comparator. 
            <br/>Click
            <button name="expandAllBtn" className="landing_link_button text-huger"
              onClick={(e) =>  showLandingPage(e)}>Here</button>to view and compare crypto!
          </div>
            <img class="menu_link" src={logo} onClick={(e) =>  showLandingPage(e)} alt="logo" />
          </header>
        </div>
      }

    
    </div>
  );
};

export default App;
