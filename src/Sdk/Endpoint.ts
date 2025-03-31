interface EndpointDetails {
    host: string;
    host_id: string;
    name: string;
}

interface Endpoint {
    id: string;
    host_display_name: string;
    endpoint_details: EndpointDetails;
}

export default Endpoint;