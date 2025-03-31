import Handler from './Handler';

class EndpointItem {
    #fullName: string;
    #hosts: Set<EndpointHost>;
    #timeline: EndpointTimeline;
    #handlers: Handler[];
    
    constructor(name: string, host: string, id: string, version: string | undefined) {
        this.#fullName = name;

        this.#hosts = new Set();
        this.#hosts.add(new EndpointHost(host, id, version));

        this.#timeline = new EndpointTimeline(this);

        this.#handlers = [];
    }

    get timeline() {
        return this.#timeline;
    }

    get fullName() {
        return this.#fullName;
    }

    get hosts() {
        return this.#hosts;
    }

    get hostId() {
        return Array.from(this.hosts).map(host => host.hostId).join(',');
    }

    get host() {
        return Array.from(this.hosts).map(host => host.host).join(',');
    }

    get versions() {
        return Array.from(this.hosts).map(host => host.versions).join(',') ?? undefined;
    }

    get handlers() {
        return this.#handlers;
    }

    addHost(host: EndpointHost) {
        if(!this.hosts.has(host)) {
            this.hosts.add(host);
        } else {
            const existintHost = Array.from(this.hosts).find(h => h.hostId === host.hostId && h.host === host.host);
            existintHost?.addHostVersions(host.hostVersions);
        }
    }

    findHost(hostId: string, hostName: string) {
        return Array.from(this.hosts).find(h => h.hostId === hostId && h.host === hostName);
    }

    hashCode() {
        let hash = 0;
        const str = `${this.#fullName}`;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    equals(other: any) {
        if (!(other instanceof EndpointItem)) {
            return false;
        }
        return this.#fullName === other.fullName;
    }

    toString() {
        return this.#fullName;
    }
}

class EndpointHost {
    #hostId: string;
    #host: string;
    #versions: Set<string>;

    constructor(host: string, hostId: string, version: string | undefined) {
        this.#hostId = hostId;
        this.#host = host;
        this.#versions = new Set();
        if(version) {
            this.#versions.add(version);
        }
    }

    get host() {
        return this.#host;
    }

    get hostId() {
        return this.#hostId;
    }

    get versions() {
        if (this.#versions.size === 0) {
            return undefined;
        }
        return Array.from(this.#versions).join(',');
    }

    get hostVersions() {
        return this.#versions;
    }

    hashCode() {
        let hash = 0;
        const str = `${this.#host}${this.#hostId}`;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    equals(other: any) {
        if (!(other instanceof EndpointHost)) {
            return false;
        }
        return this.#host === other.host && this.#hostId === other.hostId;
    }

    addHostVersions(versions: Set<string>) {
        for (const version of versions) {
            this.#versions.add(version);
        }
    }
}

class EndpointTimeline {
    endpoint: EndpointItem;

    constructor(endpoint: EndpointItem) {
        this.endpoint = endpoint;
    }
}

export default EndpointItem;