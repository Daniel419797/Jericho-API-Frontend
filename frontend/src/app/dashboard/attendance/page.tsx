'use client';

import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Flex,
    Card,
    CardBody,
    Badge,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useColorModeValue,
    Icon,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    SimpleGrid,
    Avatar,
    Select,
} from '@chakra-ui/react';
import { FiCalendar, FiClock, FiUsers, FiDownload, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useState } from 'react';
import { formatDate } from '@/utils/date-utils';
import AttendanceTable from '../components/AttendanceTable';
import { useQuery } from '@tanstack/react-query';
import { attendanceService, AttendanceRecord } from '@/services/attendanceService';
import { Center, Spinner, Alert, AlertIcon } from '@chakra-ui/react';

export default function AttendancePage() {
    const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
    const mutedColor = useColorModeValue('gray.500', 'gray.400');

    const { data: records, isLoading, error } = useQuery<AttendanceRecord[]>({
        queryKey: ['attendance', selectedDate],
        queryFn: () => attendanceService.getAttendance(selectedDate),
    });

    const presentCount = Array.isArray(records) ? records.filter((a: AttendanceRecord) => a.status === 'present').length : 0;
    const totalHours = Array.isArray(records) ? records.reduce((sum: number, a: AttendanceRecord) => sum + (a.hoursWorked || 0), 0) : 0;

    return (
        <Box>
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
                <Box>
                    <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mb={2}>Attendance</Heading>
                    <Text color={mutedColor} fontSize={{ base: 'sm', md: 'md' }}>Track and manage employee attendance</Text>
                </Box>
                <Flex direction={{ base: 'column', sm: 'row' }} gap={3}>
                    <Select defaultValue={selectedDate} w={{ base: 'full', sm: '200px' }}>
                        <option value={selectedDate}>Today</option>
                    </Select>
                    <Button leftIcon={<FiDownload />} variant="outline" w={{ base: 'full', sm: 'auto' }}>Export Report</Button>
                </Flex>
            </Flex>

            {isLoading && (<Center py={20}><Spinner size="xl" /></Center>)}
            {error && (<Alert status="error"><AlertIcon />Failed to load attendance.</Alert>)}

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
                <Card>
                    <CardBody>
                        <HStack spacing={4}>
                            <Box p={3} borderRadius="lg" bg="green.50" _dark={{ bg: 'rgba(72, 187, 120, 0.15)' }}>
                                <FiUsers />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text color={mutedColor} fontSize="sm">Present Today</Text>
                                <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">{presentCount}/{Array.isArray(records) ? records.length : 0}</Text>
                            </VStack>
                        </HStack>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <HStack spacing={4}>
                            <Box p={3} borderRadius="lg" bg="blue.50" _dark={{ bg: 'rgba(33, 150, 243, 0.15)' }}>
                                <FiClock />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text color={mutedColor} fontSize="sm">Total Hours</Text>
                                <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">{totalHours.toFixed(1)}h</Text>
                            </VStack>
                        </HStack>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <HStack spacing={4}>
                            <Box p={3} borderRadius="lg" bg="orange.50" _dark={{ bg: 'rgba(237, 137, 54, 0.15)' }}>
                                <FiCalendar />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text color={mutedColor} fontSize="sm">Late Arrivals</Text>
                                <Text fontSize="2xl">{Array.isArray(records) ? records.filter((a: any) => a.status === 'late').length : 0}</Text>
                            </VStack>
                        </HStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {Array.isArray(records) && (
                <Card>
                    <CardBody p={0}>
                        <Box p={4} borderBottom="1px" borderColor="gray.100"><Heading size="md">Today's Attendance</Heading></Box>
                        <AttendanceTable records={records} />
                    </CardBody>
                </Card>
            )}
        </Box>
    );
}