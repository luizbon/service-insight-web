import Message from '../../Models/Message';
import ArrowType from './ArrowType';
import DiagramItem from './DiagramItem';
import Handler from './Handler';

class Arrow implements DiagramItem {
    #selectedMessage: Message;
    fromHandler: Handler | undefined;
    toHandler: Handler | undefined;
    arrowType: ArrowType | undefined;
    route: any;
    messageProcessingRoute: any;
    name: string | undefined;
    isFocused: boolean = false;
    type: ArrowType | undefined;

    constructor(message: Message) {
        this.#selectedMessage = message;
    }

    get selectedMessage(): Message {
        return this.#selectedMessage;
    }

    get messageId(): string {
        return this.#selectedMessage.messageId;
    }
}

export default Arrow;
