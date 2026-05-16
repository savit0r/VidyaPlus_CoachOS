export interface Staff {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: 'teacher' | 'accountant' | 'admin' | 'custom';
  baseSalary: number;
  permissions: string[];
  status: 'active' | 'inactive';
}
