import React, { useEffect, useState } from "react";
import { Stack, Table, OverlayTrigger, Tooltip, Spinner } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import ServiceControl from "../Utils/ServiceControl";
import { MdOutlineCancel } from "react-icons/md";
import Endpoint from "../Sdk/Endpoint";
import Message from "../Models/Message";
import MessageStatusInfo from "../Models/MessageStatusInfo";

// Import all status icons
import MessageStatus_Archived_Warn from '../assets/MessageStatus_Archived_Warn.svg';
import MessageStatus_Archived from '../assets/MessageStatus_Archived.svg';
import MessageStatus_Failed_Warn from '../assets/MessageStatus_Failed_Warn.svg';
import MessageStatus_Failed from '../assets/MessageStatus_Failed.svg';
import MessageStatus_RepeatedFailed_Warn from '../assets/MessageStatus_RepeatedFailed_Warn.svg';
import MessageStatus_RepeatedFailed from '../assets/MessageStatus_RepeatedFailed.svg';
import MessageStatus_ResolvedSuccessfully_Warn from '../assets/MessageStatus_ResolvedSuccessfully_Warn.svg';
import MessageStatus_ResolvedSuccessfully from '../assets/MessageStatus_ResolvedSuccessfully.svg';
import MessageStatus_RetryIssued_Warn from '../assets/MessageStatus_RetryIssued_Warn.svg';
import MessageStatus_RetryIssued from '../assets/MessageStatus_RetryIssued.svg';
import MessageStatus_Successful_Warn from '../assets/MessageStatus_Successful_Warn.svg';
import MessageStatus_Successful from '../assets/MessageStatus_Successful.svg';
import TypeHumanizer from "../Utils/TypeHumanizer";

// Create a mapping of status to icons
const statusIcons: { [key: string]: string } = {
    'MessageStatus_ArchivedFailure_Warn': MessageStatus_Archived_Warn,
    'MessageStatus_ArchivedFailure': MessageStatus_Archived,
    'MessageStatus_Failed_Warn': MessageStatus_Failed_Warn,
    'MessageStatus_Failed': MessageStatus_Failed,
    'MessageStatus_RepeatedFailed_Warn': MessageStatus_RepeatedFailed_Warn,
    'MessageStatus_RepeatedFailed': MessageStatus_RepeatedFailed,
    'MessageStatus_ResolvedSuccessfully_Warn': MessageStatus_ResolvedSuccessfully_Warn,
    'MessageStatus_ResolvedSuccessfully': MessageStatus_ResolvedSuccessfully,
    'MessageStatus_RetryIssued_Warn': MessageStatus_RetryIssued_Warn,
    'MessageStatus_RetryIssued': MessageStatus_RetryIssued,
    'MessageStatus_Successful_Warn': MessageStatus_Successful_Warn,
    'MessageStatus_Successful': MessageStatus_Successful,
};

interface MessagesProps {
    connection: any;
    endpoint: Endpoint | undefined;
    setMessages: (messages: Message[]) => void;
    messages: Message[];
    setMessage: (message: Message | undefined) => void;
}

const Messages: React.FC<MessagesProps> = ({ connection, endpoint, setMessages, messages, setMessage }) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [totalCount, setTotalCount] = useState<number>(-1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedMessageId, setSelectedMessageId] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const messagesPerPage = 10;

    useEffect(() => {
        setMessage(undefined);
        setSelectedMessageId(undefined);
    }, [messages, setMessage]);

    useEffect(() => {
        if (!connection) {
            setTotalCount(-1);
            setMessages([]);
            setCurrentPage(1);
            return;
        }
        fetchMessages();
    }, [connection, endpoint, currentPage, searchTerm]);

    const fetchMessages = async () => {
        try {
            setIsLoading(true);
            const serviceControl = new ServiceControl(connection);
            const data = await serviceControl.getAuditMessages(
                endpoint?.endpoint_details?.name, 
                currentPage - 1, 
                searchTerm || undefined, 
                "time_sent", 
                false, 
                messagesPerPage
            );
            setMessages(data.messages);
            setTotalCount(data.totalCount);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    const executeSearch = () => {
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalCount / messagesPerPage);

    return (
        <>
            <h3 id="messages-heading">Messages
                {endpoint && ` (${endpoint.endpoint_details.name})`}
            </h3>
            {totalCount >= 0 &&
                <div>
                    <Stack direction="horizontal" gap={3} className="justify-content-end mb-3">
                        <div>
                            <span aria-live="polite">{totalCount} messages</span>
                        </div>
                        <div className="btn-group" role="navigation" aria-label="Messages pagination">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="btn btn-primary"
                            >
                                First
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="btn btn-primary"
                                aria-label="Previous page"
                            >
                                Previous
                            </button>
                            <button className="btn btn-secondary" disabled>
                                Page {currentPage} of {totalPages}
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="btn btn-primary"
                                aria-label="Next page"
                            >
                                Next
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="btn btn-primary"
                            >
                                Last
                            </button>
                        </div>

                        <div className="input-group w-25">
                            <input
                                type="text"
                                placeholder="Search messages"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        executeSearch();
                                    }
                                }}
                                className="form-control"
                                aria-label="Search messages"
                            />
                            <button className="btn btn-outline-secondary" type="button" onClick={executeSearch}>
                                <FaSearch />
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => {
                                    setSearchTerm("");
                                    setCurrentPage(1);
                                }}
                            >
                                <MdOutlineCancel />
                            </button>
                        </div>
                    </Stack>
                    {isLoading ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <Table size="sm" hover role="table" aria-label="Messages table">
                            <thead>
                                <tr>
                                    <th className="text-center">Status</th>
                                    <th>Message ID</th>
                                    <th>Message Type</th>
                                    <th>Time Sent</th>
                                    <th>Processing Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.map((message, index) => {
                                    const messageStatusInfo = new MessageStatusInfo(message);
                                    return (
                                    <tr
                                        key={index}
                                        onClick={() => {
                                            setMessage(message);
                                            setSelectedMessageId(message.messageId);
                                        }}
                                        className={selectedMessageId === message.messageId ? "table-active" : ""}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td className="text-center">
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={<Tooltip>{messageStatusInfo.description}</Tooltip>}
                                            >
                                                <img 
                                                    src={statusIcons[messageStatusInfo.image]} 
                                                    alt={messageStatusInfo.description}
                                                    width="16"
                                                    height="16"
                                                />
                                            </OverlayTrigger>
                                        </td>
                                        <td>{message.messageId}</td>
                                        <td>{message.messageType?.split('.').pop()}</td>
                                        <td>{message.timeSent?.toLocaleString()}</td>
                                        <td>{TypeHumanizer.formatProcessingTime(message.processingTime)}</td>
                                    </tr>
                                );
                                })}
                            </tbody>
                        </Table>
                    )}
                </div>
            }
        </>
    );
}

export default Messages;
