// src/pages/AuthPage.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const colors = {
  primaryStart: '#4b1e0d',      // Deep burnt orange (almost brown)
  primaryEnd: '#7a2e10',        // Rich, dark orange
  buttonColor: '#cc5500',       // Burnt orange for CTA
  accent: '#cc5500',
  rodeoAccent: '#cc5500',
  white: '#fff',
  grayLight: '#ddd',
  grayDark: '#555',
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${colors.primaryStart} 0%, ${colors.primaryEnd} 100%)`,
    fontFamily: `Segoe UI, Tahoma, Geneva, Verdana, sans-serif`,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    color: colors.white,
    fontSize: '2.5rem',
    margin: 0,
  },
  card: {
    background: colors.white,
    borderRadius: 10,
    padding: 30,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    width: 320,
    border: `1px solid ${colors.rodeoAccent}`,
  },
  toggleContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  toggleButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '1.1rem',
    cursor: 'pointer',
    padding: '10px 20px',
    color: colors.grayDark,
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease',
  },
  activeButton: {
    color: colors.accent,
    borderBottom: `2px solid ${colors.rodeoAccent}`,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: 10,
    marginBottom: 15,
    border: `1px solid ${colors.grayLight}`,
    borderRadius: 5,
    fontSize: '1rem',
  },
  submitButton: {
    padding: 10,
    border: 'none',
    borderRadius: 5,
    background: colors.buttonColor,
    color: colors.white,
    fontSize: '1rem',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
};

export default function AuthPage() {
  const { login, signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
  
    const { username, email, password, confirmPassword } = form;
  
    if (!username || !password || (!isLogin && !confirmPassword)) {
      setError('Please fill in all fields');
      return;
    }
  
    if (!isLogin) {
      // 1) passwords match?
      if (password !== confirmPassword) {
        setError('Passwords don’t match');
        return;
      }
      // 2) simple email‐format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }
    }
  
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await signup(username, email, password);
      }
      navigate('/betting');
    } catch {
      setError(isLogin ? 'Invalid credentials' : 'Signup failed');
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img
          src="/assets/logo.png"
          alt="Calcutta Logo"
          style={styles.logo}
        />
        <h1 style={styles.title}>Calcutta Betting</h1>
      </header>

      <div style={styles.card}>
        <div style={styles.toggleContainer}>
          <button
            style={{
              ...styles.toggleButton,
              ...(isLogin ? styles.activeButton : {}),
            }}
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
          >
            Login
          </button>
          <button
            style={{
              ...styles.toggleButton,
              ...(!isLogin ? styles.activeButton : {}),
            }}
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
          >
            Signup
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form style={styles.form} onSubmit={handleSubmit}>
            <input
                name="username"
                placeholder={isLogin ? "Username or Email" : "Username"}
                style={styles.input}
                value={form.username}
                onChange={handleChange}
            />

            {!isLogin && (
                <input
                name="email"
                type="email"
                placeholder="Email"
                style={styles.input}
                value={form.email}
                onChange={handleChange}
                />
            )}

            <input
                name="password"
                type="password"
                placeholder="Password"
                style={styles.input}
                value={form.password}
                onChange={handleChange}
            />

            {!isLogin && (
                <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                style={styles.input}
                value={form.confirmPassword}
                onChange={handleChange}
                />
            )}

            <button type="submit" style={styles.submitButton}>
                {isLogin ? 'Login' : 'Sign Up'}
            </button>
            </form>
      </div>
    </div>
  );
}
