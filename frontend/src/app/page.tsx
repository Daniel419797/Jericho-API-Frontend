'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Flex,
  Badge,
  useColorModeValue,
  Stack,
  Circle,
  Divider,
} from '@chakra-ui/react';
import Link from 'next/link';
import useAuthStore from '@/stores/authStore';
import {
  FiShield,
  FiZap,
  FiDatabase,
  FiUsers,
  FiLock,
  FiCloud,
  FiCode,
  FiTrendingUp,
  FiCheckCircle,
  FiArrowRight,
} from 'react-icons/fi';
import { ColorModeToggle } from '@/components/ColorModeToggle';

const features = [
  {
    icon: FiShield,
    title: 'Multi-Tenant Architecture',
    description: 'Secure isolated environments for each project with complete data separation.',
  },
  {
    icon: FiZap,
    title: 'Lightning Fast',
    description: 'Optimized performance with edge caching and serverless infrastructure.',
  },
  {
    icon: FiDatabase,
    title: 'Flexible Database Support',
    description: 'Connect PostgreSQL, MySQL, MongoDB, or Supabase with zero configuration.',
  },
  {
    icon: FiUsers,
    title: 'Role-Based Access',
    description: 'Fine-grained permissions and role management out of the box.',
  },
  {
    icon: FiLock,
    title: 'Enterprise Security',
    description: 'End-to-end encryption, audit logs, and compliance-ready infrastructure.',
  },
  {
    icon: FiCloud,
    title: 'Modular Design',
    description: 'Enable only the modules you need: messaging, files, attendance, and more.',
  },
];

const stats = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<50ms', label: 'API Latency' },
  { value: '10K+', label: 'API Requests/sec' },
  { value: '256-bit', label: 'Encryption' },
];

