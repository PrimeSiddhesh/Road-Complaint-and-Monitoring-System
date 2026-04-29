import React from 'react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="loader-container">
      <div className="loader">
        <div className="spinner"></div>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Loader;
