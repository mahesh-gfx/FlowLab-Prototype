import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import WorkflowCanvas from "./components/WorkflowCanvas";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import setupAxiosInterceptors from "./api/axiosInterceptor";

import AppBar from "./components/AppBar";
import UserMenu from "./components/UserMenu";
import WorkflowOptions from "./components/WorkflowOptions";
import { WorkflowProvider } from "./context/WorkflowContext";

const App: React.FC = () => {
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  return (
    <WorkflowProvider>
      <Router>
        <div className="App">
          <HeaderWithConditionalComponent />
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflow/:id"
              element={
                <ProtectedRoute>
                  <WorkflowCanvas />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </WorkflowProvider>
  );
};

const HeaderWithConditionalComponent: React.FC = () => {
  const location = useLocation();

  const getRightComponent = () => {
    if (location.pathname.startsWith("/workflow")) {
      return WorkflowOptions;
    } else if (location.pathname === "/") {
      return UserMenu;
    }
    return null;
  };

  const RightComponent = getRightComponent();

  return <AppBar RightComponent={RightComponent} />;
};

export default App;
