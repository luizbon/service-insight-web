import React, { useEffect, useState } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import ServiceControl from '../Utils/ServiceControl'; // Import ServiceControl from Utils folder
import TypeHumanizer from '../Utils/TypeHumanizer';
import Endpoint from '../Sdk/Endpoint';

interface EndpointsProps {
    connection: { service_control: string } | null;
    setEndpoint: (endpoint: Endpoint | undefined) => void;
}

const Endpoints: React.FC<EndpointsProps> = ({ connection, setEndpoint }) => {
    const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    useEffect(() => {
        if (connection) {
            const service_control = new ServiceControl(connection);
            service_control.getEndpoints()
                .then(data => setEndpoints(data))
                .catch(error => console.error('Error fetching endpoints:', error));
        }
    }, [connection]);

    useEffect(() => {
        if (!connection) return;
        if (activeIndex == null) {
            setEndpoint(undefined);
        } else {
            const endpoint = endpoints[activeIndex];
            setEndpoint(endpoint);
        }
    }, [activeIndex]);

    return (
        <>
            {connection &&
                <ListGroup>
                    <ListGroup.Item action active={activeIndex == null} onClick={() => setActiveIndex(null)}>{connection.service_control}</ListGroup.Item>
                    {endpoints.map((endpoint, index) => (
                        <OverlayTrigger
                            key={index}
                            placement="top"
                            overlay={<Tooltip>{endpoint.name}</Tooltip>}
                        >
                            <ListGroup.Item
                                action
                                active={index === activeIndex}
                                onClick={() => setActiveIndex(index)}
                            >
                                <div className="ms-3 text-wrap text-break">{TypeHumanizer.toName(endpoint.name)}</div>
                            </ListGroup.Item>
                        </OverlayTrigger>
                    ))}
                </ListGroup>
            }
        </>
    );
};

export default Endpoints;
