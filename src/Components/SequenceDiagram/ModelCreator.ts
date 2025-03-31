import Message from '../../Models/Message';
import MessageHeaderKeys from '../../Utils/MessageHeaderKeys';
import Handler from './Handler';
import HandlerState from './HandlerState';
import TypeHumanizer from '../../Utils/TypeHumanizer';
import Arrow from './Arrow';
import ArrowType from './ArrowType';
import MessageIntent from '../../Models/MessageIntent';
import MessageProcessingRoute from './MessageProcessingRoute';
import EndpointItem from './EndpointItem';

class ModelCreator {
    #messages: Message[];
    #handlers: Handler[] = [];
    #endpoitns: EndpointItem[] = [];
    #processingRoutes: MessageProcessingRoute[] = [];
    #conversationStartHandlerName: string = "First";

    constructor(messages: Message[]) {
        this.#messages = messages;

        this.#initialize();
    }

    #initialize() {
        const endpointRegistry: EndpointItem[] = [];
        const handlerRegistry = new HandlerRegistry();
        const firstOderHandlers: Handler[] = [];

        const messageTrees = this.#createMessageTrees(this.#messages);
        const messagesInOrder = messageTrees.flatMap(tree => [...tree.walk()]);

        for (const message of messagesInOrder) {
            if(message.sendingEndpoint) {
                endpointRegistry.push(this.#createSendingEndpoint(message));
            }
        }

        for (const message of messagesInOrder) {
            endpointRegistry.push(this.#createProcessingEndpoint(message));
        }

        for (const message of messagesInOrder) {
            const sendingEndpoint = endpointRegistry.find(endpoint => endpoint.host === message.sendingEndpoint?.host)!;
            if (this.#endpoitns.findIndex(endpoint => endpoint.host === sendingEndpoint.host) === -1) {
                this.#endpoitns.push(sendingEndpoint);
            }

            const processingEndpoint = endpointRegistry.find(endpoint => endpoint.host === message.receivingEndpoint.host)!;
            if (this.#endpoitns.findIndex(endpoint => endpoint.host === processingEndpoint.host) === -1) {
                this.#endpoitns.push(processingEndpoint);
            }

            const { isNew: isNewSender, handler: sendingHandler } = handlerRegistry.tryRegisterHandler(this.#createSendingHandler(message, sendingEndpoint));
            if (isNewSender) {
                firstOderHandlers.push(sendingHandler);
                sendingEndpoint.handlers.push(sendingHandler);
            }

            sendingHandler.updateProcessedAtGuess(message.timeSent);

            const { isNew: isNewProcessing, handler: processingHandler } = handlerRegistry.tryRegisterHandler(this.#createProcessingHandler(message, processingEndpoint));
            if (isNewProcessing) {
                firstOderHandlers.push(processingHandler);
                processingEndpoint.handlers.push(processingHandler);
            } else {
                this.#updateProcessingHandler(message, processingHandler);
            }

            const arrow = this.#createArrow(message);
            arrow.toHandler = processingHandler;
            arrow.fromHandler = sendingHandler;

            const messageProcessingRoute = this.#createRoute(arrow, processingHandler);
            arrow.messageProcessingRoute = messageProcessingRoute;
            this.#processingRoutes.push(messageProcessingRoute);
            processingHandler.in = arrow;
        }

        const start = firstOderHandlers.filter(handler => handler.id === this.#conversationStartHandlerName);
        const orderedByHandledAt = firstOderHandlers
            .filter(handler => handler.id !== this.#conversationStartHandlerName)
            .sort((a, b) => (a.handledAt?.getTime() ?? 0) - (b.handledAt?.getTime() ?? 0));

        this.#handlers = [...start, ...orderedByHandledAt];
    }

    get handlers() {
        return Array.from(this.#handlers);
    }

    get routes() {
        return Array.from(this.#processingRoutes);
    }

    #createRoute(arrow: Arrow, handler: Handler) {
        return new MessageProcessingRoute(arrow, handler);
    }

    #createArrow(message: Message) {
        const arrow = new Arrow(message);
        arrow.name = TypeHumanizer.toName(message.messageType);

        if (message.messageIntent == MessageIntent.Publish) {
            arrow.type = ArrowType.Event;
        } else {
            const isTimeoutString = message.getHeaderByKey(MessageHeaderKeys.IS_SAGA_TIMEOUT, "false");
            const isTimeout = isTimeoutString === "true";
            if (isTimeout) {
                arrow.type = ArrowType.Timeout;
            } else if (message.receivingEndpoint === message.sendingEndpoint) {
                arrow.type = ArrowType.Local;
            } else {
                arrow.type = ArrowType.Command;
            }
        }

        return arrow;
    }

    #createMessageTrees(messages: Message[]) {
        const nodes = messages.map(message => new MessageTreeNode(message));
        const resolved: MessageTreeNode[] = [];
        const index = nodes.map(node => node.Id).reduce((acc, id, i) => acc.set(id, i), new Map<string, number>());

        for (const node of nodes) {
            if (node.parent) {
                const parent = index[node.parent];
                if (parent) {
                    parent.addChild(node);
                    resolved.push(node);
                }
            }
        }

        return nodes.filter(node => resolved.indexOf(node) === -1);
    }

    #createProcessingEndpoint(message: Message) {
        return new EndpointItem(message.receivingEndpoint.name, message.receivingEndpoint.host, message.receivingEndpoint.hostId, message.sendingEndpoint === message.receivingEndpoint ? message.getHeaderByKey(MessageHeaderKeys.VERSION) : undefined);
    }

    #createSendingEndpoint(message: Message) {
        if (!message.sendingEndpoint) {
            throw new Error("Sending endpoint is undefined.");
        }
        return new EndpointItem(message.sendingEndpoint.name, message.sendingEndpoint.host, message.sendingEndpoint.hostId, message.getHeaderByKey(MessageHeaderKeys.VERSION));
    }

    #createSendingHandler(message: Message, endpoint: EndpointItem) {
        const handler = new Handler(message.getHeaderByKey(MessageHeaderKeys.RELATED_TO, this.#conversationStartHandlerName));
        handler.endpoint = endpoint;
        handler.state = HandlerState.Success;

        return handler;
    }

    #createProcessingHandler(message: Message, endpoint: EndpointItem) {
        const handler = new Handler(message.messageId);
        handler.endpoint = endpoint;

        this.#updateProcessingHandler(message, handler);

        return handler;
    }

    #updateProcessingHandler(message: Message, handler: Handler) {
        handler.processedAt = message.processedAt;
        handler.processingTime = message.processingTime;
        handler.name = TypeHumanizer.toName(message.messageType);
    }
}

class MessageTreeNode {
    #message: Message;
    #parent: string | null;
    #children: MessageTreeNode[] = [];

    constructor(message: Message) {
        this.#message = message;
        this.#parent = this.#getParent(message);
    }

    get Id() {
        return this.#message.messageId;
    }

    get parent() {
        return this.#parent;
    }

    get message() {
        return this.#message;
    }

    get children() {
        return this.#children;
    }

    addChild(childNode: MessageTreeNode) {
        this.#children.push(childNode);
    }

    *walk(): Generator<Message> {
        yield this.message;

        for (const child of this.#children.sort(child => child.message.processedAt?.getTime() ?? 0)) {
            yield* child.walk();
        }
    }

    #getParent(message: Message) {
        return message.getHeaderByKey(MessageHeaderKeys.RELATED_TO);
    }
};


class HandlerRegistry {
    #handlers: { [key: string]: Handler };

    constructor() {
        this.#handlers = {};
    }

    tryRegisterHandler(handler: Handler) {
        const key = `${handler.id}_${handler.endpoint}`;
        if (!this.#handlers[key]) {
            this.#handlers[key] = handler;
            return { isNew: true, handler: handler };
        }
        return { isNew: false, handler: this.#handlers[key] };
    }
}

export default ModelCreator;
