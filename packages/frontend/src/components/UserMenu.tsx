import React from "react";
import "./styles/userMenu.css";
import LogoutButton from "./LogoutButton";

const UserMenu: React.FC = () => {
  return (
    <div className="user-menu">
      <LogoutButton />
    </div>
  );
};

export default UserMenu;
