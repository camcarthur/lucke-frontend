// src/pages/Withdraw.js
import React from 'react';

const colors = {
  primaryStart: '#1a1a1a',
  primaryEnd:   '#2e2e2e',
  text:         '#ddd',
  subtitle:     '#888',
};

const styles = {
  container: {
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
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💸 Withdrawal</h1>
      <p style={styles.subtitle}>Withdrawal feature coming soon!</p>
    </div>
  );
}
