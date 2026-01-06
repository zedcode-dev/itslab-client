// ============================================================================
// SRC/HOOKS/USE-API.TS - React Query Hooks
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';

// Auth Hooks
export function useLogin() {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await apiClient.post('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      login(data.data.user, data.data.token, data.data.refreshToken);
      toast.success('Welcome back!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
}

export function useProfile() {
  const { setUser } = useAuthStore();
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/auth/me');
      if (data.data.user) {
        setUser(data.data.user);
      }
      return data.data.user;
    },
  });
}

export function useUpdateProfile() {
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: { name?: string; bio?: string }) => {
      const { data } = await apiClient.put('/auth/profile', userData);
      return data.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (passwordData: any) => {
      const { data } = await apiClient.put('/auth/change-password', passwordData);
      return data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (userData: {
      name: string;
      email: string;
      password: string;
      role: string;
    }) => {
      const { data } = await apiClient.post('/auth/register', userData);
      return data;
    },
    onSuccess: () => {
      toast.success('Registration successful! Please verify your email.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Registration failed';
      const details = error.response?.data?.data;

      if (Array.isArray(details) && details.length > 0) {
        details.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error(message);
      }
    },
  });
}

// Course Hooks
export function useCourses(params?: {
  page?: number;
  limit?: number;
  search?: string;
  level?: string;
}) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/courses', { params });
      return data.data;
    },
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/courses/${id}`);
      return data.data.course;
    },
    enabled: !!id,
  });
}

export function useCourseCurriculum(id: string) {
  return useQuery({
    queryKey: ['course-curriculum', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/courses/${id}/curriculum`);
      return data.data.sections;
    },
    enabled: !!id,
  });
}

// Student Hooks
export function useStudentDashboard() {
  return useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get('/student/dashboard');
      return data.data;
    },
  });
}

export function useCourseProgress(courseId: string) {
  return useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/student/courses/${courseId}/progress`);
      return data.data;
    },
    enabled: !!courseId,
  });
}

export function useStudentCertificates() {
  return useQuery({
    queryKey: ['student-certificates'],
    queryFn: async () => {
      const { data } = await apiClient.get('/student/certificates');
      return data.data;
    },
  });
}

export function useStudentTransactions() {
  return useQuery({
    queryKey: ['student-transactions'],
    queryFn: async () => {
      const { data } = await apiClient.get('/student/transactions');
      return data.data;
    },
  });
}

export function useMarkLessonComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      watchTimeSeconds,
    }: {
      lessonId: string;
      watchTimeSeconds: number;
    }) => {
      const { data } = await apiClient.post(`/student/lessons/${lessonId}/complete`, {
        watchTimeSeconds,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      toast.success('Lesson marked as complete!');
    },
  });
}

export function useSubmitReview(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: { rating: number; reviewText: string }) => {
      const { data } = await apiClient.post(`/student/courses/${courseId}/reviews`, reviewData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course-reviews', courseId] });
      toast.success('Review submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    },
  });
}
// Instructor Hooks
export function useInstructorDashboard() {
  return useQuery({
    queryKey: ['instructor-dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get('/instructor/dashboard');
      return data.data;
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseData: any) => {
      const { data } = await apiClient.post('/instructor/courses', courseData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      toast.success('Course created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create course');
    },
  });
}

export function useUpdateCourse(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseData: any) => {
      const { data } = await apiClient.put(`/instructor/courses/${courseId}`, courseData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast.success('Course updated successfully!');
    },
  });
}

export function usePublishCourse(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isPublished: boolean) => {
      const { data } = await apiClient.patch(`/instructor/courses/${courseId}/publish`, {
        isPublished,
      });
      return data;
    },
    onSuccess: (_, isPublished) => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast.success(isPublished ? 'Course published successfully!' : 'Course unpublished successfully!');
    },
  });
}