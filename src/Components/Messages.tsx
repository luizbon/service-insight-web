import React, { useEffect, useState } from "react";
import humanizeDuration from "humanize-duration";
import { Stack, Table } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import ServiceControl from "../Utils/ServiceControl";
import { MdOutlineCancel } from "react-icons/md";
import Endpoint from "../Sdk/Endpoint";
import Message from "../Sdk/Message";

interface MessagesProps {
    connection: any;
    endpoint: Endpoint | undefined;
    setMessages: (messages: Message[]) => void;
    messages: Message[];
    setMessage: (message: Message) => void;
}

const Messages: React.FC<MessagesProps> = ({ connection, endpoint, setMessages, messages, setMessage }) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [totalCount, setTotalCount] = useState<number>(-1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const messagesPerPage = 10;

    useEffect(() => {
        if (!connection) {
            setTotalCount(-1);
            setMessages([]);
            return;
        }
        fetchMessages();
    }, [connection, endpoint, currentPage]);

    const fetchMessages = (q?: string) => {
        const serviceControl = new ServiceControl(connection);
        serviceControl.getAuditMessages(endpoint?.name, currentPage, q, "time_sent", false, messagesPerPage)
            .then(data => {
                setMessages(data.messages);
                setTotalCount(data.totalCount);
            })
            .catch(error => console.error('Error fetching messages:', error));
    };

    const executeSearch = () => {
        return fetchMessages(searchTerm);
    };

    const formatProcessingTime = (time: string) => {
        const date = new Date(`1970-01-01T${time}Z`);
        const milliseconds = date.getTime();
        return humanizeDuration(milliseconds, { units: ["h", "m", "s", "ms"], round: true });
    };

    const totalPages = Math.ceil(totalCount / messagesPerPage);

    return (
        <>
            <h3>Messages
                {endpoint && ` (${endpoint.name})`}
            </h3>
            {totalCount >= 0 &&
                <div>
                    <Stack direction="horizontal" gap={3} className="justify-content-end">
                        <div>
                            <span>{totalCount} messages</span>
                        </div>
                        <div className="pagination-controls">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="btn btn-primary"
                            >
                                Previous
                            </button>
                            <span className="mx-2">Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="btn btn-primary"
                            >
                                Next
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
                            />
                            <button className="btn btn-outline-secondary" type="button" onClick={() => executeSearch()}>
                                <FaSearch />
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => {
                                    setSearchTerm("");
                                    setCurrentPage(1); // Reset to the first page
                                    fetchMessages(); // Directly call fetchMessages to ensure search is executed
                                }}
                            >
                                <MdOutlineCancel />
                            </button>
                        </div>
                    </Stack>
                    <Table size="sm" hover>
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Message ID</th>
                                <th>Message Type</th>
                                <th>Time Sent</th>
                                <th>Processing Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map((message, index) => (
                                <tr
                                    key={index}
                                    onClick={() => {
                                        setMessage(message);
                                        setSelectedMessageId(message.message_id);
                                    }}
                                    className={selectedMessageId === message.message_id ? "table-active" : ""}
                                    style={{ cursor: "pointer" }}
                                >
                                    <td>{message.status}</td>
                                    <td>{message.message_id}</td>
                                    <td>{message.message_type?.split('.').pop()}</td>
                                    <td>{new Date(message.time_sent).toLocaleString()}</td>
                                    <td>{formatProcessingTime(message.processing_time)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            }
        </>
    );
}

export default Messages;
