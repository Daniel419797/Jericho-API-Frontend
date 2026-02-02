'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Button,
  HStack,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Center,
  Icon,
  Flex,
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, ArrowBackIcon } from '@chakra-ui/icons';
import {
  FiPackage,
  FiDownload,
  FiStar,
  FiCode,
  FiDatabase,
  FiShoppingCart,
  FiBookOpen,
  FiHeart,
  FiDollarSign,
  FiBarChart2,
  FiLink,
} from 'react-icons/fi';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketplaceService } from '@/services/marketplaceService';
import { MarketplaceApp, MARKETPLACE_CATEGORIES, MarketplaceCategory } from '@/types/marketplace';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const categoryIcons: Record<string, React.ElementType> = {
  general: FiPackage,
  ecommerce: FiShoppingCart,
  education: FiBookOpen,
  healthcare: FiHeart,
  finance: FiDollarSign,
  cms: FiCode,
  analytics: FiBarChart2,
  integrations: FiLink,
};

function getStatusColor(status?: string) {
  switch (status) {
    case 'approved':
      return 'green';
    case 'pending':
      return 'yellow';
    case 'rejected':
      return 'red';
    case 'archived':
      return 'gray';
    default:
      return 'gray';
  }
}

function getPricingLabel(app: MarketplaceApp): string {
  const pricing = app.manifest?.pricing;
  if (!pricing || pricing.model === 'free' || !pricing.price) {
    return 'Free';
  }
  const price = pricing.price / 100; // assuming cents
  const currency = pricing.currency || 'USD';
  return `$${price.toFixed(2)} ${currency}`;
}

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<MarketplaceCategory | ''>('');

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const accentBg = useColorModeValue('brand.50', 'brand.900');

  const { data: apps, isLoading, error } = useQuery<MarketplaceApp[]>({
    queryKey: ['marketplace-apps'],
    queryFn: () => marketplaceService.listApps(),
  });

  const filteredApps = useMemo(() => {
    if (!apps) return [];
    return apps.filter((app) => {
      const matchesSearch =
        !search ||
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.description?.toLowerCase().includes(search.toLowerCase()) ||
        app.manifest?.marketplace?.tags?.some((t) =>
          t.toLowerCase().includes(search.toLowerCase())
        );
      const matchesCategory =
        !category || app.manifest?.marketplace?.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [apps, search, category]);

  return (
    <ProtectedRoute>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'stretch', md: 'center' }}
            gap={4}
          >
            <HStack>
              <IconButton
                as={Link}
                href="/dashboard"
                aria-label="Back to dashboard"
                icon={<ArrowBackIcon />}
                variant="ghost"
                size="sm"
              />
              <Box>
                <Heading size="lg">Marketplace</Heading>
                <Text color={mutedColor}>
                  Discover and install modules to extend your projects
                </Text>
              </Box>
            </HStack>
            <Link href="/dashboard/marketplace/submit">
              <Button colorScheme="brand" leftIcon={<AddIcon />}>
                Submit App
              </Button>
            </Link>
          </Flex>

          {/* Filters */}
          <HStack spacing={4} flexWrap="wrap">
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search apps..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Select
              maxW="200px"
              placeholder="All Categories"
              value={category}
              onChange={(e) => setCategory(e.target.value as MarketplaceCategory | '')}
            >
              {MARKETPLACE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>
          </HStack>

          {/* Loading */}
          {isLoading && (
            <Center py={20}>
              <Spinner size="xl" />
            </Center>
          )}

          {/* Error */}
          {error && (
            <Center py={10}>
              <Text color="red.500">Failed to load apps. Please try again.</Text>
            </Center>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredApps.length === 0 && (
            <Center py={20}>
              <VStack spacing={4}>
                <Icon as={FiPackage} boxSize={16} color={mutedColor} />
                <Heading size="md" color={mutedColor}>
                  No apps found
                </Heading>
                <Text color={mutedColor}>
                  {search || category
                    ? 'Try adjusting your filters'
                    : 'Be the first to submit an app!'}
                </Text>
                <Link href="/dashboard/marketplace/submit">
                  <Button colorScheme="brand" leftIcon={<AddIcon />}>
                    Submit Your App
                  </Button>
                </Link>
              </VStack>
            </Center>
          )}

          {/* Apps Grid */}
          {!isLoading && !error && filteredApps.length > 0 && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredApps.map((app) => {
                const categoryValue = app.manifest?.marketplace?.category || 'general';
                const CategoryIcon = categoryIcons[categoryValue] || FiPackage;

                return (
                  <Link key={app.id} href={`/dashboard/marketplace/${app.id}`}>
                    <Card
                      bg={cardBg}
                      border="1px"
                      borderColor={borderColor}
                      _hover={{
                        transform: 'translateY(-4px)',
                        boxShadow: 'lg',
                        borderColor: 'brand.500',
                      }}
                      transition="all 0.2s"
                      cursor="pointer"
                      h="100%"
                    >
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <HStack justify="space-between">
                            <Box
                              p={3}
                              bg={accentBg}
                              borderRadius="lg"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Icon as={CategoryIcon} boxSize={6} color="brand.500" />
                            </Box>
                            <Badge colorScheme={getStatusColor(app.status)}>
                              {app.status}
                            </Badge>
                          </HStack>

                          <Box>
                            <Heading size="md" mb={1}>
                              {app.name}
                            </Heading>
                            <Text color={mutedColor} fontSize="sm" noOfLines={2}>
                              {app.description || app.manifest?.description || 'No description'}
                            </Text>
                          </Box>

                          <HStack flexWrap="wrap" gap={1}>
                            {app.manifest?.marketplace?.tags?.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="subtle"
                                colorScheme="gray"
                                fontSize="xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </HStack>

                          <HStack justify="space-between" pt={2}>
                            <Text fontWeight="bold" color="brand.500">
                              {getPricingLabel(app)}
                            </Text>
                            <HStack color={mutedColor} fontSize="sm">
                              <Icon as={FiDownload} />
                              <Text>v{app.manifest?.version || '1.0.0'}</Text>
                            </HStack>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  </Link>
                );
              })}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </ProtectedRoute>
  );
}
