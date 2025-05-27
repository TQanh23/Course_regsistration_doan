import React from 'react';
import { useAuth } from '../context/AuthContext';

// A simple component to toggle the development authentication bypass
// This should only be used during development and removed for production
const DevBypassToggle: React.FC = () => {
  const { devBypassAuth, toggleDevBypass } = useAuth();

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        padding: '8px 12px',
        backgroundColor: devBypassAuth ? 'green' : 'red',
        color: 'white',
        borderRadius: '4px',
        cursor: 'pointer',
        zIndex: 9999,
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
      onClick={toggleDevBypass}
    >
      Dev Mode: {devBypassAuth ? 'ON' : 'OFF'}
    </div>
  );
};

export default DevBypassToggle;