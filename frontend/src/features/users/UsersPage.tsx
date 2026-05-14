import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import type { User, Role } from '../../types';
import { 
  Shield, 
  UserCog, 
  Mail, 
  Calendar,
  MoreVertical,
  Check
} from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number, role: Role }) => 
      api.patch(`/users/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated');
    },
    onError: () => {
      toast.error('Failed to update role');
    }
  });

  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-10 bg-secondary rounded-xl w-1/4" /><div className="h-64 bg-secondary rounded-2xl w-full" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage your organization's team members and their permissions.</p>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.email[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">{user.email}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" /> ID: {user.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className={clsx(
                        "px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-xs font-semibold outline-none focus:ring-2 focus:ring-primary transition-all",
                        user.role === 'ADMIN' ? "text-primary" : "text-foreground"
                      )}
                      value={user.role}
                      onChange={(e) => roleMutation.mutate({ userId: user.id, role: e.target.value as Role })}
                      disabled={roleMutation.isPending}
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="USER">USER</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 glass rounded-2xl bg-primary/5 border-primary/20 flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-primary">Role Permissions Information</h4>
          <p className="text-sm text-muted-foreground mt-1">
            <strong>Admin:</strong> Full access to system settings and users. <br />
            <strong>Manager:</strong> Can assign, update, and resolve all incidents. <br />
            <strong>User:</strong> Can report incidents and add comments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
