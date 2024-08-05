import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./styles/login.css";
import { register } from "../api/auth";
import PopupMessage from "./PopupMessage";

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [age, setAge] = useState<number>(0);
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [popupMessage, setPopupMessage] = useState<string>("");
  const [popupType, setPopupType] = useState<string>("invisible");
  const navigate = useNavigate();

  const handleTick = (remainingSeconds: number) => {};
  const handleComplete = () => {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Handle registration logic here
    console.log(
      "First Name:",
      firstName,
      "Last Name:",
      lastName,
      "Email:",
      email,
      "Age:",
      age,
      "Password:",
      password
    );
    await register(firstName, lastName, age, email, password).then(
      (response) => {
        if (response.error) {
          setError(response.message);
        } else if ((response.status = 201)) {
          // timer(5, handleTick, handleComplete);
          setPopupType("success");
          setPopupMessage(
            "Registered Successfully! Redirecting you to the login page in 5 seconds..."
          );

          setTimeout(() => {
            navigate("/");
          }, 5000);
        } // Redirect to dashboard after registration
      }
    );
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
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
          <label htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
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
          Register
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      <Link to="/login" className="auth-link">
        Already have an account? Login here
      </Link>
      <PopupMessage
        message={popupMessage}
        type={popupType}
        onClose={() => {
          setError("");
          setPopupMessage("");
        }}
      />
    </div>
  );
};

export default Register;
