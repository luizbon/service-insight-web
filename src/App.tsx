import { useState } from 'react';
import './App.css';
import Layout from './Layout';
import Messages from './Components/Messages';
import Details from './Components/Details';
import { Stack } from 'react-bootstrap';
import Endpoint from './Sdk/Endpoint';
import Message from './Sdk/Message';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [endpoint, setEndpoint] = useState<Endpoint | undefined>(undefined);
  const [connection, setConnection] = useState<any>(null);
  const [message, setMessage] = useState<Message | null>(null);

  return (
    <Layout setEndpoint={setEndpoint} setConnection={setConnection} connection={connection}>
      <Stack gap={3}>
        <Messages connection={connection} endpoint={endpoint} setMessages={setMessages} messages={messages} setMessage={setMessage} />
        <Details message={message} connection={connection} />
      </Stack>
    </Layout>
  );
}

export default App;
