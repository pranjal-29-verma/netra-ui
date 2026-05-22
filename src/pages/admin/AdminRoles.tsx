import React, { useEffect, useState } from 'react';
import { Plus, ChevronDown, ChevronUp, X, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService, { type AdminRole, type AdminPermission } from '../../services/adminService';
import { useAuthStore } from '../../store/authStore';
import { hasPermission } from '../../types';

function CreateRoleModal({ permissions, onClose, onCreate }: {
  permissions: AdminPermission[];
  onClose: () => void;
  onCreate: (role: AdminRole) => void;
}) {
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<Set<number>>(new Set());
  const [saving, setSaving]           = useState(false);

  const togglePerm = (id: number) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Role name is required'); return; }
    setSaving(true);
    try {
      const role = await adminService.createRole({
        name: name.trim(),
        description: description.trim(),
        permission_ids: [...selectedPerms],
      });
      toast.success(`Role "${role.name}" created`);
      onCreate(role);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to create role');
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by namespace (e.g. "users", "roles", "analytics")
  const grouped = permissions.reduce<Record<string, AdminPermission[]>>((acc, p) => {
    const ns = p.name.split(':')[0];
    if (!acc[ns]) acc[ns] = [];
    acc[ns].push(p);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Create New Role</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. analyst"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What can this role do?"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Permissions grouped by namespace */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permissions <span className="text-gray-400">({selectedPerms.size} selected)</span>
              </label>
              <div className="space-y-3">
                {Object.entries(grouped).map(([ns, perms]) => (
                  <div key={ns} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{ns}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const allSelected = perms.every((p) => selectedPerms.has(p.id));
                          setSelectedPerms((prev) => {
                            const next = new Set(prev);
                            allSelected ? perms.forEach((p) => next.delete(p.id)) : perms.forEach((p) => next.add(p.id));
                            return next;
                          });
                        }}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {perms.every((p) => selectedPerms.has(p.id)) ? 'Deselect all' : 'Select all'}
                      </button>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {perms.map((p) => (
                        <label key={p.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedPerms.has(p.id)}
                            onChange={() => togglePerm(p.id)}
                            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                          />
                          <div>
                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{p.name}</p>
                            {p.description && <p className="text-xs text-gray-400">{p.description}</p>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 p-5 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg transition-colors">
              {saving ? 'Creating…' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RoleCard({ role }: { role: AdminRole }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{role.name}</p>
          {role.description && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{role.description}</p>}
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{role.permissions.length} permissions</span>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        }
      </button>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4">
          {role.permissions.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No permissions assigned.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((p) => (
                <div key={p.id} className="group relative">
                  <span className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-mono cursor-default">
                    {p.name}
                  </span>
                  {p.description && (
                    <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap shadow-lg">
                      {p.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const AdminRoles: React.FC = () => {
  const { user: me } = useAuthStore();
  const canManage = hasPermission(me, 'roles:manage');

  const [roles, setRoles]         = useState<AdminRole[]>([]);
  const [perms, setPerms]         = useState<AdminPermission[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [r, p] = await Promise.all([
          adminService.getRoles(),
          canManage ? adminService.getPermissions() : Promise.resolve([]),
        ]);
        setRoles(r);
        setPerms(p);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [canManage]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Roles</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{roles.length} roles defined</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> New Role
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => <RoleCard key={role.id} role={role} />)}
        </div>
      )}

      {showCreate && (
        <CreateRoleModal
          permissions={perms}
          onClose={() => setShowCreate(false)}
          onCreate={(role) => setRoles((prev) => [...prev, role])}
        />
      )}
    </div>
  );
};
