import { Tabs, Tab } from "react-bootstrap";
import MessageBody from "./MessageBody";
// import SequenceDiagram from "./SequenceDiagram";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import Message from "../Models/Message";
import MessageProperties from "./MessageProperties/MessageProperties";

interface DetailsProps {
    message: Message | null;
    connection: any;
}

function fallbackRender({ error }: { error: Error, resetErrorBoundary: () => void }) {
    return (
      <div role="alert">
        <p>Something went wrong:</p>
        <pre style={{ color: "red" }}>{error.message}</pre>
        <pre>{error.stack}</pre>
      </div>
    );
  }

const Details: React.FC<DetailsProps> = ({ message, connection }) => {
    return (
        message && 
        <Tabs className="mt-3" justify>
            {/* <Tab eventKey="flowDiagram" title="Flow Diagram">
                <ErrorBoundary fallbackRender={fallbackRender}>Flow Diagram</ErrorBoundary>
            </Tab>
            <Tab eventKey="saga" title="Saga" aria-label="Saga tab">
                <ErrorBoundary fallbackRender={fallbackRender}>Saga</ErrorBoundary>
            </Tab> */}
            {/* <Tab eventKey="sequenceDiagram" title="Sequence Diagram">
                <ErrorBoundary fallbackRender={fallbackRender}><SequenceDiagram connection={connection} message={message} /></ErrorBoundary>
            </Tab> */}
            <Tab eventKey="body" title="Body">
                <ErrorBoundary fallbackRender={fallbackRender}><MessageBody message={message} connection={connection} /></ErrorBoundary>
            </Tab>
            <Tab eventKey="properties" title="Properties">
                <ErrorBoundary fallbackRender={fallbackRender}><MessageProperties message={message} /></ErrorBoundary>
            </Tab>
        </Tabs>        
    )
};
export default Details;
