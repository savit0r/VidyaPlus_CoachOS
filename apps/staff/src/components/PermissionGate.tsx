import React from 'react';
import { useAuthStore } from '../stores/auth.store';
import { Permission } from '@coachos/shared';

interface PermissionGateProps {
  /** Permission required to see the children */
  permission?: Permission;
  /** Array of permissions, user must have ALL of them */
  all?: Permission[];
  /** Array of permissions, user must have AT LEAST ONE of them */
  any?: Permission[];
  /** Optional fallback component if permission is denied */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A wrapper component that intelligently shows/hides children based on user permissions.
 */
export default function PermissionGate({ 
  permission, 
  all, 
  any, 
  fallback = null, 
  children 
}: PermissionGateProps) {
  const { hasPermission } = useAuthStore();

  let isAllowed = false;

  if (permission) {
    isAllowed = hasPermission(permission);
  } else if (all) {
    isAllowed = all.every(p => hasPermission(p));
  } else if (any) {
    isAllowed = any.some(p => hasPermission(p));
  } else {
    // If no permission specified, allow by default (safety fallback)
    isAllowed = true;
  }

  if (!isAllowed) return <>{fallback}</>;

  return <>{children}</>;
}
