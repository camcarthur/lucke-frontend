// src/pages/BettorPortal.js
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api';

export default function BettingPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, logout } = useContext(AuthContext);

  // State
  const [userBalance, setUserBalance] = useState(() =>
    parseFloat(auth.user?.balance) || 0
  );
  const [events, setEvents] = useState([]);
  const [yourEvents, setYourEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSubEvent, setSelectedSubEvent] = useState(null);
  const [userBids, setUserBids] = useState({});
  const [qrEventSelected, setQrEventSelected] = useState(false);

  // Effects
  useEffect(() => {
    if (auth.user?.balance != null) {
      setUserBalance(parseFloat(auth.user.balance));
    }
  }, [auth.user]);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  // Auto‐select via QR ?eventId=
  useEffect(() => {
    if (events.length && !qrEventSelected) {
      const params = new URLSearchParams(location.search);
      const eventIdParam = params.get('eventId');
      if (eventIdParam) {
        const ev = events.find((e) => e.id.toString() === eventIdParam);
        if (ev) {
          handleSelectEvent(ev);
          setQrEventSelected(true);
        }
      }
    }
  }, [events, location.search, qrEventSelected]);

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

  // Place a bid (bidding mode)
  async function placeUserBid(eventId, subEventId, contestantId, amount) {
    if (!amount || isNaN(amount)) {
      return alert('Please enter a valid bid amount.');
    }
    try {
      const res = await apiFetch(`/api/events/${eventId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.user.id,
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

  // Handle a straight buy (FCFS mode)
  async function handleBuy(contestant) {
    const price = parseFloat(contestant.price).toFixed(2);
    if (
      window.confirm(
        `Confirm bet on "${contestant.name}" for $${price}?`
      )
    ) {
      try {
        const res = await apiFetch(
          `/api/events/${selectedEvent.id}/bets`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: auth.user.id,
              contestantId: contestant.id,
              amount: parseFloat(price),
              ...(selectedSubEvent && { subEventId: selectedSubEvent.id }),
            }),
          }
        );
        const data = await res.json();
        if (data.error) {
          alert(`Error: ${data.error}`);
        } else {
          alert(`Purchased ${contestant.name} for $${price}`);
          setUserBalance((bal) =>
            +(bal - parseFloat(price)).toFixed(2)
          );
          refreshSelectedEvent();
        }
      } catch (err) {
        console.error(err);
        alert('Purchase failed. Try again.');
      }
    }
  }

  // Handlers
  function handleSelectEvent(ev) {
    setSelectedEvent(ev);
    setSelectedSubEvent(null);
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
  const contestants = selectedEvent
    ? selectedSubEvent?.contestants ?? selectedEvent.contestants
    : [];
  const subClosed = selectedSubEvent?.status !== 'open';

  return (
    <div
      className="container-fluid py-4 text-white"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2e2e2e 100%)',
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 border-bottom pb-2">
        <h2 className="mb-0">Betting Portal</h2>
        {auth.isLoggedIn && (
          <div className="d-flex flex-column align-items-end">
            <div>
              {auth.role === 'admin' && (
                <button
                  className="btn btn-sm btn-success me-2"
                  onClick={handleCreateEvent}
                >
                  Create Event
                </button>
              )}
              <button
                className="btn btn-sm btn-outline-success me-2"
                onClick={() => navigate('/withdraw')}
              >
                Withdraw
              </button>
              <button
                className="btn btn-sm btn-outline-success me-2"
                onClick={() => navigate('/deposit')}
              >
                Deposit
              </button>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
            <div className="text-light small mt-1">
              {auth.user.username} | Balance: $
              {userBalance.toFixed(2)}
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
                    {ev.name}{' '}
                    <small className="text-muted">#{ev.id}</small>
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
                      <span className="badge bg-info">
                        {ev.status}
                      </span>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => handleSelectEvent(ev)}
                    >
                      Select
                    </button>
                  </li>
                ))}
            </ul>
          </div>
          <button
            className="btn btn-outline-light w-100 mt-2"
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
                    selectedEvent.status === 'open'
                      ? 'success'
                      : 'danger'
                  }`}
                >
                  {selectedEvent.status.toUpperCase()}
                </span>
              </div>
              <div className="card-body">
                {/* Add to Your Events */}
                <div className="d-flex mb-3">
                  <button
                    className="btn btn-sm btn-outline-success me-2"
                    onClick={handleAddToYourEvents}
                    disabled={yourEvents.some(
                      (e) => e.id === selectedEvent.id
                    )}
                  >
                    {yourEvents.some(
                      (e) => e.id === selectedEvent.id
                    )
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
                                ? 'btn-success'
                                : 'btn-outline-success'
                            }`}
                            onClick={
                              closed
                                ? undefined
                                : () => {
                                    setSelectedSubEvent(se);
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

                        const isBidding =
                          selectedSubEvent?.gameType ===
                          'bidding';
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
                                    className="btn btn-sm btn-success"
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
                                  onClick={() => handleBuy(c)}
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
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
