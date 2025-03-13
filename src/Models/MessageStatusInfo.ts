import Message from "./Message";
import MessageStatus from "./MessageStatus";

class MessageStatusInfo {
    hasWarn: boolean;
    status: MessageStatus;
    description: string;
    image: string;

    constructor(message: Message) {
        this.hasWarn = this.#warn(message);
        this.status = message.status;
        this.description = MessageStatus.getDescription(this.status);
        this.image = this.#getImage();
    }

    #warn(message: Message): boolean {
        return message.processingTime < 0 ||
            message.criticalTime < 0 ||
            message.deliveryTime < 0;
    }

    #getImage(): string {
        const currentStatus = this.status || MessageStatus.Successful;
        const imageName = `MessageStatus_${currentStatus}`;

        if(this.hasWarn || currentStatus === MessageStatus.ResolvedSuccessfully) {
            return `${imageName}_Warn`;
        }

        return imageName;
    }
}

export default MessageStatusInfo;