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
  const [collapsedSubs, setCollapsedSubs] = useState({});
  const [editingEventId, setEditingEventId] = useState(null);
  const [editEventData, setEditEventData] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await apiFetch('/api/events');
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error(error);
    }
  }

  function handleNewEventClick() {
    setIsCreating(true);
    setEventName('');
    setSubEvents([]);
    setCollapsedSubs({});
  }

  function handleAddSubEvent() {
    const id = Date.now();
    setSubEvents([
      ...subEvents,
      {
        id,
        name: '',
        contestantCount: 1,
        gameType: 'default',
        contestants: [{ id: 1, name: '', price: 0 }],
      },
    ]);
  }

  function handleSubEventNameChange(idx, value) {
    const arr = [...subEvents];
    arr[idx].name = value;
    setSubEvents(arr);
  }

  function handleSubEventGameTypeChange(idx, value) {
    const arr = [...subEvents];
    arr[idx].gameType = value;
    setSubEvents(arr);
  }

  function handleSubEventContestantCountChange(idx, count) {
    const arr = [...subEvents];
    arr[idx].contestantCount = count;
    arr[idx].contestants = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: '',
      price: 0,
    }));
    setSubEvents(arr);
  }

  function handleSubEventContestantChange(subIdx, cIdx, field, value) {
    const arr = [...subEvents];
    arr[subIdx].contestants[cIdx][field] =
      field === 'price' ? Number(value) : value;
    setSubEvents(arr);
  }

  function handleSaveSubEvent(id) {
    setCollapsedSubs(cs => ({ ...cs, [id]: true }));
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    try {
      await apiFetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: eventName,
          contestants: [],
          subEvents,
        }),
      });
      setIsCreating(false);
      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  }

  function handleEditClick(event) {
    setEditingEventId(event.id);
    setEditEventData({
      name: event.name,
      subEvents: event.subEvents.map(se => ({
        id: se.id,
        name: se.name,
        contestants: se.contestants.map(c => ({
          id: c.id,
          name: c.name,
          price: c.price,
        })),
      })),
    });
  }

  function handleEditChange(field, value) {
    setEditEventData(prev => ({ ...prev, [field]: value }));
  }

  function handleEditSubEventChange(idx, field, value) {
    const arr = [...editEventData.subEvents];
    arr[idx][field] = value;
    setEditEventData(prev => ({ ...prev, subEvents: arr }));
  }

  function handleEditContestantChange(subIdx, cIdx, field, value) {
    const arr = [...editEventData.subEvents];
    arr[subIdx].contestants[cIdx][field] =
      field === 'price' ? Number(value) : value;
    setEditEventData(prev => ({ ...prev, subEvents: arr }));
  }

  function handleCancelEdit() {
    setEditingEventId(null);
    setEditEventData(null);
  }

  async function handleSaveEdit(eventId) {
    try {
      await apiFetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editEventData),
      });
      setEditingEventId(null);
      setEditEventData(null);
      fetchEvents();
    } catch (error) {
      console.error(error);
      alert('Error saving event edits.');
    }
  }

  async function handleClose(eventId) {
    try {
      const res = await apiFetch(`/api/events/${eventId}/close`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Error closing event:', data.error);
        alert(`Error: ${data.error}`);
        return;
      }
      fetchEvents();
    } catch (error) {
      console.error(error);
      alert('Unexpected error closing event.');
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
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      console.error(error);
    }
  }

   async function handleCloseSubEvent(eventId, subId) {
       try {
         const res = await apiFetch(
           `/api/events/${eventId}/sub-events/${subId}/close`,
           { method: 'POST' }
         );
         const payload = await res.json();
         if (!res.ok) throw new Error(payload.error);
    
         // show payouts summary
         alert(
           `Distributed net pot $${payload.debug.netPot.toFixed(2)} (house cut $${payload.debug.houseCut.toFixed(2)}):\n` +
           Object.entries(payload.distribution)
             .map(([userId, amt]) => `• User ${userId}: $${amt.toFixed(2)}`)
             .join('\n')
         );
    
         fetchEvents();
       } catch (err) {
         console.error(err);
         alert('Failed to close sub-event: ' + err.message);
       }
     }

  return (
    <div className="container pt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Portal</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/betting')}
        >
          To Homepage
        </button>
      </div>

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
                onChange={e => setEventName(e.target.value)}
                required
              />
            </div>

            <div>
              <h4>Sub Events</h4>
              <button
                type="button"
                className="btn btn-secondary mb-3"
                onClick={handleAddSubEvent}
              >
                Add Sub Event
              </button>

              {subEvents.map((sub, idx) =>
                collapsedSubs[sub.id] ? (
                  <div
                    key={sub.id}
                    className="border p-3 mb-3 d-flex justify-content-between align-items-center"
                  >
                    <strong>
                      {sub.name || `Sub Event ${idx + 1}`}
                    </strong>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        setCollapsedSubs(cs => ({
                          ...cs,
                          [sub.id]: false,
                        }))
                      }
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <div key={sub.id} className="border p-3 mb-3">
                    <div className="mb-3">
                      <label>Sub Event Name:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={sub.name}
                        onChange={e =>
                          handleSubEventNameChange(idx, e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label>Contestant Count:</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={sub.contestantCount}
                        onChange={e =>
                          handleSubEventContestantCountChange(
                            idx,
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label>Game Type:</label>
                      <select
                        className="form-control"
                        value={sub.gameType}
                        onChange={e =>
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

                    {sub.contestants.map((c, cIdx) => (
                      <div key={c.id} className="mb-3">
                        <label>Contestant #{c.id} Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={c.name}
                          onChange={e =>
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
                          {sub.gameType === 'bidding'
                            ? 'Initial Bid Price'
                            : 'Price'}
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          value={c.price}
                          onChange={e =>
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
                      className="btn btn-success"
                      onClick={() => handleSaveSubEvent(sub.id)}
                    >
                      Save Sub Event
                    </button>
                  </div>
                )
              )}
            </div>

            <button
              type="submit"
              className="btn btn-success"
              disabled={!eventName.trim() || subEvents.length === 0}
            >
              Create Event
            </button>
          </form>
        </div>
      )}

      <hr />

      <h2>All Events</h2>
      <div className="accordion" id="eventsAccordion">
        {events.map(ev => (
          <div className="card mb-3" key={ev.id}>
            <div className="card-header">
              <h5>
                Event #{ev.id} — {ev.name} ({ev.status})
              </h5>
            </div>
            <div className="card-body">
              {editingEventId === ev.id ? (
                <>
                  <div className="mb-3">
                    <label>Edit Event Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editEventData.name}
                      onChange={e =>
                        handleEditChange('name', e.target.value)
                      }
                    />
                  </div>

                  {editEventData.subEvents.map((sub, sIdx) => (
                    <div
                      key={sub.id}
                      className="border p-2 mb-2"
                    >
                      <div className="mb-2">
                        <label>Sub-Event Name:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={sub.name}
                          onChange={e =>
                            handleEditSubEventChange(
                              sIdx,
                              'name',
                              e.target.value
                            )
                          }
                        />
                      </div>
                      {sub.contestants.map((c, cIdx) => (
                        <div
                          key={c.id}
                          className="d-flex gap-2 mb-2"
                        >
                          <input
                            type="text"
                            className="form-control"
                            value={c.name}
                            onChange={e =>
                              handleEditContestantChange(
                                sIdx,
                                cIdx,
                                'name',
                                e.target.value
                              )
                            }
                            placeholder="Contestant Name"
                          />
                          <input
                            type="number"
                            className="form-control"
                            value={c.price}
                            onChange={e =>
                              handleEditContestantChange(
                                sIdx,
                                cIdx,
                                'price',
                                e.target.value
                              )
                            }
                            placeholder="Price"
                          />
                        </div>
                      ))}
                    </div>
                  ))}

                  <button
                    className="btn btn-success me-2"
                    onClick={() => handleSaveEdit(ev.id)}
                  >
                    Save Changes
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-warning btn-sm mb-3"
                    onClick={() => handleEditClick(ev)}
                  >
                    Edit Event
                  </button>

                  <h6>Main Contestants</h6>
                  {ev.contestants.map(c => (
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
                            aria-label="Winner"
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

                  {ev.subEvents?.length > 0 && (
                    <>
                      <h6 className="mt-3">Sub Events</h6>
                      {ev.subEvents.map(sub => (
                        <div
                          key={sub.id}
                          className="mb-3 border p-2"
                        >
                          <strong>
                            {sub.name} ({sub.status})
                          </strong>
                          {sub.contestants.map(c => (
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
                                    aria-label="Winner"
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
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
