class MessageHeaderKeys {
  static VERSION = "Version";
  static ENCLOSED_MESSAGE_TYPES = "EnclosedMessageTypes";
  static RETRIES = "Retries";
  static RELATED_TO = "RelatedTo";
  static CONTENT_TYPE = "ContentType";
  static IS_DEFERRED_MESSAGE = "IsDeferedMessage";
  static PROCESSING_ENDED = "ProcessingEnded";
  static PROCESSING_STARTED = "ProcessingStarted";
  static CONVERSATION_ID = "ConversationId";
  static CORRELATION_ID = "CorrelationId";
  static MESSAGE_ID = "MessageId";
  static EXCEPTION_TYPE = "ExceptionInfo.ExceptionType";
  static EXCEPTION_MESSAGE = "ExceptionInfo.Message";
  static EXCEPTION_SOURCE = "ExceptionInfo.Source";
  static EXCEPTION_STACK_TRACE = "ExceptionInfo.StackTrace";
  static FAILED_QUEUE = "FailedQ";
  static TIME_SENT = "TimeSent";
  static TIME_OF_FAILURE = "TimeOfFailure";
  static IS_SAGA_TIMEOUT = "IsSagaTimeoutMessage";
  static SAGA_ID = "SagaId";
  static ORIGINATED_SAGA_ID = "OriginatingSagaId";
  static SAGA_STATUS = "ServiceControl.SagaChangeStatus";
}

export default MessageHeaderKeys;
