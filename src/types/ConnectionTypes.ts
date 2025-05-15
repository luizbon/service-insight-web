
export interface ServiceControlResponse {
  description: string;
  endpoints_url: string;
  [key: string]: any; // For other properties that might exist
}

export interface ConnectionData {
  service_control: string;
  response: ServiceControlResponse;
}
