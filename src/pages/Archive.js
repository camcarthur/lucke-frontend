// src/pages/Archive.js
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    <div className="container pt-5">
      <h1>Archived Events</h1>
      {archived.length ? (
        <ul className="list-group mt-4">
          {archived.map(ev => (
            <li key={ev.id} className="list-group-item d-flex justify-content-between">
              <span><strong>{ev.name}</strong> <small>#{ev.id}</small></span>
              <span className="badge bg-danger">Closed</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted mt-4">No archived events yet.</p>
      )}
    </div>
  );
}
