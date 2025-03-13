enum MessageStatus {
    Failed = "Failed",
    RepeatedFailure = "RepeatedFailure",
    Successful = "Successful",
    ResolvedSuccessfully = "ResolvedSuccessfully",
    ArchivedFailure = "ArchivedFailure",
    RetryIssued = "RetryIssued"
}

namespace MessageStatus {
    export function getDescription(status: MessageStatus): string {
        switch (status) {
            case MessageStatus.Failed:
                return "Failed";
            case MessageStatus.RepeatedFailure:
                return "Repeated failure";
            case MessageStatus.Successful:
                return "Successful";
            case MessageStatus.ResolvedSuccessfully:
                return "Successful after retries";
            case MessageStatus.ArchivedFailure:
                return "Failed message deleted";
            case MessageStatus.RetryIssued:
                return "Retry requested";
            default:
                return "Unknown status";
        }
    }
}

export default MessageStatus;