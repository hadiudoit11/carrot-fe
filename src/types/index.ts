// types/index.ts
export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  email: string;
}


export interface Author {
  name: string;
  imageUrl: string;
  href?: string;
}

export interface Category {
  name: string;
  color: string;
}

// Base user type with common fields
interface BaseUser {
  id: string;
  email: string;
}

// API-specific user type
export interface ApiUser extends BaseUser {
  first_name: string;
  last_name: string;
}

// Frontend-specific user type
export interface User extends BaseUser {
  name: string;
  title: string;
  role: string;
}

// Authentication Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_verified: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  domain: string;
  organization: string;
  auth_provider: 'email' | 'google' | 'facebook' | 'github';
}

// Organization Types
export interface Organization {
  id: string;
  domain: string;
  website: string;
  name: string;
  phone_number: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: 'US' | 'CA';
  is_active: boolean;
  is_verified: boolean;
  billing_status: 'active' | 'inactive' | 'pending' | 'suspended' | 'cancelled';
  contact_email?: string;
  created_at: string;
  updated_at: string;
  org_admin: string;
}

// Site Types
export interface Site {
  id: string;
  name: string;
  phone_number: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  zip_code: string;
  legal_entity_name: string;
  contact_email: string;
  users: User[];
  site_admin: string[];
  is_verified: boolean;
  locations?: Location[];
}

// Access Control Types
export interface Permission {
  id: string;
  group: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  users: string[];
  organization: string;
  permissions?: Permission[];
}

// Article Types
export interface Article {
  id: string;
  title: string;
  name: string;
  description: string;
  body: any;
  created_at: string;
  updated_at: string;
  author: Author;
  sites: string[];
  roles: string[];
  is_archived: boolean;
  organization: string;
  stat?: string;
  href?: string;
  previousStat?: string;
  change?: string;
  changeType?: string;
  date_time?: string;
  date?: string;
  reading_time?: string;
  category?: {
    name: string;
    color: string;
  };
}

export interface Comment {
  id: string;
  article: string;
  body: string;
  created_at: string;
  updated_at: string;
  author: string;
  is_active: boolean;
  organization: string;
}

// Site and Location Types
export interface Location {
  id: number;
  name: string;
  people: Person[];
}

export interface Person {
  name: string;
  email: string;
  title: string;
  role: string;
}

// Component Props Types
export interface SiteCreateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export interface SiteUpdateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  siteId: string | null;
}

export interface SiteListProps {
  isCreateOpen?: boolean;
  setIsCreateOpen?: (open: boolean) => void;
  isUpdateOpen?: boolean;
  setIsUpdateOpen?: (open: boolean) => void;
  selectedSiteId?: string | null;
  setSelectedSiteId?: (id: string | null) => void;
}

export interface FormData {
  name: string;
  phone_number: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  zip_code: string;
  legal_entity_name: string;
  contact_email: string;
  user: User[];
}