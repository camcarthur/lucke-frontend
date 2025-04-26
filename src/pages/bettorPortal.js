// src/bettorPanel.js
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api';

export default function BettingPortal() {
  const navigate = useNavigate();
  const { auth, logout } = useContext(AuthContext);

  // State
  const [userBalance, setUserBalance] = useState(() =>
    parseFloat(auth.user?.balance) || 0
  );
  const [events, setEvents] = useState([]);
  const [yourEvents, setYourEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSubEvent, setSelectedSubEvent] = useState(null);
  const [selectedContestant, setSelectedContestant] = useState(null);
  const [userId, setUserId] = useState('');
  const [userBids, setUserBids] = useState({});

  // Effects
  useEffect(() => {
    if (auth.user?.balance != null) {
      setUserBalance(parseFloat(auth.user.balance));
    }
  }, [auth.user]);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  // Fetch all events
  async function fetchAllEvents() {
    try {
      const res = await apiFetch('/api/events', { credentials: 'include' });
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  }

  // Refresh current event
  async function refreshSelectedEvent() {
    if (!selectedEvent) return;
    try {
      const res = await apiFetch(
        `/api/events/${selectedEvent.id}`,
        { credentials: 'include' }
      );
      const updated = await res.json();
      setSelectedEvent(updated);
      if (selectedSubEvent) {
        const newSub = updated.subEvents.find(
          (se) => se.id === selectedSubEvent.id
        );
        setSelectedSubEvent(newSub);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Place a bid
  async function placeUserBid(eventId, subEventId, contestantId, amount) {
    if (!amount || isNaN(amount)) {
      return alert('Please enter a valid bid amount.');
    }
    try {
      const res = await apiFetch(`/api/events/${eventId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          individual: contestantId,
          amount: Number(amount),
          ...(subEventId && { subEventId }),
        }),
      });
      const data = await res.json();
      if (data.error) alert(`Error: ${data.error}`);
      else refreshSelectedEvent();
    } catch (err) {
      console.error(err);
      alert('Bid failed. Try again.');
    }
  }

  // Mock payment
  async function handlePay() {
    if (!selectedEvent || !selectedContestant || !userId) {
      return alert('Missing info: userId, event, or contestant');
    }
    const body = {
      userId,
      contestantId: selectedContestant.id,
      amount: selectedContestant.price,
      ...(selectedSubEvent && { subEventId: selectedSubEvent.id }),
    };
    try {
      const res = await apiFetch(`/api/events/${selectedEvent.id}/bets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) alert(`Error: ${data.error}`);
      else {
        alert(
          `Purchased ${selectedContestant.name} for $${selectedContestant.price}`
        );
        setUserBalance((bal) =>
          +(bal - parseFloat(selectedContestant.price)).toFixed(2)
        );
      }
      setSelectedContestant(null);
      setUserId('');
      refreshSelectedEvent();
    } catch (err) {
      console.error(err);
      alert('Payment failed. Try again.');
    }
  }

  // Handlers
  function handleSelectEvent(ev) {
    setSelectedEvent(ev);
    setSelectedSubEvent(null);
    setSelectedContestant(null);
  }
  function handleSelectContestant(c) {
    setSelectedContestant(c);
  }
  function handleAddToYourEvents() {
    if (
      selectedEvent &&
      !yourEvents.some((e) => e.id === selectedEvent.id)
    ) {
      setYourEvents((prev) => [...prev, selectedEvent]);
    }
  }
  function handleCreateEvent() {
    navigate('/admin');
  }
  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  // Derived for rendering
  const contestants =
    selectedEvent
      ? (selectedSubEvent?.contestants ?? selectedEvent.contestants)
      : [];
  const subClosed = selectedSubEvent?.status !== 'open';

  // Render
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 border-bottom pb-2">
        <h2 className="mb-0">Betting Portal</h2>
        {auth.isLoggedIn && (
          <div className="d-flex flex-column align-items-end">
            <div>
              {auth.role === 'admin' && (
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={handleCreateEvent}
                >
                  Create Event
                </button>
              )}
              <button
                className="btn btn-sm btn-outline-info me-2"
                onClick={() => navigate('/withdraw')}
              >
                Withdraw
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
            <div className="text-muted small mt-1">
              {auth.user.username} | Balance: ${userBalance.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      <div className="row gx-3 gy-4">
        {/* Sidebar */}
        <aside className="col-12 col-md-4">
          {/* Your Events */}
          <div className="card shadow-sm mb-4">
            <div className="card-header">
              <h5 className="mb-0">Your Events</h5>
            </div>
            <ul className="list-group list-group-flush">
              {yourEvents.length ? (
                yourEvents.map((ev) => (
                  <li key={ev.id} className="list-group-item">
                    {ev.name} <small className="text-muted">#{ev.id}</small>
                  </li>
                ))
              ) : (
                <li className="list-group-item text-muted">
                  No events added
                </li>
              )}
            </ul>
          </div>

          {/* All Events */}
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">All Events</h5>
            </div>
            <ul className="list-group list-group-flush">
              {events
                .filter((ev) => ev.status === 'open')
                .map((ev) => (
                  <li
                    key={ev.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{ev.name}</strong>
                      <br />
                      <span className="badge bg-info">{ev.status}</span>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleSelectEvent(ev)}
                    >
                      Select
                    </button>
                  </li>
                ))}
            </ul>
          </div>
          <button
            className="btn btn-outline-secondary w-100 mt-2"
            onClick={() => navigate('/archive')}
          >
            View Archives
          </button>
        </aside>

        {/* Main Panel */}
        <main className="col-12 col-md-8">
          {!selectedEvent ? (
            <div className="text-center text-muted py-5">
              Select an event
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{selectedEvent.name}</h5>
                <span
                  className={`badge bg-${
                    selectedEvent.status === 'open' ? 'success' : 'danger'
                  }`}
                >
                  {selectedEvent.status.toUpperCase()}
                </span>
              </div>
              <div className="card-body">
                {/* Add to Your Events */}
                <div className="d-flex mb-3">
                  <button
                    className="btn btn-sm btn-outline-info me-2"
                    onClick={handleAddToYourEvents}
                    disabled={yourEvents.some(
                      (e) => e.id === selectedEvent.id
                    )}
                  >
                    {yourEvents.some((e) => e.id === selectedEvent.id)
                      ? 'Added'
                      : 'Add to Your Events'}
                  </button>
                </div>

                {/* Sub-Events */}
                {selectedEvent.subEvents?.length > 0 && (
                  <div className="mb-4">
                    <h6>Sub Events</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedEvent.subEvents.map((se) => {
                        const closed = se.status !== 'open';
                        return (
                          <button
                            key={se.id}
                            className={`btn btn-sm ${
                              closed
                                ? 'btn-outline-danger disabled'
                                : selectedSubEvent?.id === se.id
                                ? 'btn-primary'
                                : 'btn-outline-primary'
                            }`}
                            onClick={
                              closed
                                ? undefined
                                : () => {
                                    setSelectedSubEvent(se);
                                    setSelectedContestant(null);
                                  }
                            }
                          >
                            {se.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Contestants Table */}
                <div className="table-responsive">
                  <table className="table table-hover table-striped">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contestants.map((c) => {
                        // If the sub-event is closed, show a single "Unavailable" button
                        if (subClosed) {
                          return (
                            <tr key={c.id}>
                              <td>{c.id}</td>
                              <td>{c.name}</td>
                              <td>${c.price}</td>
                              <td>
                                <button className="btn btn-sm btn-outline-danger disabled">
                                  Unavailable
                                </button>
                              </td>
                            </tr>
                          );
                        }

                        // Otherwise use your existing bidding / buy logic
                        const isBidding =
                          selectedSubEvent?.gameType === 'bidding';
                        const fcfs =
                          selectedSubEvent?.gameType ===
                          'first-come-first-serve';
                        const already =
                          fcfs &&
                          selectedSubEvent.bets.some(
                            (b) => b.contestantId === c.id
                          );

                        return (
                          <tr key={c.id}>
                            <td>{c.id}</td>
                            <td>{c.name}</td>
                            <td>${c.price}</td>
                            <td>
                              {isBidding ? (
                                <div className="d-flex gap-2">
                                  <input
                                    type="number"
                                    className="form-control form-control-sm w-50"
                                    placeholder="Bid"
                                    value={userBids[c.id] || ''}
                                    onChange={(e) =>
                                      setUserBids((prev) => ({
                                        ...prev,
                                        [c.id]: e.target.value,
                                      }))
                                    }
                                  />
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() =>
                                      placeUserBid(
                                        selectedEvent.id,
                                        selectedSubEvent?.id,
                                        c.id,
                                        userBids[c.id]
                                      )
                                    }
                                  >
                                    Bid
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className={`btn btn-sm ${
                                    already
                                      ? 'btn-outline-danger disabled'
                                      : 'btn-success'
                                  }`}
                                  onClick={() => handleSelectContestant(c)}
                                >
                                  {already ? 'Unavailable' : 'Buy'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mock Payment */}
                {selectedContestant && (
                  <div className="border p-4 mt-4 rounded bg-light">
                    <h6>Mock Payment</h6>
                    <div className="mb-3">
                      <label className="form-label">User ID (Name)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                      />
                    </div>
                    <button className="btn btn-primary" onClick={handlePay}>
                      Pay ${selectedContestant.price}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
