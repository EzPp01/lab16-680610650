import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  students as initialStudents,
  courses as initialCourses,
} from "@/lib/mock-data";
import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  /** ลงทะเบียนวิชาให้นักศึกษาหลายคนพร้อมกัน (ไม่ซ้ำกับที่มีอยู่แล้ว) */
  addStudentsToCourse: (courseCode: string, studentIds: string[]) => void;
  /** เอานักศึกษาออกจากวิชา (ลบรหัสวิชาออกจาก enrolledCourses ของคนนั้น) */
  removeStudentFromCourse: (courseCode: string, studentId: string) => void;
  /** ลบนักศึกษา */
  removeStudent: (studentId: string) => void;
  /** เพิ่มวิชาใหม่ (รหัสวิชาต้องไม่ซ้ำ) — คืนค่า true ถ้าเพิ่มสำเร็จ */
  addCourse: (course: Course) => boolean;
  /** ลบวิชา พร้อมเอารหัสวิชานั้นออกจาก enrolledCourses ของนักศึกษาทุกคน */
  removeCourse: (courseCode: string) => void;
  /** เพิ่มผู้สอนให้วิชา (ไม่ซ้ำกับที่มีอยู่แล้ว) */
  addInstructor: (courseCode: string, name: string) => void;
  /** ลบผู้สอนออกจากวิชา */
  removeInstructor: (courseCode: string, name: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set, get) => ({
      students: initialStudents,
      courses: initialCourses,

      addStudentsToCourse: (courseCode, studentIds) =>
        set((state) => ({
          students: state.students.map((s) =>
            studentIds.includes(s.studentId) &&
              !s.enrolledCourses.includes(courseCode)
              ? { ...s, enrolledCourses: [...s.enrolledCourses, courseCode] }
              : s,
          ),
        })),

      removeStudentFromCourse: (courseCode, studentId) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.studentId === studentId
              ? {
                ...s,
                enrolledCourses: s.enrolledCourses.filter(
                  (c) => c !== courseCode,
                ),
              }
              : s,
          ),
        })),

      removeStudent: (studentId) =>
        set((state) => ({
          students: state.students.filter((s) => s.studentId !== studentId),
        })),

      addCourse: (course) => {
        const exists = get().courses.some(
          (c) => c.courseCode.toLowerCase() === course.courseCode.toLowerCase(),
        );
        if (exists) return false;
        set((state) => ({ courses: [...state.courses, course] }));
        return true;
      },

      removeCourse: (courseCode) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.courseCode !== courseCode),
          students: state.students.map((s) => ({
            ...s,
            enrolledCourses: s.enrolledCourses.filter((c) => c !== courseCode),
          })),
        })),

      addInstructor: (courseCode, name) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.courseCode === courseCode && !(c.instructors ?? []).includes(name)
              ? { ...c, instructors: [...(c.instructors ?? []), name] }
              : c,
          ),
        })),

      removeInstructor: (courseCode, name) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.courseCode === courseCode
              ? {
                ...c,
                instructors: (c.instructors ?? []).filter((i) => i !== name),
              }
              : c,
          ),
        })),
    }),
    {
      name: "lab16-2569-680610650",
      // เก็บเฉพาะข้อมูล ไม่เก็บ function
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  ),
);