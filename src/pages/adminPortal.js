// src/pages/AdminPortal.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { Trophy } from 'lucide-react';

const colors = {
  primaryStart: '#1a1a1a',
  primaryEnd: '#2e2e2e',
  rodeoAccent: '#198754',
  white: '#ffffff',
};

const styles = {
  page: {
    height: '100vh',
    background: `linear-gradient(135deg, ${colors.primaryStart} 0%, ${colors.primaryEnd} 100%)`,
    backgroundAttachment: 'fixed',
    padding: '2rem',
    fontFamily: `Segoe UI, Tahoma, Geneva, Verdana, sans-serif`,
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    color: colors.white,
  },
  card: {
    background: colors.white,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.rodeoAccent}`,
    padding: '1rem',
    marginBottom: '1rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    color: colors.white,
    margin: '2rem 0 1rem',
  },
  createButton: {
    marginBottom: '1rem',
  },
};

export default function AdminPortal() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [eventName, setEventName] = useState('');
  const [subEvents, setSubEvents] = useState([]);

  // load events
  useEffect(() => {
    fetchEvents();
  }, []);
  async function fetchEvents() {
    const res = await apiFetch('/api/events');
    setEvents(await res.json());
  }

  // start new-event mode
  function handleNewEventClick() {
    setIsCreating(true);
    setEventName('');
    setSubEvents([]);
  }

  // sub-event helpers
  function handleAddSubEvent() {
    setSubEvents([
      ...subEvents,
      {
        id: Date.now(),
        name: '',
        contestantCount: 1,
        gameType: 'default',
        contestants: [{ id: 1, name: '', price: 0 }],
      },
    ]);
  }
  function updateSub(i, changes) {
    const copy = [...subEvents];
    copy[i] = { ...copy[i], ...changes };
    setSubEvents(copy);
  }
  function handleSubEventNameChange(i, v) {
    updateSub(i, { name: v });
  }
  function handleSubEventGameTypeChange(i, v) {
    updateSub(i, { gameType: v });
  }
  function handleSubEventContestantCountChange(i, cnt) {
    updateSub(i, {
      contestantCount: cnt,
      contestants: Array.from({ length: cnt }, (_, j) => ({
        id: j + 1,
        name: '',
        price: 0,
      })),
    });
  }
  function handleSubEventContestantChange(si, ci, f, v) {
    const copy = [...subEvents];
    copy[si].contestants[ci][f] = f === 'price' ? Number(v) : v;
    setSubEvents(copy);
  }

  // create event
  async function handleCreateEvent(e) {
    e.preventDefault();
    await apiFetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: eventName,
        contestants: [],
        subEvents: subEvents.map(({ id, ...rest }) => rest),
      }),
    });
    setIsCreating(false);
    fetchEvents();
  }

  // actions: close, declare winner
  async function handleClose(evId) {
    const res = await apiFetch(`/api/events/${evId}/close`, { method: 'POST' });
    if (!res.ok) {
      const { error } = await res.json();
      alert(`Error closing: ${error}`);
    }
    fetchEvents();
  }
  async function handleDeclareWinner(evId, cid) {
    await apiFetch(`/api/events/${evId}/winner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contestantId: cid }),
    });
    fetchEvents();
  }
  async function handleDeclareSubWinner(evId, sid, cid) {
    await apiFetch(`/api/events/${evId}/sub-events/${sid}/winner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contestantId: cid }),
    });
    fetchEvents();
  }
  async function handleCloseSubEvent(evId, sid) {
    await apiFetch(`/api/events/${evId}/sub-events/${sid}/close`, {
      method: 'POST',
    });
    fetchEvents();
  }

  // split lists
  const active = events.filter((e) => e.status === 'open');
  const closed = events.filter((e) => e.status === 'closed');

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1>Admin Portal</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/betting')}
        >
          To Homepage
        </button>
      </div>

      <button
        style={styles.createButton}
        className="btn btn-primary"
        onClick={handleNewEventClick}
      >
        New Event
      </button>

      {isCreating && (
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Create New Event</h3>
          <form onSubmit={handleCreateEvent}>
            <div className="mb-3">
              <label>Event Name:</label>
              <input
                className="form-control"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
              />
            </div>

            <h4 style={styles.sectionTitle}>Sub-Events</h4>
            {subEvents.map((sub, i) => (
              <div key={sub.id} className="border p-3 mb-3">
                <div className="mb-2">
                  <label>Name:</label>
                  <input
                    className="form-control"
                    value={sub.name}
                    onChange={(e) =>
                      handleSubEventNameChange(i, e.target.value)
                    }
                    required
                  />
                </div>
                <div className="mb-2">
                  <label># Contestants:</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={sub.contestantCount}
                    onChange={(e) =>
                      handleSubEventContestantCountChange(
                        i,
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="mb-2">
                  <label>Game Type:</label>
                  <select
                    className="form-control"
                    value={sub.gameType}
                    onChange={(e) =>
                      handleSubEventGameTypeChange(i, e.target.value)
                    }
                  >
                    <option value="default">Default</option>
                    <option value="first-come-first-serve">
                      First Come First Serve
                    </option>
                    <option value="bidding">Bidding</option>
                  </select>
                </div>
                {sub.contestants.map((c, ci) => (
                  <div key={c.id} className="mb-2 ps-3">
                    <label>Contestant #{c.id} Name</label>
                    <input
                      className="form-control mb-1"
                      value={c.name}
                      onChange={(e) =>
                        handleSubEventContestantChange(
                          i,
                          ci,
                          'name',
                          e.target.value
                        )
                      }
                      required
                    />
                    <label>
                      {sub.gameType === 'bidding' ? 'Starting Bid' : 'Price'}
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      value={c.price}
                      onChange={(e) =>
                        handleSubEventContestantChange(
                          i,
                          ci,
                          'price',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                ))}
              </div>
            ))}

            <div className="d-flex flex-column">
              <button
                type="button"
                className="btn btn-primary mb-2"
                onClick={handleAddSubEvent}
              >
                Add Sub-Event
              </button>
              <button
                type="submit"
                className={`btn ${
                  subEvents.length > 0 ? 'btn-success' : 'btn-secondary'
                } w-100 mt-2`}
                disabled={subEvents.length === 0}
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      )}

      <h2 style={styles.sectionTitle}>Active Events</h2>
      <div className="accordion" id="activeAccordion">
        {active.map((ev) => (
          <div style={styles.card} key={ev.id}>
            <div className="card-header">
              <h5>
                Event #{ev.id} — {ev.name} (open)
              </h5>
            </div>
            <div className="card-body">
              <h6>Main Contestants</h6>
              {ev.contestants.map((c) => (
                <div
                  key={c.id}
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <span>
                    {c.name} — ${c.price}
                    {ev.winningContestant === c.id && (
                      <Trophy
                        size={16}
                        strokeWidth={1.5}
                        className="ms-2 text-warning"
                      />
                    )}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => handleDeclareWinner(ev.id, c.id)}
                  >
                    Set Winner
                  </button>
                </div>
              ))}

              {ev.subEvents?.length > 0 && (
                <>
                  <h6 className="mt-3">Sub-Events</h6>
                  {ev.subEvents.map((sub) => (
                    <div key={sub.id} className="mb-3 border p-2">
                      <strong>
                        {sub.name} ({sub.status})
                      </strong>
                      {sub.contestants.map((c) => (
                        <div
                          key={c.id}
                          className="d-flex justify-content-between align-items-center mt-1"
                        >
                          <span>
                            {c.name} — ${c.price}
                            {sub.winningContestant === c.id && (
                              <Trophy
                                size={14}
                                strokeWidth={1.4}
                                className="ms-2 text-warning"
                              />
                            )}
                          </span>
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() =>
                              handleDeclareSubWinner(ev.id, sub.id, c.id)
                            }
                          >
                            Set Sub Winner
                          </button>
                        </div>
                      ))}
                      <button
                        className="btn btn-danger btn-sm mt-2"
                        onClick={() => handleCloseSubEvent(ev.id, sub.id)}
                      >
                        Close Sub-Event
                      </button>
                    </div>
                  ))}
                </>
              )}

              <button
                className="btn btn-danger mt-3"
                onClick={() => handleClose(ev.id)}
              >
                Close Main Event
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 style={styles.sectionTitle}>Closed Events</h2>
      <div className="accordion" id="closedAccordion">
        {closed.map((ev) => (
          <div style={styles.card} key={ev.id}>
            <div className="card-header">
              <h5>
                Event #{ev.id} — {ev.name} (closed)
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted">This event is closed.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
