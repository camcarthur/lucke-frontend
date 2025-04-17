import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { auth } = useContext(AuthContext);

  if (auth.loading) {
    return <div>Loading...</div>;
  }

  if (!auth.isLoggedIn || auth.user.role !== 'admin') {
    return (
      <div>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
