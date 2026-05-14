export type Role = 'ADMIN' | 'MANAGER' | 'USER';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface User {
  id: number;
  email: string;
  role: Role;
  tenantId: number;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  plan: string;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  severity: Severity;
  status: Status;
  version: number;
  tenantId: number;
  assigneeId?: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignee?: Partial<User>;
  creator: Partial<User>;
}

export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  authorId: number;
  incidentId: number;
  author: Partial<User>;
}

export interface ActivityLog {
  id: number;
  action: string;
  metadata?: any;
  createdAt: string;
  actor: Partial<User>;
}

export interface Alert {
  id: number;
  type: string;
  message: string;
  triggeredAt: string;
  resolvedAt?: string;
  incidentId: number;
  incident?: Partial<Incident>;
}
