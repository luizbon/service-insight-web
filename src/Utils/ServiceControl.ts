import Endpoint from "../Sdk/Endpoint";

class ServiceControl {
  #baseUrl: string;
  #conversationEndpoint: string;
  #defaultEndpointsEndpoint: string;
  #endpointMessagesEndpoint: string;
  #retryEndpoint: string;
  #messagesEndpoint: string;
  #messageBodyEndpoint: string;
  #sagaEndpoint: string;
  #defaultPageSize: number;

  constructor(connection: any) {
    const { service_control } = connection;
    this.#baseUrl = service_control;
    this.#conversationEndpoint = "conversations/$0";
    this.#defaultEndpointsEndpoint = "endpoints";
    this.#endpointMessagesEndpoint = "endpoints/$0/messages";
    this.#retryEndpoint = "errors/$0/retry";
    this.#messagesEndpoint = "messages";
    this.#messageBodyEndpoint = "messages/$0/body";
    this.#sagaEndpoint = "sagas/$0";
    this.#defaultPageSize = 10;
  }

  async getEndpoints(monitoredOnly: boolean = true): Promise<Endpoint[]> {
    const url = this.#concatPath(this.#defaultEndpointsEndpoint);
    const response = await fetch(url);
    const data = await response.json();
    
    const groupedEndpoints = data.reduce((acc: { [key: string]: Endpoint[] }, endpoint: Endpoint) => {
      if(monitoredOnly && !endpoint.monitored) {
        return acc;
      }
      if (!acc[endpoint.name]) {
        acc[endpoint.name] = [];
      }
      acc[endpoint.name].push(endpoint);
      return acc;
    }, {});
    
    return groupedEndpoints;
  }

  async getMessageData(message: any) {
    const bodyUrl = message.body_url ?? this.#messageBodyEndpoint.replace("$0", message.message_id);
    const url = this.#concatPath(bodyUrl);
    const response = await fetch(url);
    const body = await response.text();
    if (body.startsWith("<?xml")) {
      return body;
    }
    return JSON.stringify(JSON.parse(body), null, 2);
  }

  async retryMessage(messageId: string, instanceId?: string) {
    const retryUrl = instanceId ? this.#retryEndpoint.replace("$0", `${messageId}?instance_id=${instanceId}`) : this.#retryEndpoint.replace("$0", messageId);
    await fetch(this.#concatPath(retryUrl), { method: "POST" });
  }

  async getSagaById(sagaId: string) {
    const sagaUrl = this.#sagaEndpoint.replace("$0", sagaId);
    const url = this.#concatPath(sagaUrl);
    const response = await fetch(url);
    return await response.json();
  }

  async getAuditMessages(endpoint: string | undefined, page: number, searchQuery: string | undefined, orderBy: string, ascending: boolean, pageSize: number) {
    const messagesUrl = this.#concatSearch(this.#concatPath(endpoint ? this.#endpointMessagesEndpoint.replace("$0", endpoint) : this.#messagesEndpoint), searchQuery);
    const parameters = this.#appendSystemMessages(this.#appendOrdering(this.#appendPage(this.#appendPaging(this.#appendSearchQuery("", searchQuery), pageSize ?? this.#defaultPageSize), page), orderBy, ascending));

    const response = await fetch(`${messagesUrl}?${parameters}`);
    const totalCount = Number(response.headers.get('total-count') ?? 0);
    const messages = await response.json();

    return { totalCount, messages };
  }

  async getConversationById(conversationId: string, pageSize?: number) {
    const conversationUrl = this.#conversationEndpoint.replace("$0", conversationId);
    const parameters = this.#appendPaging(this.#appendPage("", 0), pageSize ?? this.#defaultPageSize);
    const url = this.#concatPath(conversationUrl);
    const response = await fetch(`${url}?${parameters}`);
    return await response.json();
  }

  #concatPath(path: string) {
    return this.#concat(this.#baseUrl, path);
  }

  #concat(base: string, path: string) {
    if (!base.endsWith('/') && !path.startsWith('/')) {
      return `${base}/${path}`;
    } else if (base.endsWith('/') && path.startsWith('/')) {
      return `${base}${path.substring(1)}`;
    } else {
      return `${base}${path}`;
    }
  }

  #appendSystemMessages(parameters: string) {
    return this.#concatParameters(parameters, `include_system_messages=${false}`);
  }

  #appendOrdering(parameters: string, orderBy: string, ascending: boolean) {
    if (!orderBy) {
      return parameters;
    }
    return this.#concatParameters(parameters, `order_by=${orderBy}`, `direction=${ascending ? "asc" : "desc"}`);
  }

  #appendPage(parameters: string, page: number) {
    return this.#concatParameters(parameters, `page=${page}`);
  }

  #appendPaging(parameters: string, pageSize: number) {
    return this.#concatParameters(parameters, `per_page=${pageSize ?? this.#defaultPageSize}`);
  }

  #concatSearch(url: string, searchQuery: string | undefined) {
    if (!searchQuery) {
      return url;
    }
    return this.#concat(url, "search");
  }

  #appendSearchQuery(parameters: string, searchQuery: string | undefined) {
    if (!searchQuery) {
      return parameters;
    }
    return this.#concatParameters(parameters, `q=${searchQuery}`);
  }

  #concatParameters(current: string, ...parameters: string[]) {
    if (!current) {
      return parameters.join("&");
    }
    if (!parameters.length) {
      return current;
    }
    return [current, ...parameters].join("&");
  }
}

export default ServiceControl;
