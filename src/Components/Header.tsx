import React, { useRef, useState, useEffect } from 'react';
import { Navbar, Nav, Container, Form, FormControl, Button, InputGroup, Overlay, Tooltip } from 'react-bootstrap';
import { PiPlugsConnectedFill, PiPlugsFill } from "react-icons/pi";
import { FaGithub } from "react-icons/fa";
import logo from '../assets/react.svg';
import axios from 'axios';
import ConnectionMonitor from '../Utils/ConnectionMonitor';
import NetworkErrorHandler from '../Utils/NetworkErrorHandler';

import { ConnectionData } from '../types/ConnectionTypes';

interface HeaderProps {
  setConnection: (connection: ConnectionData | undefined) => void;
  connection: ConnectionData | undefined;
}

const Header: React.FC<HeaderProps> = ({ setConnection, connection }) => {
  const [inputValue, setInputValue] = useState<string>(localStorage.getItem('serviceControlUrl') || '');
  const [error, setError] = useState<string>('');
  const search = useRef<HTMLInputElement>(null);
  
  // Handle network errors with appropriate user messages
  const handleNetworkError = (err: Error, errorType: string) => {
    console.error('Connection error:', errorType, err.message);
    
    switch (errorType) {
      case 'ERR_NAME_NOT_RESOLVED':
        setError('Service name could not be resolved. Please check the URL and your internet connection.');
        break;
      case 'CONNECTION_REFUSED':
        setError('Connection refused. Please make sure the service is running and accessible.');
        break;
      case 'CONNECTION_TIMEOUT':
        setError('Connection timed out. Please try again later.');
        break;
      case 'NETWORK_CONNECTIVITY':
        setError('Network connectivity issue detected. Please check your internet connection.');
        break;
      default:
        setError('Please enter a valid URL.');
        break;
    }
  };

  // Configure the network error handler
  useEffect(() => {
    // Configure the error handler
    const handler = NetworkErrorHandler.getInstance();
    handler.configure({
      onConnectionError: handleNetworkError
    });

    return () => {
      // Clean up by removing our specific handler on unmount
      handler.configure({
        onConnectionError: undefined
      });
    };
  }, []); // Empty dependency array means this runs once on mount
  
  // Use effect to start/stop connection monitoring
  useEffect(() => {
    if (connection && connection.service_control) {
      // Start monitoring the connection when we have a valid connection
      ConnectionMonitor.getInstance().startMonitoring(connection.service_control);
    } else {
      // Stop monitoring when disconnected
      ConnectionMonitor.getInstance().stopMonitoring();
    }
    
    return () => {
      // Clean up on unmount
      ConnectionMonitor.getInstance().stopMonitoring();
    };
  }, [connection]);

  const handleConnect = async () => {
    try {
      // Clear any previous errors
      setError('');
      
      // Ensure URL has proper protocol
      let urlToConnect = inputValue;
      if (!urlToConnect.startsWith('http://') && !urlToConnect.startsWith('https://')) {
        urlToConnect = 'http://' + urlToConnect;
        setInputValue(urlToConnect);
      }
      
      try {
        // Use Axios directly instead of going through NetworkErrorHandler
        const response = await axios.get(urlToConnect, {
          timeout: 10000,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        const data = response.data;
        
        // Validate the response structure
        if (data && data.description && data.endpoints_url) {
          localStorage.setItem('serviceControlUrl', urlToConnect);
          setConnection({ service_control: urlToConnect, response: data });
        } else {
          setError('Invalid service response. Please check that the URL points to a valid service.');
        }
      } catch (axiosError: any) {
        // Handle Axios errors directly in the handleConnect function
        if (axios.isAxiosError(axiosError)) {
          console.error('Connection error:', axiosError.code, axiosError.message);
          
          if (axiosError.code === 'ENOTFOUND') {
            setError('Service name could not be resolved. Please check the URL and your internet connection.');
          } else if (axiosError.code === 'ECONNREFUSED') {
            setError('Connection refused. Please make sure the service is running and accessible.');
          } else if (axiosError.code === 'ETIMEDOUT' || axiosError.code === 'ECONNABORTED') {
            setError('Connection timed out. Please try again later.');
          } else if (axiosError.code === 'ERR_NETWORK') {
            setError('Network connectivity issue detected. Please check your internet connection.');
          } else if (axiosError.response) {
            // Handle HTTP error responses
            setError(`HTTP error ${axiosError.response.status}: ${axiosError.response.statusText}`);
          } else {
            setError('Failed to connect: ' + axiosError.message);
          }
        } else {
          // For non-Axios errors
          setError('An unexpected error occurred. Please try again.');
          console.error('Unexpected error:', axiosError);
        }
      }
    } catch (error: unknown) {
      // Catch any other errors not caught by the inner try-catch
      console.error('Unexpected outer error:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleDisconnect = () => {
    setConnection(undefined);
    ConnectionMonitor.getInstance().stopMonitoring();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!connection) {
      handleConnect();
    }
  };

  return (
    <Navbar bg="primary" variant="dark" fixed="top" aria-label="Main navigation">
      <Container fluid>
        <Navbar.Brand href="#home">
          <img src={logo} className="App-logo d-inline-block align-top mr-2" alt="Service Insight logo" />
          Service Insight
        </Navbar.Brand>
        <Nav className="ml-auto flex-grow-1 mx-4">
          <Form className="d-inline w-100" onSubmit={handleSubmit} aria-label="Service Control connection form">
            <InputGroup>
              <FormControl
                ref={search}
                type="text"
                placeholder="Enter connection"
                autoComplete="service-control-url"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={!!connection}
                isInvalid={!!error}
                aria-label="Service Control URL"
                aria-describedby={error ? "url-error" : undefined}
                style={{ minWidth: "300px" }}
              />
              <Button 
                variant="outline-light" 
                type="submit" 
                hidden={!!connection}
                aria-label="Connect to Service Control"
                className="rounded-end"
              >
                <PiPlugsFill />
              </Button>
              <Button 
                variant="outline-light" 
                onClick={handleDisconnect} 
                hidden={!connection}
                aria-label="Disconnect from Service Control"
                className="rounded-end"
              >
                <PiPlugsConnectedFill />
              </Button>
            </InputGroup>
          </Form>
        </Nav>
        <Nav className="me-auto">
          <Nav.Link href="https://github.com/luizbon/service-insight-web" target="_blank" rel="noopener noreferrer" className="d-flex align-items-center">
            <FaGithub className="me-1" />
          </Nav.Link>
        </Nav>
        <Overlay target={search.current || null} show={!!error} placement="left">
          {(props) => (
            <Tooltip id="url-error" {...props} aria-live="polite">
              {error}
            </Tooltip>
          )}
        </Overlay>
      </Container>
    </Navbar>
  );
};

export default Header;
