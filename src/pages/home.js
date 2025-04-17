// src/pages/Home.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';



function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    apiFetch('/api/events')
      .then(res => res.json())
      .then(data => console.log(data));
  }, []);
  const handleClick = () => {
    navigate('/login');
  };

  return (
    <div className="container py-5">
      <h2 className="text-primary">Calcutta</h2>
      <button className="btn btn-success" onClick={handleClick}>
        Login
      </button>
    </div>
  );
}

export default Home;
