import { useState } from "react";
import { PlusCircle, Trash2, X } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import type { Course } from "@/lib/types";

export default function AdminCoursesPage() {
    const { courses, students, addCourse, removeCourse, removeInstructor } =
        useEnrollmentStore();

    const [addOpen, setAddOpen] = useState(false);
    const [code, setCode] = useState("");
    const [title, setTitle] = useState("");
    const [instructorText, setInstructorText] = useState("");
    const [error, setError] = useState("");
    const [toDelete, setToDelete] = useState<Course | null>(null);

    const resetForm = () => {
        setCode("");
        setTitle("");
        setInstructorText("");
        setError("");
    };

    const handleAddOpenChange = (open: boolean) => {
        setAddOpen(open);
        if (!open) resetForm();
    };

    const handleAdd = () => {
        const courseCode = code.trim().toUpperCase();
        const courseTitle = title.trim();
        if (!courseCode || !courseTitle) return;

        // ผู้สอนคั่นด้วยเครื่องหมายจุลภาค ตัดชื่อซ้ำออก
        const instructors = Array.from(
            new Set(
                instructorText
                    .split(",")
                    .map((n) => n.trim())
                    .filter(Boolean),
            ),
        );

        const ok = addCourse({ courseCode, courseTitle, instructors });
        if (!ok) {
            setError(`รหัสวิชา ${courseCode} มีอยู่แล้ว`);
            return;
        }
        handleAddOpenChange(false);
    };

    const enrolledCount = toDelete
        ? students.filter((s) => s.enrolledCourses.includes(toDelete.courseCode))
            .length
        : 0;

    return (
        <div className="mx-auto max-w-5xl space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
                    <p className="text-sm text-muted-foreground">
                        {courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก
                        ตอนลงทะเบียนให้นักศึกษาที่หน้า &quot;จัดการการลงทะเบียน&quot; ทันที
                    </p>
                </div>

                <Dialog open={addOpen} onOpenChange={handleAddOpenChange}>
                    <DialogTrigger render={<Button />}>
                        <PlusCircle className="h-4 w-4" />
                        เพิ่มวิชา
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>เพิ่มวิชา</DialogTitle>
                            <DialogDescription>
                                กรอกรหัสวิชา ชื่อวิชา และผู้สอน (หลายคนคั่นด้วยเครื่องหมาย ,)
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="courseCode">รหัสวิชา</Label>
                                <Input
                                    id="courseCode"
                                    placeholder="เช่น CPE303"
                                    value={code}
                                    aria-invalid={!!error}
                                    onChange={(e) => {
                                        setCode(e.target.value);
                                        setError("");
                                    }}
                                />
                                {error && <p className="text-xs text-destructive">{error}</p>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="courseTitle">ชื่อวิชา</Label>
                                <Input
                                    id="courseTitle"
                                    placeholder="เช่น Operating Systems"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="courseInstructors">ผู้สอน</Label>
                                <Input
                                    id="courseInstructors"
                                    placeholder="เช่น Dome, Nirand"
                                    value={instructorText}
                                    onChange={(e) => setInstructorText(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                disabled={!code.trim() || !title.trim()}
                                onClick={handleAdd}
                            >
                                <PlusCircle className="h-4 w-4" />
                                เพิ่มวิชา
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>รหัสวิชา</TableHead>
                            <TableHead>ชื่อวิชา</TableHead>
                            <TableHead>ผู้สอน</TableHead>
                            <TableHead className="w-20 text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-20 text-center text-muted-foreground"
                                >
                                    ยังไม่มีวิชาที่เปิดสอน
                                </TableCell>
                            </TableRow>
                        )}
                        {courses.map((c) => (
                            <TableRow key={c.courseCode}>
                                <TableCell className="font-medium">{c.courseCode}</TableCell>
                                <TableCell>{c.courseTitle}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(c.instructors ?? []).map((name) => (
                                            <Badge key={name} variant="secondary" className="gap-1">
                                                {name}
                                                <button
                                                    type="button"
                                                    aria-label={`ลบผู้สอน ${name}`}
                                                    className="rounded-sm hover:text-destructive"
                                                    onClick={() => removeInstructor(c.courseCode, name)}
                                                >
                                                    <X className="size-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`ลบวิชา ${c.courseCode}`}
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => setToDelete(c)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog
                open={toDelete !== null}
                onOpenChange={(open) => {
                    if (!open) setToDelete(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ลบวิชา {toDelete?.courseCode}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {toDelete?.courseTitle}
                            {enrolledCount > 0
                                ? ` — จะเอาวิชานี้ออกจากการลงทะเบียนของนักศึกษา ${enrolledCount} คนด้วย`
                                : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => {
                                if (toDelete) removeCourse(toDelete.courseCode);
                                setToDelete(null);
                            }}
                        >
                            ลบวิชา
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}