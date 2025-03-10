import Arrow from "./Arrow";
import Handler from "./Handler";

class MessageProcessingRoute {
    #fromArrow: Arrow;
    #processingHandler: Handler;
    name: string = '';

    constructor(arrow: Arrow, processingHandler: Handler) {
        this.#fromArrow = arrow;
        this.#processingHandler = processingHandler;

        if(this.#fromArrow && this.#processingHandler) {
            this.name = `${this.#processingHandler.name}(${this.#fromArrow.messageId})`;
        }

        if(this.#fromArrow) {
            this.#fromArrow.route = this;
        }

        if(this.#processingHandler) {
            this.#processingHandler.route = this;
        }
    }

    get fromArrow() {
        return this.#fromArrow;
    }

    get processingHandler() {
        return this.#processingHandler;
    }   
}

export default MessageProcessingRoute;