const modules = [
  'Authentication',
  'Roles & Permissions',
  'File Storage',
  'Messaging',
  'Notifications',
  'Attendance',
  'Payments',
  'Schemas',
];

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const heroBg = useColorModeValue(
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
  );
  const heroOverlay = useColorModeValue(
    'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(247,250,252,1) 100%)',
    'linear-gradient(180deg, rgba(10,11,15,0) 0%, rgba(10,11,15,1) 100%)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const subtleColor = useColorModeValue('gray.500', 'gray.500');
  const accentBg = useColorModeValue('brand.50', 'brand.900');
  const footerBg = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box minH="100vh">
      {/* Navigation */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={100}
        bg={useColorModeValue('whiteAlpha.900', 'blackAlpha.800')}
        backdropFilter="blur(10px)"
        borderBottom="1px"
        borderColor={borderColor}
      >
        <Container maxW="container.xl">
          <Flex h={16} align="center" justify="space-between">
            <HStack spacing={2}>
              <Box
                w={8}
                h={8}
                bg="brand.500"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiCode} color="white" boxSize={5} />
              </Box>
              <Heading size="md" fontWeight="bold">
                Jericho
              </Heading>
            </HStack>

            <HStack spacing={4}>
              <ColorModeToggle />
              {!isAuthenticated ? (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button colorScheme="brand" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/dashboard">
                  <Button colorScheme="brand" size="sm" rightIcon={<FiArrowRight />}>
                    Dashboard
                  </Button>
                </Link>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        position="relative"
        pt={32}
        pb={20}
        bg={heroBg}
        overflow="hidden"
      >
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="40%"
          bgGradient={heroOverlay}
        />
        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={8} textAlign="center" maxW="3xl" mx="auto">
            <Badge
              colorScheme="brand"
              px={4}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="medium"
            >
              Open Source Backend-as-a-Service
            </Badge>

            <Heading
              as="h1"
              size="3xl"
              fontWeight="extrabold"
              lineHeight="shorter"
              color="white"
              _dark={{ color: 'white' }}
            >
              Build Scalable Apps{' '}
              <Text as="span" color={useColorModeValue('yellow.300', 'brand.300')}>
                Without the Backend Hassle
              </Text>
            </Heading>

            <Text
              fontSize="xl"
              color={useColorModeValue('whiteAlpha.900', 'gray.300')}
              maxW="2xl"
            >
              Jericho API provides a complete, production-ready backend infrastructure with
              authentication, multi-tenancy, file storage, real-time messaging, and more.
              Focus on your product, not your infrastructure.
            </Text>

            <Stack
              direction={{ base: 'column', sm: 'row' }}
              spacing={4}
              pt={4}
            >
              {!isAuthenticated ? (
                <>
                  <Link href="/auth/register">
                    <Button
                      size="lg"
                      colorScheme="brand"
                      rightIcon={<FiArrowRight />}
                      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                      transition="all 0.2s"
                    >
                      Start Building Free
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button
                      size="lg"
                      variant="outline"
                      color="white"
                      borderColor="whiteAlpha.400"
                      _hover={{ bg: 'whiteAlpha.200' }}
                    >
                      View Documentation
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    colorScheme="brand"
                    rightIcon={<FiArrowRight />}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.2s"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              )}
            </Stack>
          </VStack>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxW="container.xl" mt={-10} position="relative" zIndex={10}>
        <Box
          bg={cardBg}
          borderRadius="2xl"
          boxShadow="xl"
          border="1px"
          borderColor={borderColor}
          p={8}
        >
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
            {stats.map((stat) => (
              <VStack key={stat.label} spacing={1}>
                <Text
                  fontSize="3xl"
                  fontWeight="bold"
                  bgGradient="linear(to-r, brand.500, brand.700)"
                  bgClip="text"
                >
                  {stat.value}
                </Text>
                <Text color={mutedColor} fontSize="sm" fontWeight="medium">
                  {stat.label}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxW="container.xl" py={20}>
        <VStack spacing={4} textAlign="center" mb={16}>
          <Badge colorScheme="brand" px={3} py={1} borderRadius="full">
            Features
          </Badge>
          <Heading size="xl">Everything You Need to Ship Fast</Heading>
          <Text color={mutedColor} maxW="2xl" fontSize="lg">
            A complete backend solution with all the features you need to build and scale
            modern applications.
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {features.map((feature) => (
            <Box
              key={feature.title}
              bg={cardBg}
              p={8}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: 'lg',
                borderColor: 'brand.500',
              }}
              transition="all 0.3s"
            >
              <Circle size={12} bg={accentBg} mb={4}>
                <Icon as={feature.icon} boxSize={6} color="brand.500" />
              </Circle>
              <Heading size="md" mb={2}>
                {feature.title}
              </Heading>
              <Text color={mutedColor}>{feature.description}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>

      {/* Modules Section */}
      <Box bg={footerBg} py={20}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={16} alignItems="center">
            <VStack align="start" spacing={6}>
              <Badge colorScheme="brand" px={3} py={1} borderRadius="full">
                Modular Architecture
              </Badge>
              <Heading size="xl">
                Enable Only What You Need
              </Heading>
              <Text color={mutedColor} fontSize="lg">
                Jericho&apos;s modular design lets you enable or disable features per project.
                Start minimal and scale as your needs grow.
              </Text>
              <Stack spacing={3} pt={4}>
                {modules.slice(0, 4).map((module) => (
                  <HStack key={module}>
                    <Icon as={FiCheckCircle} color="green.500" />
                    <Text fontWeight="medium">{module}</Text>
                  </HStack>
                ))}
              </Stack>
            </VStack>

            <SimpleGrid columns={2} spacing={4}>
              {modules.map((module) => (
                <Box
                  key={module}
                  bg={cardBg}
                  p={5}
                  borderRadius="lg"
                  border="1px"
                  borderColor={borderColor}
                  textAlign="center"
                  _hover={{ borderColor: 'brand.500' }}
                  transition="all 0.2s"
                >
                  <Text fontWeight="semibold">{module}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20}>
        <Container maxW="container.md">
          <Box
            bg={heroBg}
            borderRadius="2xl"
            p={12}
            textAlign="center"
            position="relative"
            overflow="hidden"
          >
            <VStack spacing={6} position="relative" zIndex={1}>
              <Heading size="xl" color="white">
                Ready to Get Started?
              </Heading>
              <Text color="whiteAlpha.900" fontSize="lg" maxW="md">
                Join developers building the next generation of applications with Jericho API.
              </Text>
              {!isAuthenticated ? (
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    bg="white"
                    color="brand.600"
                    _hover={{ bg: 'gray.100', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    rightIcon={<FiArrowRight />}
                  >
                    Create Free Account
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    bg="white"
                    color="brand.600"
                    _hover={{ bg: 'gray.100', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    rightIcon={<FiArrowRight />}
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              )}
            </VStack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg={footerBg} py={12} borderTop="1px" borderColor={borderColor}>
        <Container maxW="container.xl">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            gap={4}
          >
            <HStack spacing={2}>
              <Box
                w={8}
                h={8}
                bg="brand.500"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiCode} color="white" boxSize={5} />
              </Box>
              <Text fontWeight="bold">Jericho API</Text>
            </HStack>

            <Text color={subtleColor} fontSize="sm">
              © {new Date().getFullYear()} Jericho API. Open source under MIT License.
            </Text>

            <HStack spacing={6}>
              <Text
                as="a"
                href="#"
                color={subtleColor}
                fontSize="sm"
                _hover={{ color: 'brand.500' }}
              >
                Documentation
              </Text>
              <Text
                as="a"
                href="#"
                color={subtleColor}
                fontSize="sm"
                _hover={{ color: 'brand.500' }}
              >
                GitHub
              </Text>
              <Text
                as="a"
                href="#"
                color={subtleColor}
                fontSize="sm"
                _hover={{ color: 'brand.500' }}
              >
                Support
              </Text>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
