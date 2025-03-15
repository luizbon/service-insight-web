import React, { useEffect, useState } from 'react';
import { RichTreeView } from '@mui/x-tree-view';
import ServiceControl from '../Utils/ServiceControl'; // Import ServiceControl from Utils folder
import Endpoint from '../Sdk/Endpoint';

interface EndpointsProps {
    connection: { service_control: string } | null;
    setEndpoint: (endpoint: Endpoint | undefined) => void;
}

interface TreeNode {
    id: string;
    label: string;
    children: TreeNode[];
}

const Endpoints: React.FC<EndpointsProps> = ({ connection, setEndpoint }) => {
    const [endpoints, setEndpoints] = useState<any>({});
    const [activeId, setActiveId] = useState<string | undefined>(undefined);
    const [nodes, setNodes] = useState<TreeNode[]>([]);

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
                } else if(endpoint.name === activeId) {
                    setEndpoint(endpoint);
                    return;
                }
            }
        }
    }, [activeId, connection]);

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
                    id: endpointGroup[0].name, 
                    label: endpointGroup[0].name, 
                    children: [] 
                };
                endpointGroup.forEach((endpoint: any) => {
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
                    label: endpoint.name, 
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
                <RichTreeView items={nodes} onItemClick={(_event, itemId) => setActiveId(itemId)} expansionTrigger="iconContainer"
                defaultExpandedItems={[connection.service_control]} itemChildrenIndentation={5} />
            }
        </>
    );
};

export default Endpoints;
