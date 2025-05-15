import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ConnectivityContextType {
  showConnectionError: (message: string) => void;
  hideConnectionError: () => void;
}

const ConnectivityContext = createContext<ConnectivityContextType>({
  showConnectionError: () => {},
  hideConnectionError: () => {},
});

export const useConnectivity = () => useContext(ConnectivityContext);

interface ConnectivityProviderProps {
  children: ReactNode;
}

export const ConnectivityProvider: React.FC<ConnectivityProviderProps> = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Add event listener for connection errors
  useEffect(() => {
    const handleConnectionError = (event: CustomEvent<{ message: string }>) => {
      setErrorMessage(event.detail.message);
      setShowModal(true);
    };

    // Listen for custom connection error events
    document.addEventListener('connection-error', handleConnectionError as EventListener);

    return () => {
      document.removeEventListener('connection-error', handleConnectionError as EventListener);
    };
  }, []);

  const showConnectionError = (message: string) => {
    setErrorMessage(message);
    setShowModal(true);
  };

  const hideConnectionError = () => {
    setShowModal(false);
  };

  return (
    <ConnectivityContext.Provider value={{ showConnectionError, hideConnectionError }}>
      {children}
      <Modal 
        show={showModal} 
        onHide={hideConnectionError} 
        backdrop="static" 
        keyboard={true} 
        centered
        aria-labelledby="connectivity-error-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="connectivity-error-title">Connection Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{errorMessage}</p>
          <p className="text-danger">Please check your internet connection and verify the service endpoint URL is correct.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={hideConnectionError}>
            Dismiss
          </Button>
        </Modal.Footer>
      </Modal>
    </ConnectivityContext.Provider>
  );
};
