import { Table } from 'react-bootstrap';
import Message from '../../Models/Message';

interface DetailsProps {
    message: Message | undefined;
}

const MessageHeaders: React.FC<DetailsProps> = ({ message }) => {
    return (message && <Table striped bordered hover>
        <thead>
            <tr>
                <th>Header</th>
                <th>Value</th>
            </tr>
        </thead>
        <tbody>
            {message.headers.getAllKeys().map((key: string, index: number) => (
                <tr key={index}>
                    <td>{key}</td>
                    <td>{message.headers.getValue(key)}</td>
                </tr>
            ))}
        </tbody>
    </Table>)
};

export default MessageHeaders;