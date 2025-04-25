// src/pages/AdminPortal.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { Trophy } from 'lucide-react';

export default function AdminPortal() {
  const navigate = useNavigate();

  // event list & creation state
  const [events, setEvents] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  // new-event form state
  const [eventName, setEventName] = useState('');
  const [subEvents, setSubEvents] = useState([]);

  // load all events
  useEffect(() => {
    fetchEvents();
  }, []);
  async function fetchEvents() {
    const res = await apiFetch('/api/events');
    const data = await res.json();
    setEvents(data);
  }

  // start creating
  function handleNewEventClick() {
    setIsCreating(true);
    setEventName('');
    setSubEvents([]);
  }

  // add a fresh, empty sub-event
  function handleAddSubEvent() {
    setSubEvents([
      ...subEvents,
      {
        id: Date.now(),
        name: '',
        contestantCount: 1,
        gameType: 'default',
        contestants: [{ id: 1, name: '', price: 0 }],
        editing: true
      }
    ]);
  }

  // per-subEvent field updates
  function updateSub(idx, changes) {
    const copy = [...subEvents];
    copy[idx] = { ...copy[idx], ...changes };
    setSubEvents(copy);
  }

  function handleSubEventNameChange(idx, val) {
    updateSub(idx, { name: val });
  }
  function handleSubEventGameTypeChange(idx, val) {
    updateSub(idx, { gameType: val });
  }
  function handleSubEventContestantCountChange(idx, count) {
    const contestants = [];
    for (let i = 1; i <= count; i++) {
      contestants.push({ id: i, name: '', price: 0 });
    }
    updateSub(idx, { contestantCount: count, contestants });
  }
  function handleSubEventContestantChange(idx, cIdx, field, val) {
    const copy = [...subEvents];
    copy[idx].contestants[cIdx][field] =
      field === 'price' ? Number(val) : val;
    setSubEvents(copy);
  }

  // save / collapse or re-open a sub-event
  function handleSaveSubEvent(idx) {
    updateSub(idx, { editing: false });
  }
  function handleEditSubEvent(idx) {
    updateSub(idx, { editing: true });
  }

  // actually POST the event
  async function handleCreateEvent(e) {
    e.preventDefault();
    const body = {
      name: eventName,
      subEvents: subEvents.map(({ id, editing, ...rest }) => rest)
    };
    await apiFetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    setIsCreating(false);
    fetchEvents();
  }

  // event-management handlers (close, declare winner…)
  async function handleClose(eventId) {
    const res = await apiFetch(`/api/events/${eventId}/close`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(data);
      return alert(`Error: ${data.error}`);
    }
    fetchEvents();
  }
  async function handleDeclareWinner(eventId, contestantId) {
    await apiFetch(`/api/events/${eventId}/winner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contestantId })
    });
    fetchEvents();
  }
  async function handleDeclareSubWinner(eventId, subId, contestantId) {
    await apiFetch(
      `/api/events/${eventId}/sub-events/${subId}/winner`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestantId })
      }
    );
    fetchEvents();
  }
  async function handleCloseSubEvent(eventId, subId) {
    await apiFetch(
      `/api/events/${eventId}/sub-events/${subId}/close`,
      { method: 'POST' }
    );
    fetchEvents();
  }

  return (
    <div className="container pt-4">
      {/* header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Portal</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/betting')}
        >
          To Homepage
        </button>
      </div>

      {/* New Event */}
      <button
        className="btn btn-primary mb-3"
        onClick={handleNewEventClick}
      >
        New Event
      </button>

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
                onChange={(e) =>
                  setEventName(e.target.value)
                }
                required
              />
            </div>

            {/* Sub-Events UI */}
            <h4>Sub-Events</h4>
            {subEvents.map((se, idx) => (
              <div
                key={se.id}
                className="border p-3 mb-3"
              >
                {se.editing ? (
                  <>
                    <div className="mb-2">
                      <label>Name:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={se.name}
                        onChange={(e) =>
                          handleSubEventNameChange(
                            idx,
                            e.target.value
                          )
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
                          handleSubEventGameTypeChange(
                            idx,
                            e.target.value
                          )
                        }
                      >
                        <option value="default">
                          Default
                        </option>
                        <option value="first-come-first-serve">
                          First Come First Serve
                        </option>
                        <option value="bidding">
                          Bidding
                        </option>
                      </select>
                    </div>
                    {se.contestants.map(
                      (c, cIdx) => (
                        <div
                          key={c.id}
                          className="mb-2 ps-3"
                        >
                          <label>
                            Contestant #{c.id} Name
                          </label>
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
                            {se.gameType ===
                            'bidding'
                              ? 'Starting Bid'
                              : 'Price'}
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
                      )
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() =>
                        handleSaveSubEvent(idx)
                      }
                    >
                      Save Sub-Event
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      handleEditSubEvent(idx)
                    }
                  >
                    {se.name || 'Unnamed Sub-Event'}
                  </button>
                )}
              </div>
            ))}

            {/* add-sub-event at bottom */}
            <button
              type="button"
              className="btn btn-secondary mb-3"
              onClick={handleAddSubEvent}
            >
              Add Sub-Event
            </button>

            {/* Create disabled until at least one sub-event */}
            <button
              type="submit"
              className={`btn ${
                subEvents.length > 0
                  ? 'btn-success'
                  : 'btn-secondary'
              }`}
              disabled={subEvents.length === 0}
            >
              Create Event
            </button>
          </form>
        </div>
      )}

      <hr />

      {/* Existing Events */}
      <h2>All Events</h2>
      <div className="accordion" id="eventsAccordion">
        {events.map((ev) => (
          <div className="card mb-3" key={ev.id}>
            <div className="card-header">
              <h5>
                Event #{ev.id} — {ev.name} ({ev.status})
              </h5>
            </div>
            <div className="card-body">
              {/* main contestants */}
              <h6>Main Contestants</h6>
              {ev.contestants.map((c) => (
                <div
                  key={c.id}
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <span>
                    {c.name} — ${c.price}
                    {ev.winningContestant ===
                      c.id && (
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
                        handleDeclareWinner(
                          ev.id,
                          c.id
                        )
                      }
                    >
                      Set Winner
                    </button>
                  )}
                </div>
              ))}

              {/* sub-events */}
              {ev.subEvents?.length > 0 && (
                <>
                  <h6 className="mt-3">Sub-Events</h6>
                  {ev.subEvents.map((sub) => (
                    <div
                      key={sub.id}
                      className="mb-3 border p-2"
                    >
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
                            {sub.winningContestant ===
                              c.id && (
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
                            handleCloseSubEvent(
                              ev.id,
                              sub.id
                            )
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
        ))}
      </div>
    </div>
  );
}
