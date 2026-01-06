'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import toast from 'react-hot-toast';
import { CourseManagementGrid } from '@/components/dashboard/CourseManagementGrid';

export default function AdminCoursesPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-courses', { page, search }],
        queryFn: async () => {
            const { data } = await apiClient.get('/admin/courses', {
                params: { page, limit: 12, search },
            });
            return data.data;
        },
    });

    const togglePublish = useMutation({
        mutationFn: async ({ courseId, isPublished }: { courseId: string; isPublished: boolean }) => {
            const { data } = await apiClient.patch(`/instructor/courses/${courseId}/publish`, {
                isPublished: !isPublished,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            toast.success('Course status updated');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update course status');
        }
    });

    return (
        <div className="p-4 lg:p-8">
            <CourseManagementGrid
                title="Platform Courses"
                description="Manage and monitor all courses across the platform"
                courses={data?.courses || []}
                isLoading={isLoading}
                role="admin"
                search={search}
                onSearchChange={(val) => { setSearch(val); setPage(1); }}
                pagination={data?.pagination ? {
                    page,
                    totalPages: data.pagination.totalPages,
                    onPageChange: (p) => setPage(p)
                } : null}
                onPublishToggle={(id, status) => {
                    if (togglePublish.isPending) return;
                    togglePublish.mutate({ courseId: id, isPublished: status });
                }}
                isPublishing={togglePublish.isPending}
            />
        </div>
    );
}
