'use client';

import { Table, Thead, Tbody, Tr, Th, Td, HStack, Avatar, Text, Badge, Box } from '@chakra-ui/react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { formatDate } from '@/utils/date-utils';

interface AttendanceRecord {
    id: string;
    userId: string;
    userName?: string;
    date: string;
    checkIn?: string | null;
    checkOut?: string | null;
    status: string;
    hoursWorked?: number;
}

export default function AttendanceTable({ records }: { records: AttendanceRecord[] }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present':
                return 'green';
            case 'absent':
                return 'red';
            case 'late':
                return 'orange';
            default:
                return 'gray';
        }
    };

    return (
        <Box overflowX="auto">
        <Table size={{ base: 'sm', md: 'md' }} minW="600px">
            <Thead>
                <Tr>
                    <Th>Employee</Th>
                    <Th>Check In</Th>
                    <Th>Check Out</Th>
                    <Th>Hours</Th>
                    <Th>Status</Th>
                </Tr>
            </Thead>
            <Tbody>
                {records.map((record) => (
                    <Tr key={record.id}>
                        <Td>
                            <HStack spacing={3}>
                                <Avatar size="sm" name={record.userName || 'User'} bg="brand.500" />
                                <Text fontWeight="medium">{record.userName || 'Unknown'}</Text>
                            </HStack>
                        </Td>
                        <Td>
                            <HStack spacing={2}>
                                <Text>{record.checkIn || '-'}</Text>
                            </HStack>
                        </Td>
                        <Td>
                            <HStack spacing={2}>
                                <Text>{record.checkOut || '-'}</Text>
                            </HStack>
                        </Td>
                        <Td>
                            <Text fontWeight="medium">{(record.hoursWorked ?? 0) > 0 ? `${record.hoursWorked}h` : '-'}</Text>
                        </Td>
                        <Td>
                            <Badge colorScheme={getStatusColor(record.status)} variant="subtle">{record.status}</Badge>
                        </Td>
                    </Tr>
                ))}
            </Tbody>
        </Table>
        </Box>
    );
}
