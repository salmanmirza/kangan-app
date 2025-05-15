import React from 'react';

const UnauthorizedPage = () => {
  return (
    <div style={{ textAlign: 'cen`ter', padding: '4rem' }}>
      <h1 style={{ fontSize: '2rem', color: '#e80202' }}>🚫 Unauthorized Access</h1>
      <p style={{ fontSize: '1.2rem' }}>
        You do not have permission to view this page.
      </p>
      <p>
        Please <a href="/login">log in</a> or contact the administrator if you believe this is an error.
      </p>
    </div>
  );
};

export default UnauthorizedPage;
