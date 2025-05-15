import React, { useRef, useState } from 'react';
import { Navbar, Nav, Container, Form, FormControl, Button, InputGroup, Overlay, Tooltip } from 'react-bootstrap';
import { PiPlugsConnectedFill, PiPlugsFill } from "react-icons/pi";
import logo from '../assets/react.svg';
import { FaGithub } from "react-icons/fa";

interface HeaderProps {
  setConnection: (connection: { service_control: string, response: any } | undefined) => void;
  connection: { service_control: string, response: any } | undefined;
}

const Header: React.FC<HeaderProps> = ({ setConnection, connection }) => {
  const [inputValue, setInputValue] = useState<string>(localStorage.getItem('serviceControlUrl') || '');
  const [error, setError] = useState<string>('');
  const search = useRef<HTMLInputElement>(null);

  const handleConnect = async () => {
    try {
      const response = await fetch(inputValue);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data && data.description && data.endpoints_url) {
        localStorage.setItem('serviceControlUrl', inputValue);
        setConnection({ service_control: inputValue, response: data });
        setError('');
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      setError('Please enter a valid URL.');
    }
  };

  const handleDisconnect = () => {
    setConnection(undefined);
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
