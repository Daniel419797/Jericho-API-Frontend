 'use client';

import { Box, Heading, Text, VStack, HStack, Flex, Card, CardBody, Badge, Button, SimpleGrid, Spinner, Center, Alert, AlertIcon, useColorModeValue } from '@chakra-ui/react';
import { FiCreditCard, FiDollarSign, FiTrendingUp, FiDownload } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { paymentService, Payment } from '@/services/paymentService';
import PaymentsTable from '../components/PaymentsTable';
import { formatDate } from '@/utils/date-utils';

export default function PaymentsPage() {
    const { data: payments, isLoading, error } = useQuery<Payment[]>({
        queryKey: ['payments'],
        queryFn: () => paymentService.getPayments({ page: 1, limit: 50 }),
    });

    const mutedColor = useColorModeValue('gray.500', 'gray.400');

    const totalRevenue = Array.isArray(payments) ? payments.filter((p) => p.status === 'completed').reduce((sum: number, p) => sum + (p.amount || 0), 0) : 0;

    return (
        <Box>
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
                <Box>
                    <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mb={2}>
                        Payments
                    </Heading>
                    <Text color={mutedColor} fontSize={{ base: 'sm', md: 'md' }}>Billing history and payment management</Text>
                </Box>
                <Button leftIcon={<FiDownload />} variant="outline" w={{ base: 'full', md: 'auto' }}>
                    Export History
                </Button>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
                <Card borderWidth="1px">
                    <CardBody>
                        <HStack spacing={4}>
                            <Box p={3} borderRadius="lg" bg="green.50" _dark={{ bg: 'rgba(72, 187, 120, 0.15)' }}>
                                <FiDollarSign />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text color={mutedColor} fontSize="sm">Total Spent</Text>
                                <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">${totalRevenue.toFixed(2)}</Text>
                            </VStack>
                        </HStack>
                    </CardBody>
                </Card>
                <Card borderWidth="1px">
                    <CardBody>
                        <HStack spacing={4}>
                            <Box p={3} borderRadius="lg" bg="blue.50" _dark={{ bg: 'rgba(33, 150, 243, 0.15)' }}>
                                <FiCreditCard />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text color={mutedColor} fontSize="sm">Current Plan</Text>
                                <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">Enterprise</Text>
                            </VStack>
                        </HStack>
                    </CardBody>
                </Card>
                <Card borderWidth="1px">
                    <CardBody>
                        <HStack spacing={4}>
                            <Box p={3} borderRadius="lg" bg="purple.50" _dark={{ bg: 'rgba(159, 122, 234, 0.15)' }}>
                                <FiTrendingUp />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text color={mutedColor} fontSize="sm">Next Billing</Text>
                                <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">Feb 28</Text>
                            </VStack>
                        </HStack>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {isLoading && (
                <Center py={20}>
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                </Center>
            )}

            {error && (
                <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    <Text>Failed to load payments. {error instanceof Error ? error.message : 'Please try again.'}</Text>
                </Alert>
            )}

            {payments && Array.isArray(payments) && (
                <Card borderWidth="1px" overflowX="auto">
                    <CardBody p={0}>
                        <Box p={4} borderBottom="1px" borderColor="gray.100" _dark={{ borderColor: 'gray.700' }}>
                            <Heading size="md">Payment History</Heading>
                        </Box>
                        <PaymentsTable payments={payments} />
                    </CardBody>
                </Card>
            )}
        </Box>
    );
}