// src/pages/AdminPortal.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { Trophy } from 'lucide-react';

export default function AdminPortal() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [eventName, setEventName] = useState('');
  const [subEvents, setSubEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await apiFetch('/api/events');
      const data = await res.json();
      // Normalize into an array
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.events)
        ? data.events
        : [];
      setEvents(list);
    } catch (err) {
      if (err.status === 401) {
        return navigate('/login');
      }
      console.error('Error fetching events:', err);
      setEvents([]);
    }
  }

  function handleNewEventClick() {
    setIsCreating(true);
    setEventName('');
    setSubEvents([]);
  }

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

  function updateSub(idx, changes) {
    const copy = [...subEvents];
    copy[idx] = { ...copy[idx], ...changes };
    setSubEvents(copy);
  }

  function handleSubEventNameChange(idx, value) {
    updateSub(idx, { name: value });
  }

  function handleSubEventGameTypeChange(idx, value) {
    updateSub(idx, { gameType: value });
  }

  function handleSubEventContestantCountChange(idx, count) {
    const contestants = [];
    for (let i = 1; i <= count; i++) {
      contestants.push({ id: i, name: '', price: 0 });
    }
    updateSub(idx, { contestantCount: count, contestants });
  }

  function handleSubEventContestantChange(subIdx, cIdx, field, value) {
    const copy = [...subEvents];
    copy[subIdx].contestants[cIdx][field] =
      field === 'price' ? Number(value) : value;
    setSubEvents(copy);
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    const payload = {
      name: eventName,
      subEvents: subEvents.map(({ id, ...rest }) => rest),
    };
    try {
      await apiFetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setIsCreating(false);
      fetchEvents();
    } catch (err) {
      if (err.status === 401) return navigate('/login');
      console.error('Error creating event:', err);
    }
  }

  async function handleClose(eventId) {
    try {
      const res = await apiFetch(`/api/events/${eventId}/close`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        return alert(`Error: ${data.error}`);
      }
      fetchEvents();
    } catch (err) {
      if (err.status === 401) return navigate('/login');
      console.error('Error closing event:', err);
    }
  }

  async function handleDeclareWinner(eventId, contestantId) {
    try {
      await apiFetch(`/api/events/${eventId}/winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestantId }),
      });
      fetchEvents();
    } catch (err) {
      if (err.status === 401) return navigate('/login');
      console.error('Error declaring winner:', err);
    }
  }

  async function handleDeclareSubWinner(eventId, subId, contestantId) {
    try {
      await apiFetch(
        `/api/events/${eventId}/sub-events/${subId}/winner`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contestantId }),
        }
      );
      fetchEvents();
    } catch (err) {
      if (err.status === 401) return navigate('/login');
      console.error('Error declaring sub-event winner:', err);
    }
  }

  async function handleCloseSubEvent(eventId, subId) {
    try {
      await apiFetch(
        `/api/events/${eventId}/sub-events/${subId}/close`,
        { method: 'POST' }
      );
      fetchEvents();
    } catch (err) {
      if (err.status === 401) return navigate('/login');
      console.error('Error closing sub-event:', err);
    }
  }

  return (
    <div className="container pt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Portal</h1>
        <button className="btn btn-primary" onClick={() => navigate('/betting')}>
          To Homepage
        </button>
      </div>

      {/* New Event */}
      <button className="btn btn-primary mb-3" onClick={handleNewEventClick}>
        New Event
      </button>

      {/* Create Event Form */}
      {isCreating && (
        <div className="card p-3 mb-4">
          <h3>Create New Event</h3>
          <form onSubmit={handleCreateEvent}>
            <div className="mb-3">
              <label>Event Name:</label>
              <input
                type="text"
                className="form-control"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
              />
            </div>

            <h4>Sub-Events</h4>
            {subEvents.map((se, idx) => (
              <div key={se.id} className="border p-3 mb-3">
                <div className="mb-2">
                  <label>Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={se.name}
                    onChange={(e) =>
                      handleSubEventNameChange(idx, e.target.value)
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
                    value={se.contestantCount}
                    onChange={(e) =>
                      handleSubEventContestantCountChange(
                        idx,
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="mb-2">
                  <label>Game Type:</label>
                  <select
                    className="form-control"
                    value={se.gameType}
                    onChange={(e) =>
                      handleSubEventGameTypeChange(idx, e.target.value)
                    }
                  >
                    <option value="default">Default</option>
                    <option value="first-come-first-serve">
                      First Come First Serve
                    </option>
                    <option value="bidding">Bidding</option>
                  </select>
                </div>

                {se.contestants.map((c, cIdx) => (
                  <div key={c.id} className="mb-2 ps-3">
                    <label>Contestant #{c.id} Name</label>
                    <input
                      type="text"
                      className="form-control mb-1"
                      value={c.name}
                      onChange={(e) =>
                        handleSubEventContestantChange(
                          idx,
                          cIdx,
                          'name',
                          e.target.value
                        )
                      }
                      required
                    />
                    <label>
                      {se.gameType === 'bidding' ? 'Starting Bid' : 'Price'}
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      value={c.price}
                      onChange={(e) =>
                        handleSubEventContestantChange(
                          idx,
                          cIdx,
                          'price',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => updateSub(idx, { editing: false })}
                >
                  Save Sub-Event
                </button>
              </div>
            ))}

            <div className="d-flex flex-column">
              <button
                type="button"
                className="btn btn-secondary mb-2"
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

      <hr />

      {/* Existing Events */}
      <h2>All Events</h2>
      <div className="accordion" id="eventsAccordion">
        {events.length > 0 ? (
          events.map((ev) => (
            <div className="card mb-3" key={ev.id}>
              <div className="card-header">
                <h5>
                  Event #{ev.id} — {ev.name} ({ev.status})
                </h5>
              </div>
              <div className="card-body">
                {/* Main Contestants */}
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
                    {ev.status === 'open' && (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() =>
                          handleDeclareWinner(ev.id, c.id)
                        }
                      >
                        Set Winner
                      </button>
                    )}
                  </div>
                ))}

                {/* Sub-Events */}
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
                            {sub.status === 'open' && (
                              <button
                                className="btn btn-sm btn-outline-info"
                                onClick={() =>
                                  handleDeclareSubWinner(
                                    ev.id,
                                    sub.id,
                                    c.id
                                  )
                                }
                              >
                                Set Sub Winner
                              </button>
                            )}
                          </div>
                        ))}
                        {sub.status === 'open' && (
                          <button
                            className="btn btn-danger btn-sm mt-2"
                            onClick={() =>
                              handleCloseSubEvent(ev.id, sub.id)
                            }
                          >
                            Close Sub-Event
                          </button>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {ev.status === 'open' && (
                  <button
                    className="btn btn-danger mt-3"
                    onClick={() => handleClose(ev.id)}
                  >
                    Close Main Event
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No events to show.</p>
        )}
      </div>
    </div>
  );
}
