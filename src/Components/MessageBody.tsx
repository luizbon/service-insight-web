import React, { useEffect, useState } from 'react';
import ServiceControl from '../Utils/ServiceControl'; // Import the ServiceControl class
import Message from '../Models/Message';

interface MessageBodyProps {
  message: Message | null;
  connection: any;
}

const MessageBody: React.FC<MessageBodyProps> = ({ message, connection }) => {
  const [bodyContent, setBodyContent] = useState<string | null>(null);

  useEffect(() => {
    if (message) {
      const serviceControl = new ServiceControl(connection);
      serviceControl.getMessageData(message)
        .then(data => setBodyContent(data))
        .catch(error => console.error('Error fetching body content:', error));
    } else {
      setBodyContent(null);
    }
  }, [message]);

  return (
    bodyContent && 
    <div className="mt-3">
      <pre>{bodyContent}</pre>
    </div>
  );
};

export default MessageBody;
