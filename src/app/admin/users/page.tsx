// ============================================================================
// SRC/APP/ADMIN/USERS/PAGE.TSX - User Management
// ============================================================================

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import toast from 'react-hot-toast';
import {
    Search,
    UserCheck,
    UserX,
    Edit,
    Mail,
    Shield,
    GraduationCap,
    User,
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function UsersManagementPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [page, setPage] = useState(1);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        role: '',
        isActive: true,
        bio: '',
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', { page, search, role }],
        queryFn: async () => {
            const { data } = await apiClient.get('/admin/users', {
                params: { page, limit: 20, search, role: role || undefined },
            });
            return data.data;
        },
    });

    const updateUserMetadata = useMutation({
        mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
            const response = await apiClient.put(`/admin/users/${userId}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    });

    const handleEditClick = (user: any) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.is_active,
            bio: user.bio || '',
        });
        setShowEditDialog(true);
    };

    const handleEditSubmit = () => {
        if (!editForm.name || !editForm.email) {
            toast.error('Name and Email are required');
            return;
        }
        updateUserMetadata.mutate({
            userId: editingUser.id,
            data: editForm,
        }, {
            onSuccess: () => {
                setShowEditDialog(false);
            }
        });
    };

    const getRoleIcon = (userRole: string) => {
        switch (userRole) {
            case 'admin':
                return <Shield className="w-4 h-4 text-red-600" />;
            case 'instructor':
                return <GraduationCap className="w-4 h-4 text-purple-600" />;
            case 'student':
                return <User className="w-4 h-4 text-blue-600" />;
            default:
                return <User className="w-4 h-4" />;
        }
    };

    return (
        <div className="p-4 lg:p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">User Management</h1>
                <p className="text-muted-foreground">Manage all platform users</p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            options={[
                                { value: '', label: 'All Roles' },
                                { value: 'student', label: 'Students' },
                                { value: 'instructor', label: 'Instructors' },
                                { value: 'admin', label: 'Admins' },
                            ]}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                            ))}
                        </div>
                    ) : data?.users && data.users.length > 0 ? (
                        <div className="space-y-3">
                            {data.users.map((user: any) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                            {getRoleIcon(user.role)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{user.name}</div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </span>
                                                <span className={cn(
                                                    'px-2 py-0.5 rounded text-xs font-medium capitalize',
                                                    user.role === 'admin' && 'bg-red-100 text-red-700',
                                                    user.role === 'instructor' && 'bg-purple-100 text-purple-700',
                                                    user.role === 'student' && 'bg-blue-100 text-blue-700'
                                                )}>
                                                    {user.role}
                                                </span>
                                                <span className={cn(
                                                    'px-2 py-0.5 rounded text-xs',
                                                    user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                )}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Joined {formatDate(user.created_at)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant={user.is_active ? 'outline' : 'primary'}
                                            size="sm"
                                            onClick={() => updateUserMetadata.mutate({
                                                userId: user.id,
                                                data: { isActive: !user.is_active },
                                            })}
                                            disabled={updateUserMetadata.isPending}
                                            className="gap-2"
                                        >
                                            {user.is_active ? (
                                                <>
                                                    <UserX className="w-4 h-4" />
                                                    Deactivate
                                                </>
                                            ) : (
                                                <>
                                                    <UserCheck className="w-4 h-4" />
                                                    Activate
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditClick(user)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No users found
                        </div>
                    )}

                    {/* Pagination */}
                    {data?.pagination && data.pagination.totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {page} of {data.pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                disabled={page === data.pagination.totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle>Edit User Details</DialogTitle>
                        <DialogDescription>
                            Update information for {editingUser?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                        <Input
                            label="Full Name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Role"
                                value={editForm.role}
                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                options={[
                                    { value: 'student', label: 'Student' },
                                    { value: 'instructor', label: 'Instructor' },
                                    { value: 'admin', label: 'Admin' },
                                ]}
                            />

                            <Select
                                label="Status"
                                value={editForm.isActive ? 'true' : 'false'}
                                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                                options={[
                                    { value: 'true', label: 'Active' },
                                    { value: 'false', label: 'Inactive' },
                                ]}
                            />
                        </div>

                        <Textarea
                            label="Bio"
                            placeholder="User biography..."
                            value={editForm.bio}
                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                            rows={3}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleEditSubmit}
                                loading={updateUserMetadata.isPending}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}