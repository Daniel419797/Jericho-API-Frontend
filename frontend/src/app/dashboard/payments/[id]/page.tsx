'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { paymentService, Payment } from '@/services/paymentService';
import { Box, Heading, Text, Spinner, Center, Alert, AlertIcon, VStack } from '@chakra-ui/react';
import { formatDate } from '@/utils/date-utils';

export default function PaymentDetailPage() {
    const params = useParams() as { id?: string };
    const id = params?.id;

    const { data: payment, isLoading, error } = useQuery<Payment>({
        queryKey: ['payment', id],
        queryFn: () => paymentService.getPayment(id as string),
        enabled: !!id,
    });

    if (isLoading) return <Center py={20}><Spinner size="xl" /></Center>;
    if (error) return <Alert status="error"><AlertIcon />Failed to load payment.</Alert>;

    if (!payment) return <Center py={20}><Text>Payment not found.</Text></Center>;

    return (
        <Box>
            <Heading size="lg" mb={4}>Payment Details</Heading>
            <VStack align="start" spacing={2}>
                <Text><strong>Description:</strong> {payment.description || '-'}</Text>
                <Text><strong>Amount:</strong> ${payment.amount?.toFixed(2) ?? '-'}</Text>
                <Text><strong>Status:</strong> {payment.status}</Text>
                <Text><strong>Date:</strong> {payment.date ? formatDate(payment.date) : '-'}</Text>
                <Text><strong>Method:</strong> {payment.method || '-'}</Text>
            </VStack>
        </Box>
    );
}
