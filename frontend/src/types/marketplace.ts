export interface MarketplaceApp {
  id: string;
  ownerId: string;
  name: string;
  slug?: string;
  description?: string;
  manifest?: MarketplaceManifest;
  artifactPath?: string;
  type?: 'schema' | 'external' | 'serverless' | 'container';
  lintValid?: boolean;
  lintWarnings?: string[] | null;
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
  visibility?: 'private' | 'public';
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketplaceManifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  entry?: string;
  compatibility?: {
    jericho?: string;
  };
  capabilities?: {
    database?: string[];
    cache?: boolean;
    queue?: boolean;
    storage?: boolean;
    realtime?: boolean;
  };
  permissions?: {
    requiresAuth?: boolean;
    scopes?: string[];
  };
  configSchema?: Record<string, unknown>;
  sampleConfig?: Record<string, unknown>;
  requiredApis?: string[];
  marketplace?: {
    category?: string;
    tags?: string[];
    screenshots?: string[];
    documentation?: string;
    support?: string;
    icon?: string;
  };
  pricing?: {
    price?: number;
    currency?: string;
    model?: 'free' | 'one-time' | 'subscription';
  };
  tests?: {
    unit?: boolean;
    integration?: boolean;
    coverage?: number;
  };
  // Entity definitions for auto-schema generation
  entities?: MarketplaceEntity[];
}

// Entity definition for no-code schema generation
export interface MarketplaceEntity {
  name: string;
  tableName?: string;
  fields: MarketplaceEntityField[];
  relationships?: MarketplaceEntityRelationship[];
  permissions?: {
    create?: string[];
    read?: string[];
    update?: string[];
    delete?: string[];
  };
}

export interface MarketplaceEntityField {
  name: string;
  type: EntityFieldType;
  required?: boolean;
  unique?: boolean;
  default?: unknown;
  // Validation constraints
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: string[];
}

export type EntityFieldType =
  | 'string'
  | 'text'
  | 'number'
  | 'integer'
  | 'float'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'email'
  | 'url'
  | 'json'
  | 'file'
  | 'image'
  | 'enum';

export interface MarketplaceEntityRelationship {
  type: 'belongsTo' | 'hasMany' | 'hasOne' | 'manyToMany';
  entity: string;
  foreignKey?: string;
}

export interface MarketplaceInstall {
  id: string;
  appId: string;
  projectId: string;
  installerUserId: string;
  credentialsEncrypted?: string;
  config?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketplaceInstallEnriched {
  install: MarketplaceInstall;
  app?: MarketplaceApp | null;
  paymentIntent?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
  } | null;
}

export interface SubmitAppPayload {
  manifest: Partial<MarketplaceManifest>;
  name?: string;
  description?: string;
  visibility?: 'private' | 'public';
  type?: 'schema' | 'external' | 'serverless' | 'container';
  artifactBase64?: string;
}

export interface InstallAppPayload {
  projectId: string;
  config?: Record<string, unknown>;
}

export type MarketplaceCategory =
  | 'general'
  | 'ecommerce'
  | 'education'
  | 'healthcare'
  | 'finance'
  | 'cms'
  | 'analytics'
  | 'integrations';

export const MARKETPLACE_CATEGORIES: { value: MarketplaceCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'cms', label: 'CMS' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'integrations', label: 'Integrations' },
];
