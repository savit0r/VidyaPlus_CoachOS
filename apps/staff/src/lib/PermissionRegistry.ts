export interface PermissionModule {
  id: string;
  label: string;
  permissions: {
    id: string;
    label: string;
    description: string;
  }[];
}

export const MODULAR_DELEGATION_ENGINE: PermissionModule[] = [
  {
    id: 'students',
    label: 'Student Management',
    permissions: [
      { id: 'students.view', label: 'View Directory', description: 'Access the student list and basic profiles' },
      { id: 'students.add', label: 'Enroll New', description: 'Register new students into the system' },
      { id: 'students.edit', label: 'Modify Records', description: 'Update KYC, contact info, and status' },
      { id: 'students.delete', label: 'Archive Data', description: 'Permit removal or archiving of records' },
    ]
  },
  {
    id: 'academics',
    label: 'Academic Hub',
    permissions: [
      { id: 'batches.view', label: 'View Batches', description: 'See class schedules and assignments' },
      { id: 'batches.edit', label: 'Manage Classes', description: 'Configure batch settings and timings' },
      { id: 'attendance.mark', label: 'Mark Presence', description: 'Record daily attendance for students' },
      { id: 'attendance.view', label: 'View History', description: 'Access past attendance logs' },
      { id: 'attendance.edit', label: 'Correct Attendance', description: 'Modify past attendance records' },
    ]
  },
  {
    id: 'finance',
    label: 'Financial Ledger',
    permissions: [
      { id: 'fees.view', label: 'View Ledgers', description: 'Access financial summaries and dues' },
      { id: 'fees.collect', label: 'Process Payments', description: 'Record and verify fee collections' },
      { id: 'fees.edit', label: 'Structure Fees', description: 'Modify fee plans and discounts' },
      { id: 'fees.delete', label: 'Void Receipts', description: 'Cancel or delete payment records' },
    ]
  },
  {
    id: 'connect',
    label: 'Communication Center',
    permissions: [
      { id: 'notifications.view', label: 'Logs', description: 'View history of sent alerts' },
      { id: 'notifications.send', label: 'Broadcast', description: 'Send WhatsApp/Email notifications' },
    ]
  },
  {
    id: 'team',
    label: 'Team Operations',
    permissions: [
      { id: 'reports.view', label: 'Operational Reports', description: 'Access institute-wide performance data' },
      { id: 'reports.export', label: 'Data Export', description: 'Download CSV/PDF reports' },
      { id: 'staff.view', label: 'View Team', description: 'See directory of staff members' },
      { id: 'staff.manage', label: 'Manage Staff', description: 'Add/Edit team members and permissions' },
      { id: 'settings.manage', label: 'Global Settings', description: 'Access system-wide configuration' },
    ]
  }
];

export const getPermissionGroup = (permId: string) => {
  return MODULAR_DELEGATION_ENGINE.find(m => m.permissions.some(p => p.id === permId));
};
