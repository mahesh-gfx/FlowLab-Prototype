import React from "react";
import "./styles/appBar.css";
import appLogo from "../assets/images/flowLab.png";

interface AppBarProps {
  RightComponent?: React.FC | null;
}

const AppBar: React.FC<AppBarProps> = ({ RightComponent }) => {
  return (
    <div className="app-bar">
      <div className="app-bar-left">
        <img src={appLogo} alt="App Logo" className="app-logo" />
      </div>
      <div className="app-bar-right">
        {RightComponent && <RightComponent />}
      </div>
    </div>
  );
};

export default AppBar;
