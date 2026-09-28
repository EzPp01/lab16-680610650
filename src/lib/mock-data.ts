import type { Student, Course, Enrollment } from "@/lib/types";

export const students: Student[] = [
  {
    studentId: "650610001",
    firstName: "Matt",
    lastName: "Damon",
    program: "CPE",
  },
  {
    studentId: "650610002",
    firstName: "Cillian",
    lastName: "Murphy",
    program: "CPE",
    courses: ["CPE301", "CPE302"],
  },
  {
    studentId: "650610003",
    firstName: "Emily",
    lastName: "Blunt",
    program: "ISNE",
    courses: ["ISNE101", "CPE302"],
  },
];

export const courses: Course[] = [
  {
    courseId: "CS101",
    courseTitle: "Introduction to Programming",
    instructors: ["Dome"],
  },
  {
    courseId: "CS201",
    courseTitle: "Data Structures",
    instructors: ["Chanadda"],
  },
  {
    courseId: "CPE301",
    courseTitle: "Basic Computer Engineering Lab",
    instructors: ["Dome", "Chanadda"],
  },
  {
    courseId: "CPE302",
    courseTitle: "Full Stack Development",
    instructors: ["Dome", "Nirand", "Chanadda"],
  },
  {
    courseId: "ISNE101",
    courseTitle: "Introduction to Information Systems and Network Engineering",
    instructors: ["KENNETH COSH"],
  },
];

export const enrollments: Enrollment[] = [
  { studentId: "650610002", courseId: "CPE301" },
  { studentId: "650610002", courseId: "CPE302" },
  { studentId: "650610003", courseId: "ISNE101" },
  { studentId: "650610003", courseId: "CPE302" },
];

export const CURRENT_STUDENT_ID = "650610002";
export const currentStudent = students.find(
  (s) => s.studentId === CURRENT_STUDENT_ID,
)!;