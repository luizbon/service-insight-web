interface Message {
    sending_endpoint: any;
    receiving_endpoint: any;
    headers: any;
    status: string;
    message_id: string;
    message_type: string;
    time_sent: string;
    processing_time: string;
}

export default Message;