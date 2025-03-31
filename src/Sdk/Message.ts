export interface MessageEndpoint {
    name: string;
    host_id: string;
    host: string;
}

interface Saga {
    saga_id: string;
    saga_type: string;
    change_status: string;
}

interface Message {
    body_size: number;
    body_url: string;
    conversation_id: string;
    critical_time: string;
    delivery_time: string;
    headers: KeyValuePair[];
    id: string;
    instance_id: string;
    invoked_sagas: Saga[];
    is_system_message: boolean;
    message_id: string;
    message_intent: string;
    message_type: string;
    originates_from_saga: Saga;
    processed_at: string;
    processing_time: string;
    receiving_endpoint: MessageEndpoint;
    sending_endpoint: MessageEndpoint;
    status: string;
    time_sent: string;
}

export default Message;