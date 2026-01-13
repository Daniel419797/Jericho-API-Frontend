'use client';

import { Container, Heading, Text, VStack, Box, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';

export default function AdminPage() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Admin Panel
          </Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }}>
            Manage users and roles
          </Text>
        </Box>

        <Tabs>
          <TabList>
            <Tab>Users</Tab>
            <Tab>Roles</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Text>User management will be implemented here.</Text>
            </TabPanel>
            <TabPanel>
              <Text>Role management will be implemented here.</Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
}
