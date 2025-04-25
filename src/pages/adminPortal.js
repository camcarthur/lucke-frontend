// src/pages/AdminPortal.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { Trophy } from 'lucide-react';

function AdminPortal() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [eventName, setEventName] = useState('');
  const [hasSubEvents, setHasSubEvents] = useState(false);
  const [mainContestantCount, setMainContestantCount] = useState(1);
  const [mainContestants, setMainContestants] = useState([]);
  const [subEvents, setSubEvents] = useState([]);

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
    setHasSubEvents(false);
    setMainContestantCount(1);
    setMainContestants([]);
    setSubEvents([]);
  }

  useEffect(() => {
    const arr = [];
    for (let i = 0; i < mainContestantCount; i++) {
      arr.push({ id: i + 1, name: '', price: 0 });
    }
    setMainContestants(arr);
  }, [mainContestantCount]);

  function handleMainContestantChange(index, field, value) {
    const updated = [...mainContestants];
    updated[index][field] = field === 'price' ? Number(value) : value;
    setMainContestants(updated);
  }

  function handleAddSubEvent() {
    const newSubEvent = {
      id: Date.now(),
      name: '',
      contestantCount: 1,
      gameType: 'default',
      contestants: [{ id: 1, name: '', price: 0 }]
    };
    setSubEvents([...subEvents, newSubEvent]);
  }

  function handleSubEventNameChange(index, value) {
    const updated = [...subEvents];
    updated[index].name = value;
    setSubEvents(updated);
  }

  function handleSubEventGameTypeChange(index, value) {
    const updated = [...subEvents];
    updated[index].gameType = value;
    setSubEvents(updated);
  }

  function handleSubEventContestantCountChange(index, value) {
    const updated = [...subEvents];
    updated[index].contestantCount = value;
    const arr = [];
    for (let i = 0; i < value; i++) {
      arr.push({ id: i + 1, name: '', price: 0 });
    }
    updated[index].contestants = arr;
    setSubEvents(updated);
  }

  function handleSubEventContestantChange(subIndex, contestantIndex, field, value) {
    const updated = [...subEvents];
    updated[subIndex].contestants[contestantIndex][field] =
      field === 'price' ? Number(value) : value;
    setSubEvents(updated);
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    try {
      const body = {
        name: eventName,
        contestants: hasSubEvents ? [] : mainContestants,
        subEvents: hasSubEvents ? subEvents : []
      };
      const res = await apiFetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      await res.json();
      setIsCreating(false);
      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleClose(eventId) {
    try {
      const res = await apiFetch(`/api/events/${eventId}/close`, {
        method: 'POST'
      });
      const data = await res.json();
  
      if (!res.ok) {
        console.error('❌ Error closing event:', data.error);
        console.debug('🛠️ Debug info:', data.debug);  // <== This line is crucial
        alert(`Error closing event: ${data.error}`);
        return;
      }
  
      console.log('✅ Event closed:', data.message);
      console.debug('🛠️ Debug info:', data.debug);
      fetchEvents();
    } catch (error) {
      console.error('[handleClose] Unexpected error:', error);
      alert('Unexpected error closing event.');
    }
  }  

  async function handleDeclareWinner(eventId, contestantId) {
    try {
      const res = await apiFetch(`/api/events/${eventId}/winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestantId })
      });
      await res.json();
      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDeclareSubWinner(eventId, subId, contestantId) {
    try {
      const res = await apiFetch(`/api/events/${eventId}/sub-events/${subId}/winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestantId })
      });
      await res.json();
      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCloseSubEvent(eventId, subId) {
    try {
      const res = await apiFetch(`/api/events/${eventId}/sub-events/${subId}/close`, {
        method: 'POST'
      });
      await res.json();
      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSaveEdits(eventId) {
    const eventToEdit = events.find(e => e.id === eventId);
    if (!eventToEdit) return;
  
    try {
      const res = await apiFetch(`/api/events/${eventId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventToEdit),
      });
      const data = await res.json();
      console.log('Event updated:', data);
      fetchEvents();
    } catch (error) {
      console.error('[handleSaveEdits]', error);
    }
  } 
  
  async function handleEditSubEventName(eventId, subId, newName) {
    try {
      await apiFetch(`/api/events/${eventId}/sub-events/${subId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      fetchEvents();
    } catch (err) {
      console.error('[handleEditSubEventName]', err);
    }
  }
  
  async function handleEditContestant(eventId, subId, contestantId, field, value) {
    try {
      await apiFetch(`/api/events/${eventId}/sub-events/${subId}/contestants/${contestantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: field === 'price' ? Number(value) : value })
      });
      fetchEvents();
    } catch (err) {
      console.error('[handleEditContestant]', err);
    }
  }  

  return (
    <div className="container pt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Portal</h1>
        <div>
          <button className="btn btn-primary" onClick={() => navigate('/betting')}>
            To Homepage
          </button>
        </div>
      </div>

      <button className="btn btn-primary mb-3" onClick={handleNewEventClick}>
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
                onChange={(e) => setEventName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label>
                <input
                  type="checkbox"
                  checked={hasSubEvents}
                  onChange={(e) => setHasSubEvents(e.target.checked)}
                />{' '}
                This event has sub events
              </label>
            </div>

            {hasSubEvents ? (
              <div>
                <h4>Sub Events</h4>
                <button type="button" className="btn btn-secondary mb-3" onClick={handleAddSubEvent}>
                  Add Sub Event
                </button>
                {subEvents.map((subEvent, subIndex) => (
                  <div key={subEvent.id} className="border p-3 mb-3">
                    <div className="mb-3">
                      <label>Sub Event Name:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={subEvent.name}
                        onChange={(e) => handleSubEventNameChange(subIndex, e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label>How many contestants in this sub event?</label>
                      <input
                        type="number"
                        className="form-control"
                        value={subEvent.contestantCount}
                        onChange={(e) =>
                          handleSubEventContestantCountChange(subIndex, Number(e.target.value))
                        }
                        min="1"
                      />
                    </div>
                    <div className="mb-3">
                      <label>Game Type:</label>
                      <select
                        className="form-control"
                        value={subEvent.gameType || 'default'}
                        onChange={(e) => handleSubEventGameTypeChange(subIndex, e.target.value)}
                      >
                        <option value="default">Default</option>
                        <option value="first-come-first-serve">First Come First Serve</option>
                        <option value="bidding">Bidding</option>
                      </select>
                    </div>

                    {subEvent.contestants.map((contestant, cIndex) => (
                      <div key={contestant.id} className="mb-3">
                        <label>Contestant #{contestant.id} Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={contestant.name}
                          onChange={(e) =>
                            handleSubEventContestantChange(subIndex, cIndex, 'name', e.target.value)
                          }
                          required
                        />

                        <label>
                          {subEvent.gameType === 'bidding' ? 'Initial Bid Price' : 'Price'}
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={contestant.price}
                          onChange={(e) =>
                            handleSubEventContestantChange(subIndex, cIndex, 'price', e.target.value)
                          }
                          min="0"
                          required
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <h4>Main Event Contestants</h4>
                <div className="mb-3">
                  <label>How many contestants?</label>
                  <input
                    type="number"
                    className="form-control"
                    value={mainContestantCount}
                    onChange={(e) => setMainContestantCount(Number(e.target.value))}
                    min="1"
                  />
                </div>
                {mainContestants.map((c, idx) => (
                  <div className="mb-3" key={c.id}>
                    <label>Contestant #{c.id} Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={c.name}
                      onChange={(e) => handleMainContestantChange(idx, 'name', e.target.value)}
                      required
                    />
                    <label>Contestant #{c.id} Price</label>
                    <input
                      type="number"
                      className="form-control"
                      value={c.price}
                      onChange={(e) => handleMainContestantChange(idx, 'price', e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                ))}
              </div>
            )}
            <button type="submit" className="btn btn-success">
              Create Event
            </button>
          </form>
        </div>
      )}

      <hr />

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
              <h6>Main Contestants</h6>
              {ev.contestants.map((c) => (
                <div key={c.id} className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2 w-100">
                    <input
                      type="text"
                      defaultValue={c.name}
                      className="form-control form-control-sm"
                      disabled={ev.status !== 'open'}
                      onBlur={(e) =>
                        handleEditContestant(ev.id, sub.id, c.id, 'name', e.target.value)
                      }
                    />
                    <input
                      type="number"
                      defaultValue={c.price}
                      className="form-control form-control-sm"
                      min="0"
                      disabled={sub.status !== 'open'}
                      onBlur={(e) =>
                        handleEditContestant(ev.id, sub.id, c.id, 'price', e.target.value)
                      }
                    />
                  </div>

                  {ev.status === 'open' && (
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => handleDeclareWinner(ev.id, c.id)}
                    >
                      Set Winner
                    </button>
                  )}
                </div>
              ))}

              {ev.subEvents?.length > 0 && (
                <>
                  <h6 className="mt-3">Sub Events</h6>
                  {ev.subEvents.map((sub) => (
                    <div key={sub.id} className="mb-3 border p-2">
                      <input
                        className="form-control form-control-sm mb-2"
                        defaultValue={sub.name}
                        disabled={sub.status !== 'open'}
                        onBlur={(e) => handleEditSubEventName(ev.id, sub.id, e.target.value)}
                      />
                      {sub.contestants?.map((c) => (
                        <div key={c.id} className="d-flex justify-content-between align-items-center mt-1">
                          <span>
                            {c.name} — ${c.price}
                            {sub.winningContestant === c.id && (
                              <Trophy size={14} strokeWidth={1.4} className="ms-2 text-warning" aria-label="Winner" />
                            )}
                          </span>
                          {sub.status === 'open' && (
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => handleDeclareSubWinner(ev.id, sub.id, c.id)}
                            >
                              Set Sub Winner
                            </button>
                          )}
                        </div>
                      ))}
                      {sub.status === 'open' && (
                        <button
                          className="btn btn-danger btn-sm mt-2"
                          onClick={() => handleCloseSubEvent(ev.id, sub.id)}
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
                  className="btn btn-warning mt-2 me-2"
                  onClick={() => handleSaveEdits(ev.id)}
                >
                  Save Changes
                </button>
              )}

              {ev.status === 'open' && (
                <button className="btn btn-danger mt-3" onClick={() => handleClose(ev.id)}>
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

export default AdminPortal;
