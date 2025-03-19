import MessageStatus from "./MessageStatus";
import SdkMessage from "../Sdk/Message";
import DynamicPropertyResolver from "./DynamicPropertyResolver";

class Message {
  #message: SdkMessage;
  #headers: KeyValuePair[];
  #typedHeaders: DynamicPropertyResolver;
  #receivingEndpoint: Endpoint;
  #sendingEndpoint: Endpoint;
  #messageIntent: string | undefined;

  constructor(message: SdkMessage) {
    this.#message = message;
    this.#headers = message.headers;
    this.#typedHeaders = new DynamicPropertyResolver(message.headers);
    this.#receivingEndpoint = new Endpoint(message.receiving_endpoint);
    this.#sendingEndpoint = new Endpoint(message.sending_endpoint);
  }

  get messageId() {
    return this.#message.message_id;
  }

  get bodyUrl() {
    return this.#message.body_url;
  }

  get criticalTime() {
    return this.#convertTimeToMilliseconds(this.#message.critical_time);
  }

  get deliveryTime() {
    return this.#convertTimeToMilliseconds(this.#message.delivery_time);
  }

  get processedAt() {
    return new Date(this.#message.processed_at);
  }

  get processingTime(): number {
    return this.#convertTimeToMilliseconds(this.#message.processing_time);
  }

  get messageType() {
    return this.#message.message_type;
  }

  get receivingEndpoint() {
    return this.#receivingEndpoint;
  }

  get sendingEndpoint() {
    return this.#sendingEndpoint;
  }

  get timeSent(): Date | undefined {
    return this.#message.time_sent ? new Date(this.#message.time_sent) : undefined;
  }

  get messageIntent() {
    return this.#messageIntent;
  }

  set messageIntent(value) {
    this.#messageIntent = value;
  }

  get id() {
    return this.#message.id;
  }

  get isSystemMessage() {
    return this.#message.is_system_message;
  }

  get conversationId() {
    return this.#message.conversation_id;
  }

  get bodySize() {
    return this.#message.body_size;
  }

  get instanceId() {
    return this.#message.instance_id;
  }

  get status(): MessageStatus {
    switch(this.#message.status.toLowerCase()) {
      case "failed":
        return MessageStatus.Failed;
      case "resolved":
        return MessageStatus.ResolvedSuccessfully;
      case "repeatedfailure":
        return MessageStatus.RepeatedFailure;
      case "archivedfailure":
        return MessageStatus.ArchivedFailure;
      case "retryissued":
        return MessageStatus.RetryIssued;
      default:
        return MessageStatus.Successful;
    }
  }

  get headers(): any {
    return this.#typedHeaders;
  }

  getHeaderByKey(key: string, defaultValue: string | undefined = undefined) {
    const keyWithPrefix = `NServiceBus.${key}`.toLocaleLowerCase();
    const lowCaseKey = key.toLocaleLowerCase();
    const header = this.#headers.find((header: any) => header.key.toLocaleLowerCase() === lowCaseKey || header.key.toLocaleLowerCase() === keyWithPrefix);
    return header ? header.value : defaultValue;
  }

  #convertTimeToMilliseconds(time: string): number {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }
}

class Endpoint {
  #endpointDetails: EndpointDetails;

  constructor(endpointDetails: any) {
    this.#endpointDetails = new EndpointDetails(endpointDetails);
  }

  get host() {
    return this.#endpointDetails.host;
  }

  get hostId() {
    return this.#endpointDetails.hostId;
  }

  get name() {
    return this.#endpointDetails.name;
  }

  get address() {
    return `${this.name}${this.atMachine}`;
  }

  get atMachine() {
    return this.host ? `@${this.host}` : "";
  }

  hashCode() {
    let hash = 0;
    if (this.address.length === 0) return hash;
    for (let i = 0; i < this.address.length; i++) {
      const char = this.address.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  equals(other: Endpoint) {
    return other && other.address === this.address;
  }
}

class EndpointDetails {
  #name: string;
  #host: string;
  #hostId: string;

  constructor(endpoint: any) {
    this.#host = endpoint.host;
    this.#hostId = endpoint.host_id;
    this.#name = endpoint.name;
  }

  get host() {
    return this.#host;
  }

  get hostId() {
    return this.#hostId;
  }

  get name() {
    return this.#name;
  }
}

export default Message;
