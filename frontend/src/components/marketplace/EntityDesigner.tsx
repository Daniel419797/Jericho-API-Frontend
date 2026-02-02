'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Input,
  Select,
  Checkbox,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Collapse,
  Badge,
  Divider,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { FiDatabase, FiLink } from 'react-icons/fi';
import { useState } from 'react';
import {
  MarketplaceEntity,
  MarketplaceEntityField,
  MarketplaceEntityRelationship,
  EntityFieldType,
} from '@/types/marketplace';

interface EntityDesignerProps {
  entities: MarketplaceEntity[];
  onChange: (entities: MarketplaceEntity[]) => void;
}

const FIELD_TYPES: { value: EntityFieldType; label: string }[] = [
  { value: 'string', label: 'String' },
  { value: 'text', label: 'Text (Long)' },
  { value: 'number', label: 'Number' },
  { value: 'integer', label: 'Integer' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'json', label: 'JSON' },
  { value: 'file', label: 'File' },
  { value: 'image', label: 'Image' },
  { value: 'enum', label: 'Enum (Options)' },
];

const RELATIONSHIP_TYPES = [
  { value: 'belongsTo', label: 'Belongs To (Many-to-One)' },
  { value: 'hasMany', label: 'Has Many (One-to-Many)' },
  { value: 'hasOne', label: 'Has One (One-to-One)' },
];

