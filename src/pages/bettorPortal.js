import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';

function BettingPortal() {
  const navigate = useNavigate();
  const { auth, logout } = useContext(AuthContext);

  const [userBalance, setUserBalance] = useState(() =>
    parseFloat(auth.user?.balance) || 0
  );
  useEffect(() => {
    if (auth.user?.balance != null){
      setUserBalance(parseFloat(auth.user.balance));
    }
  }, [auth.user]);

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSubEvent, setSelectedSubEvent] = useState(null);
  const [selectedContestant, setSelectedContestant] = useState(null);
  const [userId, setUserId] = useState('');
  const [yourEvents, setYourEvents] = useState([]);
  const [userBids, setUserBids] = useState({});

  useEffect(() => {
    fetchAllEvents();
  }, []);

  async function fetchAllEvents() {
    try {
      const res = await apiFetch('/api/events', {
        credentials: 'include'
      });
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error(error);
    }
  }

  // Refresh selected event data after a bet is placed.
  async function refreshSelectedEvent() {
    if (selectedEvent) {
      try {
        const res = await apiFetch(`/api/events/${selectedEvent.id}`, {
          credentials: 'include'
        });
        const updatedEvent = await res.json();
        setSelectedEvent(updatedEvent);
        if (selectedSubEvent) {
          // Find and update the selected sub-event from the updated event.
          const updatedSubEvent = updatedEvent.subEvents.find(
            (se) => se.id === selectedSubEvent.id
          );
          setSelectedSubEvent(updatedSubEvent);
        }
      } catch (error) {
        console.error('Error refreshing selected event:', error);
      }
    }
  }

  async function placeUserBid(eventId, subEventId, contestantId, amount) {
    if (!amount || isNaN(amount)) {
      alert("Please enter a valid bid amount.");
      return;
    }

    try {
      const res = await apiFetch(`/api/events/${eventId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          individual: contestantId,
          amount: Number(amount),
          ...(subEventId && { subEventId })
        })
      });
      const data = await res.json();
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        alert(data.message);
        refreshSelectedEvent();
      }
    } catch (err) {
      console.error("Bid submission failed", err);
      alert("Bid failed. Try again.");
    }
  }

  function handleSelectEvent(ev) {
    setSelectedEvent(ev);
    setSelectedSubEvent(null); // reset any previously selected sub event
    setSelectedContestant(null);
  }

  function handleSelectContestant(contestant) {
    setSelectedContestant(contestant);
  }

  function handleAddToYourEvents() {
    if (selectedEvent && !yourEvents.some(event => event.id === selectedEvent.id)) {
      setYourEvents([...yourEvents, selectedEvent]);
    }
  }

  async function handlePay() {
    if (!selectedEvent || !selectedContestant || !userId) {
      alert('Missing info: userId, event, or contestant');
      return;
    }
    
    // Include subEventId if a sub event is selected.
    const body = {
      userId,
      contestantId: selectedContestant.id,
      amount: selectedContestant.price,
      ...(selectedSubEvent && { subEventId: selectedSubEvent.id })
    };

    try {
      const res = await apiFetch(`/api/events/${selectedEvent.id}/bets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        const paid = parseFloat(selectedContestant.price);
        alert(
          `Mock Payment done! You purchased ${selectedContestant.name} for $${selectedContestant.price}`
        );
        setUserBalance(bal => +(bal - paid).toFixed(2));
      }
      setSelectedContestant(null);
      setUserId('');
      // Refresh the selected event (and sub-event) data so that bets update in the UI.
      refreshSelectedEvent();
    } catch (error) {
      console.error(error);
    }
  }

  function handleCreateEvent() {
    navigate('/admin');
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <div className="container pt-4">
      {/* Header with title, logout and conditionally rendered "Create Event" button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Betting Portal</h1>
          {auth.isLoggedIn && (
            <>
              <p>
                Logged in as <strong>{auth.user.username}</strong> ({auth.role})
              </p>
              <p>
                Balance: <strong>${userBalance.toFixed(2)}</strong>
              </p>
            </>
          )}
        </div>
        <div>
          {auth.isLoggedIn && (
            <button className="btn btn-secondary me-2" onClick={handleLogout}>
              Logout
            </button>
          )}
          {auth.isLoggedIn && auth.role === 'admin' && (
            <button className="btn btn-primary" onClick={handleCreateEvent}>
              Create Event
            </button>
          )}
        </div>
      </div>

      <div className="row">
        {/* Left column: Your Events and All Events */}
        <div className="col-md-4">
          <h3>Your Events</h3>
          <ul className="list-group mb-4">
            {yourEvents.length > 0 ? (
              yourEvents.map((ev) => (
                <li key={ev.id} className="list-group-item">
                  <strong>{ev.name}</strong> (ID: {ev.id})
                </li>
              ))
            ) : (
              <li className="list-group-item">No events added</li>
            )}
          </ul>

          <h3>All Events</h3>
          <ul className="list-group">
            {Array.isArray(events) &&
              events.map((ev) => (
                <li
                  key={ev.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{ev.name}</strong> (ID: {ev.id})
                    <br />
                    Status: {ev.status}
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

        {/* Right column: Selected event details and actions */}
        <div className="col-md-8">
          {selectedEvent ? (
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">
                  {selectedEvent.name} (Status: {selectedEvent.status})
                </h4>
                <button
                  className="btn btn-sm btn-info mb-3"
                  onClick={handleAddToYourEvents}
                  disabled={yourEvents.some(event => event.id === selectedEvent.id)}
                >
                  {yourEvents.some(event => event.id === selectedEvent.id)
                    ? 'Already Added'
                    : 'Add to Your Events'}
                </button>
                {selectedEvent.status === 'closed' && (
                  <p className="text-danger">
                    This event is closed. No purchases allowed.
                  </p>
                )}

                {/* Sub Events Section */}
                {selectedEvent.subEvents && selectedEvent.subEvents.length > 0 && (
                  <div className="mb-3">
                    <h5>Sub Events</h5>
                    <ul className="list-group">
                      {selectedEvent.subEvents.map((subEv, idx) => (
                        <li
                          key={idx}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <span>{subEv.name}</span>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setSelectedSubEvent(subEv)}
                          >
                            {selectedSubEvent &&
                            selectedSubEvent.name === subEv.name
                              ? 'Selected'
                              : 'Select'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <hr />
                <h5>Contestants:</h5>
                {selectedEvent.subEvents && selectedEvent.subEvents.length > 0 ? (
                  selectedSubEvent ? (
                    Array.isArray(selectedSubEvent.contestants) &&
                    selectedSubEvent.contestants.length > 0 ? (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSubEvent.contestants.map((c) => {
                            // Check for first-come-first-serve bets.
                            const alreadyPlaced =
                              selectedSubEvent.gameType === 'first-come-first-serve' &&
                              selectedSubEvent.bets &&
                              selectedSubEvent.bets.some((b) => b.contestantId === c.id);
                            return (
                              <tr key={c.id}>
                                <td>{c.id}</td>
                                <td>{c.name}</td>
                                <td>${c.price}</td>
                                <td>
                                  {selectedEvent.status === 'open' &&
                                    yourEvents.some(event => event.id === selectedEvent.id) && (
                                      selectedSubEvent.gameType === 'bidding' ? (
                                        <div className="d-flex">
                                          <input
                                            type="number"
                                            className="form-control form-control-sm me-2"
                                            placeholder="Your bid"
                                            value={userBids[c.id] || ''}
                                            onChange={(e) =>
                                              setUserBids((prev) => ({ ...prev, [c.id]: e.target.value }))
                                            }
                                            min="0"
                                          />
                                          <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => {
                                              placeUserBid(selectedEvent.id, selectedSubEvent.id, c.id, userBids[c.id]);
                                            }}
                                          >
                                            Bid
                                          </button>
                                        </div>
                                      ) : (
                                        alreadyPlaced ? (
                                          <button className="btn btn-sm btn-danger" disabled>
                                            Unavailable
                                          </button>
                                        ) : (
                                          <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleSelectContestant(c)}
                                          >
                                            Buy
                                          </button>
                                        )
                                      )
                                    )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <p>No contestants in this sub event.</p>
                    )
                  ) : (
                    <p>Please select a sub event to view its contestants.</p>
                  )
                ) : Array.isArray(selectedEvent.contestants) &&
                  selectedEvent.contestants.length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEvent.contestants.map((c) => (
                        <tr key={c.id}>
                          <td>{c.id}</td>
                          <td>{c.name}</td>
                          <td>${c.price}</td>
                          <td>
                            {selectedEvent.status === 'open' &&
                              yourEvents.some(event => event.id === selectedEvent.id) && (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleSelectContestant(c)}
                                >
                                  Buy
                                </button>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No contestants</p>
                )}

                {selectedEvent.status === 'open' && selectedContestant && (
                  <div className="mt-3 border p-3">
                    <h5>Mock Payment</h5>
                    <p>
                      You selected: <strong>{selectedContestant.name}</strong> for $
                      <strong>{selectedContestant.price}</strong>
                    </p>
                    <div className="mb-2">
                      <label>User ID (Name): </label>
                      <input
                        type="text"
                        className="form-control"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                      />
                    </div>
                    <button className="btn btn-primary" onClick={handlePay}>
                      Pay with Mock Money
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted">Select an event from the list</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BettingPortal;
