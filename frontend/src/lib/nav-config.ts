'use client';

import { IconType } from 'react-icons';
import {
  FiHome,
  FiFolder,
  FiUsers,
  FiShield,
  FiKey,
  FiDatabase,
  FiFile,
  FiMessageSquare,
  FiBell,
  FiCreditCard,
  FiCalendar,
  FiServer,
  FiSettings,
  FiActivity,
  FiPackage,
} from 'react-icons/fi';

export interface NavItem {
  label: string;
  icon: IconType;
  href: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const sidebarNavSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', icon: FiHome, href: '/dashboard' },
      { label: 'Projects', icon: FiFolder, href: '/dashboard/projects' },
      { label: 'Marketplace', icon: FiPackage, href: '/dashboard/marketplace' },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Users', icon: FiUsers, href: '/dashboard/users' },
      { label: 'Roles', icon: FiShield, href: '/dashboard/roles' },
      { label: 'API Keys', icon: FiKey, href: '/dashboard/api-keys' },
      { label: 'Schemas', icon: FiDatabase, href: '/dashboard/schemas' },
    ],
  },
  {
    title: 'Services',
    items: [
      { label: 'Files', icon: FiFile, href: '/dashboard/files' },
      { label: 'Messaging', icon: FiMessageSquare, href: '/dashboard/messaging' },
      { label: 'Notifications', icon: FiBell, href: '/dashboard/notifications' },
      { label: 'Payments', icon: FiCreditCard, href: '/dashboard/payments' },
      { label: 'Attendance', icon: FiCalendar, href: '/dashboard/attendance' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'System', icon: FiServer, href: '/dashboard/system' },
      { label: 'Metrics', icon: FiActivity, href: '/dashboard/metrics' },
      { label: 'Settings', icon: FiSettings, href: '/dashboard/settings' },
    ],
  },
];
