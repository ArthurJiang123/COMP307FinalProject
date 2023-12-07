import React, { useState } from "react";

import "./registration_styles.css";

const Registration = ({ onLoginClick, onRegistrationSuccess }) => {
  // State variables for user's McGill email and password
  const [mcgillEmail, setMcgillEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [preferredName, setPreferredName] = useState("");

  // Handler for Fullname registration
  const handleFullnameRegistration = (event) => {
    setFullName(event.target.value);
  };

  // Handler for McGill registration
  const handleMcgillEmailRegistration = (event) => {
    setMcgillEmail(event.target.value);
  };

  // Handler for preferred name registration
  const handlePreferredNameRegistration = (event) => {
    setPreferredName(event.target.value);
  };

  // Handler for password registration
  const handlePasswordRegistration = (event) => {
    setPassword(event.target.value);
  };

  // Handler for form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("McGill Email:", mcgillEmail, "Password:", password);

    // Check if the username, password, or email exceed the character limits
    if (preferredName.length > 45) {
      alert("Preferred name should not exceed 45 characters.");
      return;
    }

    if (fullName.length > 45) {
      alert("Full Name should not exceed 45 characters.");
      return;
    }

    if (password.length > 50) {
      alert("Password should not exceed 50 characters.");
      return;
    }

    if (mcgillEmail.length > 50) {
      alert("Email should not exceed 50 characters.");
      return;
    }

    const userData = {
      fullname: fullName,
      username: preferredName,
      password: password,
      email: mcgillEmail,
    };

    try {
      //const response = await fetch(`${process.env.REACT_APP_URL_PREFIX}:${process.env.REACT_APP_SERVER_PORT}${process.env.REACT_APP_SIGNUP_API}`, {
      const response = await fetch(
        `${process.env.REACT_APP_URL_PREFIX}${process.env.REACT_APP_SIGNUP_API}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Registration Successful", data);
        onRegistrationSuccess(); // Call the callback to redirect after successful registration
      } else {
        console.error("Registration failed:", data.message);
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  // Rendering the registration form
  return (
    <div className="outer">
      <div className="container">
        <div className="registration-row row">
          <div className="col-sm-10 col-md-8 col-lg-6 mx-auto">
            <div className="register-container">
              <p className="registration-message">Create Account</p>
              <form className="registration-form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="fullName"> Name</label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName} // Remember to set up different state variables for each input
                    onChange={handleFullnameRegistration}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="preferredName">Preferred Name</label>
                  <input
                    id="preferredName"
                    type="text"
                    value={preferredName} // This should probably be a different state variable
                    onChange={handlePreferredNameRegistration}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="mcgillEmail">Email</label>
                  <input
                    id="mcgillEmail"
                    type="email"
                    value={mcgillEmail}
                    onChange={handleMcgillEmailRegistration}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordRegistration}
                    required
                  />
                </div>

                <div className="reg-button">
                  <button type="submit" className="btn btn-primary">
                    Sign Up
                  </button>
                </div>
              </form>
              <p className="account-exists">
                Already have an account?{" "}
                <span className="link-button-reg" onClick={onLoginClick}>
                  Login
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
