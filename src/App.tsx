// filepath: /workspaces/service-insight-web/src/App.tsx
import { useState, useEffect } from 'react';
import './App.css';
import Layout from './Layout';
import Messages from './Components/Messages';
import Details from './Components/Details';
import { Stack } from 'react-bootstrap';
import Endpoint from './Sdk/Endpoint';
import Message from './Models/Message';
import { ConnectivityProvider } from './Utils/ConnectivityContext';
import NetworkErrorHandler from './Utils/NetworkErrorHandler';
import { ConnectionData } from './types/ConnectionTypes';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [endpoint, setEndpoint] = useState<Endpoint | undefined>(undefined);
  const [connection, setConnection] = useState<ConnectionData | undefined>(undefined);
  const [message, setMessage] = useState<Message | undefined>(undefined);

  useEffect(() => {
    // Configure the NetworkErrorHandler when the component mounts
    NetworkErrorHandler.getInstance().configure({
      onConnectionError: (_error, errorType) => {
        // The ConnectivityContext will handle displaying the modal
        if (errorType === 'ERR_NAME_NOT_RESOLVED' || 
            errorType === 'FAILED_TO_FETCH' || 
            errorType === 'NETWORK_REQUEST_FAILED') {
          const errorMessage = errorType === 'ERR_NAME_NOT_RESOLVED' 
            ? 'Could not resolve the service name. Please check the URL and your internet connection.'
            : 'Failed to connect to the service. Please check your internet connection.';
          
          // We'll access this through the useConnectivity hook in the context
          document.dispatchEvent(new CustomEvent('connection-error', { 
            detail: { message: errorMessage } 
          }));
        }
      }
    });
  }, []);

  return (
    <ConnectivityProvider>
      <Layout setEndpoint={setEndpoint} setConnection={setConnection} connection={connection}>
        <Stack gap={3}>
          <Messages connection={connection} endpoint={endpoint} setMessages={setMessages} messages={messages} setMessage={setMessage} />
          <Details message={message} connection={connection} />
        </Stack>
      </Layout>
    </ConnectivityProvider>
  );
}

export default App;
