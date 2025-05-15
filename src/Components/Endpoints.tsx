import React, { useEffect, useState } from 'react';
import { RichTreeView } from '@mui/x-tree-view';
import ServiceControl from '../Utils/ServiceControl'; // Import ServiceControl from Utils folder
import Endpoint from '../Sdk/Endpoint';
import { ConnectionData } from '../types/ConnectionTypes';

interface EndpointsProps {
    connection: ConnectionData | undefined;
    setEndpoint: (endpoint: Endpoint | undefined) => void;
}

interface TreeNode {
    id: string;
    label: string;
    children: TreeNode[];
}

const Endpoints: React.FC<EndpointsProps> = ({ connection, setEndpoint }) => {
    const [endpoints, setEndpoints] = useState<Record<string, Endpoint[]>>({});
    const [activeId, setActiveId] = useState<string | undefined>(undefined);
    const [nodes, setNodes] = useState<TreeNode[]>([]);

    useEffect(() => {
        if (connection) {
            const service_control = new ServiceControl(connection);
            service_control.getEndpoints()
                .then(data => {
                    // Group endpoints by name
                    const groupedEndpoints: Record<string, Endpoint[]> = {};
                    data.forEach((endpoint: Endpoint) => {
                        const name = endpoint.endpoint_details.name;
                        if (!groupedEndpoints[name]) {
                            groupedEndpoints[name] = [];
                        }
                        groupedEndpoints[name].push(endpoint);
                    });
                    setEndpoints(groupedEndpoints);
                })
                .catch(error => console.error('Error fetching endpoints:', error));
        }
    }, [connection]);

    useEffect(() => {
        if (!connection) return;
        if (activeId === connection.service_control) {
            setEndpoint(undefined);
            return;
        }
        for(const key in endpoints) {
            const endpointGroup = endpoints[key];
            for(const endpoint of endpointGroup) {
                if(endpoint.id === activeId) {
                    setEndpoint(endpoint);
                    return;
                } else if(endpoint.endpoint_details.name === activeId) {
                    setEndpoint(endpoint);
                    return;
                }
            }
        }
    }, [activeId, connection, endpoints, setEndpoint]);

    useEffect(() => {
        if (!connection){
            setNodes([]);
            return;
        }
        const nodes: TreeNode[] = [];
        const root: TreeNode = { 
            id: connection.service_control, 
            label: connection.service_control, 
            children: [] 
        };
        nodes.push(root);
        
        for (const key in endpoints) {
            const endpointGroup = endpoints[key];
            if(endpointGroup.length > 1) {
                const endpointNode: TreeNode = { 
                    id: endpointGroup[0].endpoint_details.name, 
                    label: endpointGroup[0].endpoint_details.name, 
                    children: [] 
                };
                endpointGroup.forEach((endpoint: Endpoint) => {
                    endpointNode.children.push({ 
                        id: endpoint.id, 
                        label: endpoint.host_display_name, 
                        children: [] 
                    });
                });
                root.children.push(endpointNode);
            } else {
                const endpoint = endpointGroup[0];
                const endpointNode: TreeNode = { 
                    id: endpoint.id, 
                    label: endpoint.endpoint_details.name, 
                    children: [] 
                };
                root.children.push(endpointNode);
            }
        }
        setNodes(nodes);
    }, [connection, endpoints]);

    return (
        <>
            {connection &&
                <RichTreeView 
                    items={nodes} 
                    onItemClick={(_event, itemId) => {
                        setActiveId(itemId);
                    }} 
                    expansionTrigger="iconContainer"
                    defaultExpandedItems={[connection.service_control]} 
                    itemChildrenIndentation={5} 
                    aria-label="Endpoint navigation tree"
                    role="tree"
                />
            }
        </>
    );
};

export default Endpoints;