export function EntityDesigner({ entities, onChange }: EntityDesignerProps) {
  const [expandedEntities, setExpandedEntities] = useState<Set<number>>(new Set([0]));

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const fieldBg = useColorModeValue('gray.50', 'gray.700');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedEntities);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEntities(newExpanded);
  };

  const addEntity = () => {
    const newEntity: MarketplaceEntity = {
      name: `Entity${entities.length + 1}`,
      fields: [{ name: 'name', type: 'string', required: true }],
      relationships: [],
      permissions: {
        create: ['authenticated'],
        read: ['authenticated'],
        update: ['owner', 'admin'],
        delete: ['admin'],
      },
    };
    onChange([...entities, newEntity]);
    setExpandedEntities(new Set([...expandedEntities, entities.length]));
  };

  const removeEntity = (index: number) => {
    onChange(entities.filter((_, i) => i !== index));
  };

  const updateEntity = (index: number, updates: Partial<MarketplaceEntity>) => {
    const updated = [...entities];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const addField = (entityIndex: number) => {
    const entity = entities[entityIndex];
    const newField: MarketplaceEntityField = {
      name: `field${entity.fields.length + 1}`,
      type: 'string',
      required: false,
    };
    updateEntity(entityIndex, { fields: [...entity.fields, newField] });
  };

  const removeField = (entityIndex: number, fieldIndex: number) => {
    const entity = entities[entityIndex];
    updateEntity(entityIndex, {
      fields: entity.fields.filter((_, i) => i !== fieldIndex),
    });
  };

  const updateField = (
    entityIndex: number,
    fieldIndex: number,
    updates: Partial<MarketplaceEntityField>
  ) => {
    const entity = entities[entityIndex];
    const fields = [...entity.fields];
    fields[fieldIndex] = { ...fields[fieldIndex], ...updates };
    updateEntity(entityIndex, { fields });
  };

  const addRelationship = (entityIndex: number) => {
    const entity = entities[entityIndex];
    const otherEntities = entities.filter((_, i) => i !== entityIndex);
    const newRel: MarketplaceEntityRelationship = {
      type: 'belongsTo',
      entity: otherEntities[0]?.name || 'Entity',
      foreignKey: `${(otherEntities[0]?.name || 'entity').toLowerCase()}Id`,
    };
    updateEntity(entityIndex, {
      relationships: [...(entity.relationships || []), newRel],
    });
  };

  const removeRelationship = (entityIndex: number, relIndex: number) => {
    const entity = entities[entityIndex];
    updateEntity(entityIndex, {
      relationships: (entity.relationships || []).filter((_, i) => i !== relIndex),
    });
  };

  const updateRelationship = (
    entityIndex: number,
    relIndex: number,
    updates: Partial<MarketplaceEntityRelationship>
  ) => {
    const entity = entities[entityIndex];
    const relationships = [...(entity.relationships || [])];
    relationships[relIndex] = { ...relationships[relIndex], ...updates };
    updateEntity(entityIndex, { relationships });
  };

  return (
    <VStack spacing={4} align="stretch">
      {entities.map((entity, entityIndex) => (
        <Card
          key={entityIndex}
          bg={cardBg}
          border="1px"
          borderColor={borderColor}
          overflow="hidden"
        >
          {/* Entity Header */}
          <HStack
            p={4}
            cursor="pointer"
            onClick={() => toggleExpand(entityIndex)}
            justify="space-between"
            _hover={{ bg: fieldBg }}
          >
            <HStack>
              <FiDatabase />
              <Input
                value={entity.name}
                onChange={(e) => {
                  e.stopPropagation();
                  updateEntity(entityIndex, { name: e.target.value });
                }}
                onClick={(e) => e.stopPropagation()}
                fontWeight="bold"
                variant="unstyled"
                maxW="200px"
              />
              <Badge colorScheme="brand">{entity.fields.length} fields</Badge>
              {entity.relationships && entity.relationships.length > 0 && (
                <Badge colorScheme="purple">{entity.relationships.length} relations</Badge>
              )}
            </HStack>
            <HStack>
              <IconButton
                aria-label="Delete entity"
                icon={<DeleteIcon />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={(e) => {
                  e.stopPropagation();
                  removeEntity(entityIndex);
                }}
              />
              {expandedEntities.has(entityIndex) ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </HStack>
          </HStack>

          {/* Entity Content */}
          <Collapse in={expandedEntities.has(entityIndex)} animateOpacity>
            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                {/* Fields */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium" fontSize="sm">
                      Fields
                    </Text>
                    <Button size="xs" leftIcon={<AddIcon />} onClick={() => addField(entityIndex)}>
                      Add Field
                    </Button>
                  </HStack>

                  <VStack spacing={2} align="stretch">
                    {entity.fields.map((field, fieldIndex) => (
                      <Box
                        key={fieldIndex}
                        p={3}
                        bg={fieldBg}
                        borderRadius="md"
                        border="1px"
                        borderColor={borderColor}
                      >
                        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={2} alignItems="end">
                          <FormControl size="sm">
                            <FormLabel fontSize="xs">Name</FormLabel>
                            <Input
                              size="sm"
                              value={field.name}
                              onChange={(e) =>
                                updateField(entityIndex, fieldIndex, { name: e.target.value })
                              }
                              placeholder="fieldName"
                            />
                          </FormControl>

                          <FormControl size="sm">
                            <FormLabel fontSize="xs">Type</FormLabel>
                            <Select
                              size="sm"
                              value={field.type}
                              onChange={(e) =>
                                updateField(entityIndex, fieldIndex, {
                                  type: e.target.value as EntityFieldType,
                                })
                              }
                            >
                              {FIELD_TYPES.map((ft) => (
                                <option key={ft.value} value={ft.value}>
                                  {ft.label}
                                </option>
                              ))}
                            </Select>
                          </FormControl>

                          <HStack spacing={4}>
                            <Checkbox
                              size="sm"
                              isChecked={field.required}
                              onChange={(e) =>
                                updateField(entityIndex, fieldIndex, { required: e.target.checked })
                              }
                            >
                              <Text fontSize="xs">Required</Text>
                            </Checkbox>
                            <Checkbox
                              size="sm"
                              isChecked={field.unique}
                              onChange={(e) =>
                                updateField(entityIndex, fieldIndex, { unique: e.target.checked })
                              }
                            >
                              <Text fontSize="xs">Unique</Text>
                            </Checkbox>
                          </HStack>

                          <IconButton
                            aria-label="Remove field"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => removeField(entityIndex, fieldIndex)}
                            isDisabled={entity.fields.length <= 1}
                          />
                        </SimpleGrid>

                        {/* Additional constraints based on type */}
                        {(field.type === 'string' || field.type === 'text') && (
                          <HStack mt={2} spacing={2}>
                            <FormControl size="sm" maxW="100px">
                              <FormLabel fontSize="xs">Min Length</FormLabel>
                              <Input
                                size="sm"
                                type="number"
                                value={field.minLength || ''}
                                onChange={(e) =>
                                  updateField(entityIndex, fieldIndex, {
                                    minLength: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                              />
                            </FormControl>
                            <FormControl size="sm" maxW="100px">
                              <FormLabel fontSize="xs">Max Length</FormLabel>
                              <Input
                                size="sm"
                                type="number"
                                value={field.maxLength || ''}
                                onChange={(e) =>
                                  updateField(entityIndex, fieldIndex, {
                                    maxLength: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                              />
                            </FormControl>
                          </HStack>
                        )}

                        {(field.type === 'number' || field.type === 'integer') && (
                          <HStack mt={2} spacing={2}>
                            <FormControl size="sm" maxW="100px">
                              <FormLabel fontSize="xs">Min</FormLabel>
                              <Input
                                size="sm"
                                type="number"
                                value={field.min ?? ''}
                                onChange={(e) =>
                                  updateField(entityIndex, fieldIndex, {
                                    min: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                              />
                            </FormControl>
                            <FormControl size="sm" maxW="100px">
                              <FormLabel fontSize="xs">Max</FormLabel>
                              <Input
                                size="sm"
                                type="number"
                                value={field.max ?? ''}
                                onChange={(e) =>
                                  updateField(entityIndex, fieldIndex, {
                                    max: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                              />
                            </FormControl>
                          </HStack>
                        )}

                        {field.type === 'enum' && (
                          <FormControl size="sm" mt={2}>
                            <FormLabel fontSize="xs">Options (comma-separated)</FormLabel>
                            <Input
                              size="sm"
                              value={field.enum?.join(', ') || ''}
                              onChange={(e) =>
                                updateField(entityIndex, fieldIndex, {
                                  enum: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                                })
                              }
                              placeholder="option1, option2, option3"
                            />
                          </FormControl>
                        )}
                      </Box>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                {/* Relationships */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <FiLink />
                      <Text fontWeight="medium" fontSize="sm">
                        Relationships
                      </Text>
                    </HStack>
                    <Button
                      size="xs"
                      leftIcon={<AddIcon />}
                      onClick={() => addRelationship(entityIndex)}
                      isDisabled={entities.length < 2}
                    >
                      Add Relationship
                    </Button>
                  </HStack>

                  {entities.length < 2 && (
                    <Text fontSize="xs" color={mutedColor}>
                      Add at least 2 entities to create relationships
                    </Text>
                  )}

                  <VStack spacing={2} align="stretch">
                    {(entity.relationships || []).map((rel, relIndex) => (
                      <Box
                        key={relIndex}
                        p={3}
                        bg={fieldBg}
                        borderRadius="md"
                        border="1px"
                        borderColor="purple.200"
                      >
                        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={2} alignItems="end">
                          <FormControl size="sm">
                            <FormLabel fontSize="xs">Type</FormLabel>
                            <Select
                              size="sm"
                              value={rel.type}
                              onChange={(e) =>
                                updateRelationship(entityIndex, relIndex, {
                                  type: e.target.value as MarketplaceEntityRelationship['type'],
                                })
                              }
                            >
                              {RELATIONSHIP_TYPES.map((rt) => (
                                <option key={rt.value} value={rt.value}>
                                  {rt.label}
                                </option>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl size="sm">
                            <FormLabel fontSize="xs">Related Entity</FormLabel>
                            <Select
                              size="sm"
                              value={rel.entity}
                              onChange={(e) =>
                                updateRelationship(entityIndex, relIndex, { entity: e.target.value })
                              }
                            >
                              {entities
                                .filter((_, i) => i !== entityIndex)
                                .map((e) => (
                                  <option key={e.name} value={e.name}>
                                    {e.name}
                                  </option>
                                ))}
                            </Select>
                          </FormControl>

                          <FormControl size="sm">
                            <FormLabel fontSize="xs">Foreign Key</FormLabel>
                            <Input
                              size="sm"
                              value={rel.foreignKey || ''}
                              onChange={(e) =>
                                updateRelationship(entityIndex, relIndex, {
                                  foreignKey: e.target.value,
                                })
                              }
                              placeholder="categoryId"
                            />
                          </FormControl>

                          <IconButton
                            aria-label="Remove relationship"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => removeRelationship(entityIndex, relIndex)}
                          />
                        </SimpleGrid>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Collapse>
        </Card>
      ))}

      <Button leftIcon={<AddIcon />} onClick={addEntity} variant="outline" colorScheme="brand">
        Add Entity
      </Button>
    </VStack>
  );
}
