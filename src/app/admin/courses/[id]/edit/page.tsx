// ============================================================================
// SRC/APP/ADMIN/COURSES/[ID]/EDIT/PAGE.TSX - Admin Course Editor
// ============================================================================

'use client';

import { useParams } from 'next/navigation';
import CourseEditor from '@/components/dashboard/CourseEditor';

export default function AdminEditCoursePage() {
  const params = useParams();
  const id = params.id as string;

  return <CourseEditor courseId={id} rolePrefix="admin" />;
}
