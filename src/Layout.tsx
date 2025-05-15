import React, { useState, ReactNode } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Layout.css';
import Header from './Components/Header';
import Endpoints from './Components/Endpoints';
import PinOffcanvas from './Components/PinOffcanvas';
import Endpoint from './Sdk/Endpoint';

interface LayoutProps {
  children: ReactNode;
  setEndpoint: (endpoint: Endpoint | undefined) => void;
  connection: any;
  setConnection: (connection: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, setEndpoint, connection, setConnection }) => {
  const [isEndpointShown, setIsEndpointShown] = useState(true);

  return (
    <>
      <Header setConnection={setConnection} connection={connection} />
      <Container fluid as="main" role="main" aria-label="Main content">
        {!isEndpointShown &&
        <div className="vertical-floating-tab tab-left" 
             onClick={() => setIsEndpointShown(!isEndpointShown)}
             role="button"
             tabIndex={0}
             aria-label="Show endpoint explorer"
             onKeyPress={(e) => {
               if (e.key === 'Enter') {
                 setIsEndpointShown(!isEndpointShown)
               }
             }}>
          <span>Endpoint Explorer</span>
        </div>
        }
        <Row>
          <Col xs={isEndpointShown ? 3 : 0} className="no-overflow" role="complementary" aria-label="Endpoint explorer">
            <PinOffcanvas show={isEndpointShown} placement="start" startPinned={true} onHide={() => setIsEndpointShown(false)}>
              <PinOffcanvas.Title>
                <h2>Endpoint Explorer</h2>
              </PinOffcanvas.Title>
              <PinOffcanvas.Body>
                <Endpoints connection={connection} setEndpoint={setEndpoint} />
              </PinOffcanvas.Body>
            </PinOffcanvas>
          </Col>
          <Col xs={isEndpointShown ? 9 : 12} className="no-overflow">
            {children}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Layout;
