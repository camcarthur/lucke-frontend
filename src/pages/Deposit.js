// src/pages/Withdraw.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const colors = {
  primaryStart: '#1a1a1a',
  primaryEnd:   '#2e2e2e',
  text:         '#ddd',
  subtitle:     '#888',
};

const styles = {
  container: {
    position: 'relative',         // for absolute-button placement
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: `linear-gradient(135deg, ${colors.primaryStart} 0%, ${colors.primaryEnd} 100%)`,
    fontFamily: `Segoe UI, Tahoma, Geneva, Verdana, sans-serif`,
    color: colors.text,
    textAlign: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'transparent',
    border: '1px solid #555',
    borderRadius: '0.25rem',
    color: colors.text,
    padding: '0.25rem 0.5rem',
    cursor: 'pointer',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: colors.subtitle,
    fontStyle: 'italic',
  },
};

export default function Withdraw() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <button
        style={styles.backBtn}
        onClick={() => navigate('/betting')}
      >
        ← Back
      </button>

      <h1 style={styles.title}>💸 Deposit</h1>
      <p style={styles.subtitle}>Deposit feature coming soon!</p>
    </div>
  );
}
