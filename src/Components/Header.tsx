import React, { useRef, useState } from 'react';
import { Navbar, Nav, Container, Form, FormControl, Button, InputGroup, Overlay, Tooltip } from 'react-bootstrap';
import { PiPlugsConnectedFill, PiPlugsFill } from "react-icons/pi";
import logo from '../assets/react.svg';

interface HeaderProps {
  setConnection: (connection: { service_control: string, response: any } | null) => void;
  connection: { service_control: string, response: any } | null;
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
    setConnection(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!connection) {
      handleConnect();
    }
  };

  return (
    <Navbar bg="primary" variant="dark" fixed="top">
      <Container fluid>
        <Navbar.Brand href="#home">
          <img src={logo} className="App-logo d-inline-block align-top mr-2" alt="logo" />
          Service Insight
        </Navbar.Brand>
        <Nav className="ml-auto">
          <Form className="d-inline" onSubmit={handleSubmit}>
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
              />
              <Button variant="outline-light" type="submit" hidden={!!connection}>
                <PiPlugsFill />
              </Button>
              <Button variant="outline-light" onClick={handleDisconnect} hidden={!connection}>
                <PiPlugsConnectedFill />
              </Button>
            </InputGroup>
          </Form>
        </Nav>
        <Overlay target={search.current} show={!!error} placement="left">
          {(props) => (
            <Tooltip {...props}>
              {error}
            </Tooltip>
          )}
        </Overlay>
      </Container>
    </Navbar>
  );
};

export default Header;
