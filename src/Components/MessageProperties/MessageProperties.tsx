import React from 'react';
import { Card, Row, Col, Stack } from 'react-bootstrap';
import Message from '../../Models/Message';
import TypeHumanizer from '../../Utils/TypeHumanizer';

interface MessagePropertiesProps {
    message: Message;
}

interface Property {
    name: string;
    value: string;
}

interface Section {
    name: string;
    properties: Property[];
}

const MessageProperties: React.FC<MessagePropertiesProps> = ({ message }) => {
    console.log('MessageProperties headers', message.headers.getAllKeys());

    const parseDate = (dateStr: string | undefined) => {
        if (!dateStr) return '';
        try {
            // Convert "2025-03-14 09:32:52:777899 Z" to "2025-03-14T09:32:52.777Z"
            const formattedStr = dateStr
                .replace(' ', 'T')
                .replace(/:\d{6}\s*Z/, '.000Z');
            return new Date(formattedStr).toLocaleString();
        } catch {
            return '';
        }
    };

    const sections: Section[] = [
        {
            name: 'General',
            properties: [
                { name: 'Version', value: message.headers.version },
                { name: 'Enclosed Message Types', value: message.headers.enclosedMessageTypes },
                { name: 'Message ID', value: message.messageId },
                { name: 'Related To', value: message.headers.relatedTo },
                { name: 'Content Type', value: message.headers.contentType },
                { name: 'Is Deferred Message', value: message.headers.isDeferredMessage },
                { name: 'Conversation ID', value: message.headers.conversationId },
            ]
        },
        {
            name: 'Performance',
            properties: [
                { name: 'Time Sent', value: message.timeSent?.toLocaleString() },
                { name: 'Processing Started', value: parseDate(message.headers.processingStarted) },
                { name: 'Processing Ended', value: parseDate(message.headers.processingEnded) },
                { name: 'Processing Time', value: TypeHumanizer.formatProcessingTime(message.processingTime) },
            ]
        },
        {
            name: 'Errors',
            properties: [
                {name: 'Exception Info', value: message.headers.exceptionInfo.stackTrace},
                {name: 'Failed Queue', value: message.headers.failedQueue},
                {name: 'Time of Failure', value: message.headers.timeOfFailure},
            ]
        },
        // {
        //     name: 'Gateway',
        //     properties: []
        // },
        // {
        //     name: 'Saga',
        //     properties: []
        // }
    ];
    return (
        <Row>
            {sections.map((section, index) => (
                <Col xs={12} md={6} key={index}>
                    <Card className="mb-4">
                        <Card.Header as="h5">{section.name}</Card.Header>
                        <Card.Body>
                            {section.properties
                                .filter(prop => prop.value != null && prop.value !== '')
                                .map((property, index) => (
                                    <Stack direction="horizontal" gap={3} key={index}>
                                        <div className="text-muted me-2">{property.name}:</div>
                                        <div className="text-break ms-auto">{property.value}</div>
                                    </Stack>
                                ))}
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default MessageProperties;