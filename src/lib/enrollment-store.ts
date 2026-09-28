import { create } from "zustand";

import {
  students as initialStudents,
  courses as initialCourses,
  enrollments as initialEnrollments,
} from "@/lib/mock-data";
import type { Course, Enrollment, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  /** Admin ลงทะเบียนวิชาให้นักศึกษาคนใดก็ได้ (ไม่ซ้ำกับที่มีอยู่แล้ว) */
  enroll: (studentId: string, courseId: string) => void;
  /** Admin ยกเลิกการลงทะเบียนของนักศึกษาคนใดก็ได้ */
  drop: (studentId: string, courseId: string) => void;
  /** ลบนักศึกษา พร้อมการลงทะเบียนทั้งหมดของคนนั้น */
  removeStudent: (studentId: string) => void;
  /** ลบวิชา พร้อม cascade ลบ enrollment ที่อ้างถึงวิชานั้นทั้งหมด */
  removeCourse: (courseId: string) => void;
  /** เพิ่มวิชาใหม่ (รหัสวิชาต้องไม่ซ้ำ) — คืนค่า true ถ้าเพิ่มสำเร็จ */
  addCourse: (course: Course) => boolean;
  /** เพิ่มผู้สอนให้วิชา (ไม่ซ้ำกับที่มีอยู่แล้ว) */
  addInstructor: (courseId: string, name: string) => void;
  /** ลบผู้สอนออกจากวิชา */
  removeInstructor: (courseId: string, name: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>((set, get) => ({
  students: initialStudents,
  courses: initialCourses,
  enrollments: initialEnrollments,

  enroll: (studentId, courseId) =>
    set((state) => ({
      enrollments: state.enrollments.some(
        (e) => e.studentId === studentId && e.courseId === courseId,
      )
        ? state.enrollments
        : [...state.enrollments, { studentId, courseId }],
    })),

  drop: (studentId, courseId) =>
    set((state) => ({
      enrollments: state.enrollments.filter(
        (e) => !(e.studentId === studentId && e.courseId === courseId),
      ),
    })),

  removeStudent: (studentId) =>
    set((state) => ({
      students: state.students.filter((s) => s.studentId !== studentId),
      enrollments: state.enrollments.filter((e) => e.studentId !== studentId),
    })),

  removeCourse: (courseId) =>
    set((state) => ({
      courses: state.courses.filter((c) => c.courseId !== courseId),
      enrollments: state.enrollments.filter((e) => e.courseId !== courseId),
    })),

  addCourse: (course) => {
    const exists = get().courses.some(
      (c) => c.courseId.toLowerCase() === course.courseId.toLowerCase(),
    );
    if (exists) return false;
    set((state) => ({ courses: [...state.courses, course] }));
    return true;
  },

  addInstructor: (courseId, name) =>
    set((state) => ({
      courses: state.courses.map((c) =>
        c.courseId === courseId && !c.instructors.includes(name)
          ? { ...c, instructors: [...c.instructors, name] }
          : c,
      ),
    })),

  removeInstructor: (courseId, name) =>
    set((state) => ({
      courses: state.courses.map((c) =>
        c.courseId === courseId
          ? { ...c, instructors: c.instructors.filter((i) => i !== name) }
          : c,
      ),
    })),
}));