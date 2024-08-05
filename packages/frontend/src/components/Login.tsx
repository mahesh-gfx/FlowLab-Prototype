import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { login } from "../store/authSlice";
import { login as apiLogin } from "../api/auth"; // Assuming you have this function
import "./styles/login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await apiLogin(email, password);
      dispatch(login({ token: response.token, user: response.user }));
      navigate("/"); // Redirect to dashboard after login
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Login
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      <Link to="/register" className="auth-link">
        Don't have an account? Register here
      </Link>
    </div>
  );
};

export default Login;
