import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100 text-center text-white px-3"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2e2e2e 100%)'
      }}
    >
      <h1 className="display-4 fw-bold mb-3">Join the Calcutta Showdown</h1>
      <p className="lead mb-4">
        Compete, bid, and profit on your favorite contestants.
      </p>
      <button
        className="btn btn-success fw-semibold px-4"
        onClick={() => navigate('/login')}
      >
        Login
      </button>
    </div>
  );
}

export default Home;