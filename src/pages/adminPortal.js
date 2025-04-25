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

  // function handleMainContestantChange(index, field, value) {
  //   const updated = [...mainContestants];
  //   updated[index][field] = field === 'price' ? Number(value) : value;
  //   setMainContestants(updated);
  // }

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

  function updateSub(index, changes) {
    const copy = [...subEvents];
    copy[index] = { ...copy[index], ...changes };
    setSubEvents(copy);
  }

  function handleSubEventNameChange(index, value) {
    updateSub(index, { name: value });
  }

  function handleSubEventGameTypeChange(index, value) {
    updateSub(index, { gameType: value });
  }

  function handleSubEventContestantCountChange(index, value) {
    const contestants = [];
    for (let i = 1; i <= value; i++) {
      contestants.push({ id: i, name: '', price: 0 });
    }
    updateSub(index, { contestantCount: value, contestants });
  }

  function handleSubEventContestantChange(subIndex, contestantIndex, field, value) {
    const copy = [...subEvents];
    copy[subIndex].contestants[contestantIndex][field] =
      field === 'price' ? Number(value) : value;
    setSubEvents(copy);
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    try {
      const body = {
        name: eventName,
        contestants: hasSubEvents ? [] : mainContestants,
        subEvents: hasSubEvents ? subEvents : []
      };
      await apiFetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      setIsCreating(false);
      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleClose(eventId) {
    try {
      const res = await apiFetch(`/api/events/${eventId}/close`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        alert(`Error closing event: ${data.error}`);
        return;
      }
      fetchEvents();
    } catch (error) {
      console.error(error);
      alert('Unexpected error closing event.');
    }
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
    await apiFetch(`/api/events/${eventId}/sub-events/${subId}/winner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contestantId })
    });
    fetchEvents();
  }

  async function handleCloseSubEvent(eventId, subId) {
    await apiFetch(`/api/events/${eventId}/sub-events/${subId}/close`, { method: 'POST' });
    fetchEvents();
  }

  return (
    <div className="container pt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Portal</h1>
        <button className="btn btn-primary" onClick={() => navigate('/betting')}>
          To Homepage
        </button>
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
                onChange={e => setEventName(e.target.value)}
                required
              />
            </div>

            {/* Sub-Events Section */}
            <div className="mb-3">
              <h4>Sub-Events</h4>
              {subEvents.map((sub, idx) => (
                <div key={sub.id} className="border p-3 mb-3">
                  <div className="mb-2">
                    <label>Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={sub.name}
                      onChange={e => handleSubEventNameChange(idx, e.target.value)}
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
                      onChange={e => handleSubEventContestantCountChange(idx, Number(e.target.value))}
                    />
                  </div>
                  <div className="mb-2">
                    <label>Game Type:</label>
                    <select
                      className="form-control"
                      value={sub.gameType}
                      onChange={e => handleSubEventGameTypeChange(idx, e.target.value)}
                    >
                      <option value="default">Default</option>
                      <option value="first-come-first-serve">First Come First Serve</option>
                      <option value="bidding">Bidding</option>
                    </select>
                  </div>
                  {sub.contestants.map((c, cIdx) => (
                    <div key={c.id} className="mb-2 ps-3">
                      <label>Contestant #{c.id} Name</label>
                      <input
                        type="text"
                        className="form-control mb-1"
                        value={c.name}
                        onChange={e =>
                          handleSubEventContestantChange(idx, cIdx, 'name', e.target.value)
                        }
                        required
                      />
                      <label>{sub.gameType === 'bidding' ? 'Starting Bid' : 'Price'}</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={c.price}
                        onChange={e =>
                          handleSubEventContestantChange(idx, cIdx, 'price', e.target.value)
                        }
                        required
                      />
                    </div>
                  ))}
                </div>
              ))}

              {/* Add + Create grouped */}
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
                  Createe Event
                </button>
              </div>
            </div>
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
              <h6>Main Contestants</h6>
              {ev.contestants.map(c => (
                <div
                  key={c.id}
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <span>
                    {c.name} — ${c.price}
                    {ev.winningContestant === c.id && (
                      <Trophy size={16} strokeWidth={1.5} className="ms-2 text-warning" />
                    )}
                  </span>
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
                  <h6 className="mt-3">Sub-Events</h6>
                  {ev.subEvents.map(sub => (
                    <div key={sub.id} className="mb-3 border p-2">
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
                              <Trophy size={14} strokeWidth={1.4} className="ms-2 text-warning" />
                            )}
                          </span>
                          {sub.status === 'open' && (
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() =>
                                handleDeclareSubWinner(ev.id, sub.id, c.id)
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
