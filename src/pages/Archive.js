// src/pages/Archive.js
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';

const colors = {
  primaryStart: '#1a1a1a',
  primaryEnd: '#2e2e2e',
  text:       '#ddd',
  cardBg:     '#2e2e2e',
  badgeBg:    '#c0392b',
  badgeText:  '#fff',
};

const styles = {
  container: {
    minHeight: '100vh',
    paddingTop: '3rem',
    paddingBottom: '3rem',
    background: `linear-gradient(135deg, ${colors.primaryStart} 0%, ${colors.primaryEnd} 100%)`,
    color: colors.text,
    fontFamily: `Segoe UI, Tahoma, Geneva, Verdana, sans-serif`,
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    fontSize: '2.25rem',
    fontWeight: '600',
  },
  list: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: 0,
    listStyle: 'none',
  },
  listItem: {
    background: colors.cardBg,
    border: 'none',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    padding: '1rem 1.5rem',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontSize: '1.1rem',
    fontWeight: '500',
  },
  idText: {
    marginLeft: '0.5rem',
    color: '#888',
    fontSize: '0.9rem',
  },
  badge: {
    background: colors.badgeBg,
    color: colors.badgeText,
    borderRadius: '0.25rem',
    padding: '0.25rem 0.6rem',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  emptyState: {
    textAlign: 'center',
    marginTop: '2rem',
    color: '#777',
    fontStyle: 'italic',
  },
};

export default function Archive() {
  const [archived, setArchived] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await apiFetch('/api/events', { credentials: 'include' });
      const all = await res.json();
      setArchived(all.filter(ev => ev.status === 'closed'));
    }
    load();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Archived Events</h1>

      {archived.length > 0 ? (
        <ul style={styles.list}>
          {archived.map(ev => (
            <li key={ev.id} style={styles.listItem}>
              <div>
                <span style={styles.titleText}>{ev.name}</span>
                <span style={styles.idText}>#{ev.id}</span>
              </div>
              <span style={styles.badge}>Closed</span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.emptyState}>No archived events yet.</p>
      )}
    </div>
  );
}
