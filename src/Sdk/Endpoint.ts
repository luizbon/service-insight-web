interface Endpoint {
    name: string;
    id: string;
    is_sending_heartbeats: boolean;
    monitor_heartbeat: boolean;
    monitored: boolean;
    host_display_name: string;
}

export default Endpoint;