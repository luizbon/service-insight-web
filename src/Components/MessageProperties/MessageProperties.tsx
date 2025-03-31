import React from 'react';
import { Card, Row, Col, Table } from 'react-bootstrap';
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
                {name: 'Failed Queue', value: message.getHeaderByKey('failedQ')},
                {name: 'Exception Type', value: message.getHeaderByKey('exceptionInfo.exceptionType', '')},
                {name: 'Help Link', value: message.getHeaderByKey('exceptionInfo.helpLink', '')},
                {name: 'Message', value: message.getHeaderByKey('exceptionInfo.message', '')},
                {name: 'Source', value: message.getHeaderByKey('exceptionInfo.source', '')},
                {name: 'Stack Trace', value: message.getHeaderByKey('exceptionInfo.stackTrace', '')},
                {name: 'Time of Failure', value: message.headers.timeOfFailure}
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
            {sections
                .filter(section => section.properties.some(prop => prop.value != undefined && prop.value !== ''))
                .map((section, index) => (
                    <Col xs={12} md={6} key={index}>
                        <Card className="mb-4">
                            <Card.Header as="h5">{section.name}</Card.Header>
                            <Card.Body>
                                <Table striped hover size="sm">
                                    <tbody>
                                        {section.properties
                                            .filter(prop => prop.value != undefined && prop.value !== '')
                                            .map((property, index) => (
                                                <tr key={index}>
                                                    <td className="text-muted" style={{ width: '30%' }}>{property.name}:</td>
                                                    <td className="text-break">{property.value}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
        </Row>
    );
};

export default MessageProperties;