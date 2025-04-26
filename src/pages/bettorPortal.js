// src/pages/bettorPanel.js
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../api';

const colors = {
  primaryStart: '#1a1a1a',
  primaryEnd:   '#2e2e2e',
  text:         '#ddd',
  muted:        '#888',
  cardBg:       '#2e2e2e',
  border:       '#444',
  btnPrimaryBg: '#198754',
  btnPrimaryColor: '#fff',
  btnOutlineColor: '#ddd',
  badgeInfoBg:  '#0dcaf0',
  badgeSuccessBg: '#198754',
  badgeDangerBg: '#dc3545',
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '2rem',
    background: `linear-gradient(135deg, ${colors.primaryStart} 0%, ${colors.primaryEnd} 100%)`,
    color: colors.text,
    fontFamily: `Segoe UI, Tahoma, Geneva, Verdana, sans-serif`,
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: `1px solid ${colors.border}`,
  },
  headerTitle: {
    margin: 0,
  },
  headerButtons: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  btn: {
    marginRight: '0.5rem',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
  },
  balanceText: {
    color: colors.muted,
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  },
  card: {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    color: colors.text,
  },
  cardHeader: {
    background: colors.primaryStart,
    borderBottom: `1px solid ${colors.border}`,
  },
  listGroupItem: {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    color: colors.text,
  },
  listGroupItemText: {
    fontWeight: 500,
  },
  listGroupItemId: {
    color: colors.muted,
    fontSize: '0.85rem',
    marginLeft: '0.5rem',
  },
  btnPrimary: {
    background: colors.btnPrimaryBg,
    color: colors.btnPrimaryColor,
    border: 'none',
  },
  btnOutlineInfo: {
    background: 'transparent',
    color: colors.btnOutlineColor,
    borderColor: colors.btnOutlineColor,
  },
  btnOutlineSecondary: {
    background: 'transparent',
    color: colors.btnOutlineColor,
    borderColor: colors.btnOutlineColor,
  },
  badgeInfo: {
    background: colors.badgeInfoBg,
    color: '#000',
  },
  badgeSuccess: {
    background: colors.badgeSuccessBg,
    color: '#fff',
  },
  badgeDanger: {
    background: colors.badgeDangerBg,
    color: '#fff',
  },
  table: {
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    color: colors.text,
  },
  tableHeader: {
    background: colors.primaryStart,
    color: colors.text,
  },
  tableRow: {
    borderBottom: `1px solid ${colors.border}`,
  },
  formControl: {
    background: '#333',
    color: colors.text,
    border: `1px solid ${colors.border}`,
  },
  mockPayment: {
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    background: '#333',
    padding: '1rem',
    marginTop: '1rem',
    color: colors.text,
  },
};

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
  const contestants = selectedEvent
    ? selectedSubEvent?.contestants ?? selectedEvent.contestants
    : [];
  const subClosed = selectedSubEvent?.status !== 'open';

  // Render
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerContainer}>
        <h2 style={styles.headerTitle}>Betting Portal</h2>
        {auth.isLoggedIn && (
          <div style={styles.headerButtons}>
            <div>
              {auth.role === 'admin' && (
                <button
                  style={{ ...styles.btn, ...styles.btnPrimary }}
                  onClick={handleCreateEvent}
                >
                  Create Event
                </button>
              )}
              <button
                style={{ ...styles.btn, ...styles.btnOutlineInfo }}
                onClick={() => navigate('/withdraw')}
              >
                Withdraw
              </button>
              <button
                style={{ ...styles.btn, ...styles.btnOutlineSecondary }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
            <div style={styles.balanceText}>
              {auth.user.username} | Balance: ${userBalance.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      <div className="row gx-3 gy-4">
        {/* Sidebar */}
        <aside className="col-12 col-md-4">
          {/* Your Events */}
          <div className="card mb-4" style={styles.card}>
            <div className="card-header" style={styles.cardHeader}>
              <h5 className="mb-0">Your Events</h5>
            </div>
            <ul className="list-group list-group-flush">
              {yourEvents.length ? (
                yourEvents.map((ev) => (
                  <li
                    key={ev.id}
                    className="list-group-item"
                    style={styles.listGroupItem}
                  >
                    <span style={styles.listGroupItemText}>{ev.name}</span>
                    <span style={styles.listGroupItemId}>#{ev.id}</span>
                  </li>
                ))
              ) : (
                <li
                  className="list-group-item text-muted"
                  style={styles.listGroupItem}
                >
                  No events added
                </li>
              )}
            </ul>
          </div>

          {/* All Events */}
          <div className="card" style={styles.card}>
            <div className="card-header" style={styles.cardHeader}>
              <h5 className="mb-0">All Events</h5>
            </div>
            <ul className="list-group list-group-flush">
              {events
                .filter((ev) => ev.status === 'open')
                .map((ev) => (
                  <li
                    key={ev.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                    style={styles.listGroupItem}
                  >
                    <div>
                      <strong style={styles.listGroupItemText}>{ev.name}</strong>
                      <br />
                      <span style={styles.badgeInfo}>{ev.status}</span>
                    </div>
                    <button
                      className="btn btn-sm"
                      style={styles.btnPrimary}
                      onClick={() => handleSelectEvent(ev)}
                    >
                      Select
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          <button
            className="btn btn-sm w-100 mt-2"
            style={styles.btnOutlineSecondary}
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
            <div className="card" style={styles.card}>
              <div
                className="card-header d-flex justify-content-between align-items-center"
                style={styles.cardHeader}
              >
                <h5 className="mb-0">{selectedEvent.name}</h5>
                <span
                  style={
                    selectedEvent.status === 'open'
                      ? styles.badgeSuccess
                      : styles.badgeDanger
                  }
                >
                  {selectedEvent.status.toUpperCase()}
                </span>
              </div>

              <div className="card-body">
                {/* Add to Your Events */}
                <div className="d-flex mb-3">
                  <button
                    className="btn btn-sm"
                    style={styles.btnOutlineInfo}
                    onClick={handleAddToYourEvents}
                    disabled={yourEvents.some((e) => e.id === selectedEvent.id)}
                  >
                    {yourEvents.some((e) => e.id === selectedEvent.id)
                      ? 'Added'
                      : 'Add to Your Events'}
                  </button>
                </div>

                {/* Sub-Events */}
                {selectedEvent.subEvents?.length > 0 && (
                  <div className="mb-4">
                    <h6 style={{ color: colors.text }}>Sub Events</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedEvent.subEvents.map((se) => {
                        const closed = se.status !== 'open';
                        const btnStyle = closed
                          ? styles.btnOutlineSecondary
                          : selectedSubEvent?.id === se.id
                          ? styles.btnPrimary
                          : styles.btnOutlineInfo;
                        return (
                          <button
                            key={se.id}
                            className="btn btn-sm"
                            style={btnStyle}
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
                  <table className="table" style={styles.table}>
                    <thead style={styles.tableHeader}>
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
                            <tr key={c.id} style={styles.tableRow}>
                              <td>{c.id}</td>
                              <td>{c.name}</td>
                              <td>${c.price}</td>
                              <td>
                                <button
                                  className="btn btn-sm"
                                  style={styles.btnOutlineSecondary}
                                  disabled
                                >
                                  Unavailable
                                </button>
                              </td>
                            </tr>
                          );
                        }

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
                          <tr key={c.id} style={styles.tableRow}>
                            <td>{c.id}</td>
                            <td>{c.name}</td>
                            <td>${c.price}</td>
                            <td>
                              {isBidding ? (
                                <div className="d-flex gap-2">
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    style={styles.formControl}
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
                                    className="btn btn-sm"
                                    style={styles.btnPrimary}
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
                                  className="btn btn-sm"
                                  style={
                                    already
                                      ? styles.btnOutlineSecondary
                                      : styles.btnPrimary
                                  }
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
                  <div style={styles.mockPayment}>
                    <h6>Mock Payment</h6>
                    <div className="mb-3">
                      <label className="form-label">User ID (Name)</label>
                      <input
                        type="text"
                        className="form-control"
                        style={styles.formControl}
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                      />
                    </div>
                    <button
                      className="btn btn-sm"
                      style={styles.btnPrimary}
                      onClick={handlePay}
                    >
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
