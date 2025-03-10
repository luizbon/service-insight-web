import React, { useEffect, useState } from "react";
import ServiceControl from "../../Utils/ServiceControl";
import ModelCreator from "./ModelCreator";

interface SequenceDiagramProps {
    connection: any;
    message: any;
}

const SequenceDiagram: React.FC<SequenceDiagramProps> = ({ connection, message }) => {
    const [messages, setMessages] = useState<any[]>([]);
    useEffect(() => {
        if (!connection || !message?.conversation_id) {
            return;
        }
        const conversationId = message.conversation_id;
        const serviceControl = new ServiceControl(connection);
        serviceControl.getConversationById(conversationId)
            .then(messages => {
                setMessages(messages);
            })
            .catch(error => console.error('Error fetching conversation:', error));
    }, [connection, message]);

    useEffect(() => {
        const model = new ModelCreator(messages);
        console.log(model);
    }, [messages]);

    const renderSequenceDiagram = () => {
        return <div>Sequence Diagram</div>;
        {/* // return messages.map((msg, index) => (
        //     <div key={index}>
        //         <strong>{msg.sending_endpoint.name}</strong> to <strong>{msg.receiving_endpoint.name}</strong>: {msg.content}
        //     </div>
        // )); */}
    };

    return (
        <div>
            {renderSequenceDiagram()}
        </div>
    );
};

export default SequenceDiagram;
