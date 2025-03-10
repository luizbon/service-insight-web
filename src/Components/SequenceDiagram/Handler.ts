import Arrow from "./Arrow";
import EndpointItem from "./EndpointItem";
import MessageProcessingRoute from "./MessageProcessingRoute";

class Handler {
    id: string;
    out: any[];
    #arrowIn: Arrow | undefined;
    endpoint: EndpointItem | undefined;
    state: string | undefined;
    processedAtGuess: Date | undefined;
    route: MessageProcessingRoute | undefined;
    processedAt: Date | undefined;
    processingTime: number | undefined;
    name: string | undefined;

    constructor(id: string) {
        this.id = id;
        this.out = [];
    }

    get handledAt(): Date | undefined {
        return this.processedAt ?? this.processedAtGuess;
    }

    get in(): Arrow | undefined {
        return this.#arrowIn;
    }

    set in(value: Arrow) {
        if(this.#arrowIn) {
            throw new Error("Only one arrow is allowed to come in");
        }
        this.#arrowIn = value;
    }

    updateProcessedAtGuess(timeSent: Date | undefined): void {
        if (!timeSent) {
            return;
        }

        if (!this.processedAtGuess || this.processedAtGuess > timeSent) {
            this.processedAtGuess = timeSent;
        }
    }
}

export default Handler;
