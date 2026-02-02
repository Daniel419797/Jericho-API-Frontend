'use client';

import { Table, Thead, Tbody, Tr, Th, Td, Badge, Text, HStack, Icon, Box } from '@chakra-ui/react';
import { FiDownload } from 'react-icons/fi';
import { formatDate } from '@/utils/date-utils';
import { Payment } from '@/services/paymentService';

export default function PaymentsTable({ payments }: { payments: Payment[] }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'green';
            case 'pending':
                return 'yellow';
            case 'failed':
                return 'red';
            default:
                return 'gray';
        }
    };

    return (
        <Box overflowX="auto">
        <Table size={{ base: 'sm', md: 'md' }} minW="600px">
            <Thead>
                <Tr>
                    <Th>Description</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th>Date</Th>
                    <Th>Method</Th>
                </Tr>
            </Thead>
            <Tbody>
                {payments.map((payment) => (
                    <Tr key={payment.id}>
                        <Td>
                            <Text fontWeight="medium">{payment.description || 'Payment'}</Text>
                        </Td>
                        <Td>
                            <Text fontWeight="semibold">${(payment.amount ?? 0).toFixed(2)}</Text>
                        </Td>
                        <Td>
                            <Badge colorScheme={getStatusColor(payment.status)} variant="subtle">
                                {payment.status}
                            </Badge>
                        </Td>
                        <Td>
                            <Text fontSize="sm" color="gray.500">{payment.date ? formatDate(payment.date) : '-'}</Text>
                        </Td>
                        <Td>
                            <Text fontSize="sm" color="gray.500">{payment.method || '-'}</Text>
                        </Td>
                    </Tr>
                ))}
            </Tbody>
        </Table>
        </Box>
    );
}
