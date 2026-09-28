import { useState } from "react";
import { PlusCircle, X } from "lucide-react";

import { MultiCombobox } from "@/components/multi-combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, addStudentsToCourse, removeStudentFromCourse } =
    useEnrollmentStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [formStudents, setFormStudents] = useState<string[]>([]);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));
  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));

  // นักศึกษาที่ยังไม่ได้ลงทะเบียนวิชาที่เลือก
  const availableStudentOptions: Option[] = formCourse
    ? students
      .filter((s) => !s.enrolledCourses.includes(formCourse))
      .map((s) => ({
        value: s.studentId,
        label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
      }))
    : [];

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setFormCourse(null);
      setFormStudents([]);
    }
  };

  const handleEnroll = () => {
    if (!formCourse || formStudents.length === 0) return;
    addStudentsToCourse(formCourse, formStudents);
    handleDialogOpenChange(false);
  };

  // หนึ่งแถวต่อหนึ่งวิชา — รายชื่อนักศึกษาดึงจาก enrolledCourses
  const rows = courses
    .map((c) => ({
      course: c,
      enrolled: students.filter((s) => s.enrolledCourses.includes(c.courseCode)),
    }))
    .filter((r) =>
      mode === "course"
        ? filterCourse === "all" || r.course.courseCode === filterCourse
        : filterStudent === "all" ||
        r.enrolled.some((s) => s.studentId === filterStudent),
    );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกวิชาก่อน แล้วเลือกนักศึกษาได้มากกว่า 1 คน
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder="เลือกวิชา"
                onChange={(v) => {
                  setFormCourse(v);
                  // เปลี่ยนวิชา → ล้างรายชื่อที่เลือกไว้
                  setFormStudents([]);
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="formStudents">นักศึกษา</Label>
              {/* key ทำให้ Combobox รีเซ็ตทุกครั้งที่เปลี่ยนวิชา */}
              <MultiCombobox
                key={formCourse ?? "none"}
                id="formStudents"
                options={availableStudentOptions}
                value={formStudents}
                onChange={setFormStudents}
                disabled={!formCourse}
                placeholder={
                  formCourse ? "เลือกนักศึกษา" : "เลือกวิชาก่อน"
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!formCourse || formStudents.length === 0}
              onClick={handleEnroll}
            >
              <PlusCircle className="h-4 w-4" />
              ลงทะเบียน ({formStudents.length} คน)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "course" | "student")}
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead className="w-24">จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            )}
            {rows.map(({ course, enrolled }) => (
              <TableRow key={course.courseCode}>
                <TableCell className="font-medium">
                  {course.courseCode}
                </TableCell>
                <TableCell>{course.courseTitle}</TableCell>
                <TableCell>{enrolled.length}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {enrolled.length === 0 && (
                      <span className="text-sm text-muted-foreground">
                        ยังไม่มีนักศึกษา
                      </span>
                    )}
                    {enrolled.map((s) => (
                      <Badge
                        key={s.studentId}
                        variant="secondary"
                        className="gap-1"
                      >
                        {s.firstName} {s.lastName}
                        <button
                          type="button"
                          aria-label={`ลบ ${s.firstName} ${s.lastName} ออกจากวิชา ${course.courseCode}`}
                          className="rounded-sm hover:text-destructive"
                          onClick={() =>
                            removeStudentFromCourse(
                              course.courseCode,
                              s.studentId,
                            )
                          }
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}