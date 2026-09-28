import { useState } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Check, X } from "lucide-react";

const NEW_PREFIX = "__new__:";

type Props = {
    /** ชื่อผู้สอนที่มีอยู่แล้วในทุกวิชา (ไม่ซ้ำกัน) */
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
    id?: string;
};

/**
 * Combobox แบบ Multiple: เลือกจากผู้สอนที่มีอยู่แล้ว
 * หรือพิมพ์ชื่อใหม่ แล้วเลือกตัวเลือก + เพิ่มผู้สอน "ชื่อ"
 */
export function InstructorCombobox({ options, value, onChange, id }: Props) {
    const [query, setQuery] = useState("");
    // ชื่อใหม่ที่พิมพ์เพิ่มระหว่างเปิด Dialog
    const [created, setCreated] = useState<string[]>([]);

    const allNames = Array.from(new Set([...options, ...created]));
    const text = query.trim();
    const lower = text.toLowerCase();

    const matched = allNames.filter((n) => n.toLowerCase().includes(lower));
    const canCreate =
        text !== "" && !allNames.some((n) => n.toLowerCase() === lower);
    const items = canCreate ? [...matched, NEW_PREFIX + text] : matched;

    const labelOf = (v: string) =>
        v.startsWith(NEW_PREFIX)
            ? `+ เพิ่มผู้สอน "${v.slice(NEW_PREFIX.length)}"`
            : v;

    const handleChange = (next: string[]) => {
        const resolved = Array.from(
            new Set(
                next.map((v) => (v.startsWith(NEW_PREFIX) ? v.slice(NEW_PREFIX.length) : v)),
            ),
        );
        const fresh = resolved.filter(
            (n) => !allNames.some((a) => a.toLowerCase() === n.toLowerCase()),
        );
        if (fresh.length > 0) setCreated((prev) => [...prev, ...fresh]);
        onChange(resolved);
        setQuery("");
    };

    return (
        <Combobox.Root
            multiple
            items={items}
            filter={null}
            value={value}
            onValueChange={handleChange}
            inputValue={query}
            onInputValueChange={setQuery}
            itemToStringLabel={labelOf}
        >
            <Combobox.Chips className="flex min-h-8 w-full flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent px-1.5 py-1 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
                <Combobox.Value>
                    {(selected: string[]) => (
                        <>
                            {selected.map((name) => (
                                <Combobox.Chip
                                    key={name}
                                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                                >
                                    {name}
                                    <Combobox.ChipRemove
                                        aria-label={`ลบ ${name}`}
                                        className="rounded-sm text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-3" />
                                    </Combobox.ChipRemove>
                                </Combobox.Chip>
                            ))}
                            <Combobox.Input
                                id={id}
                                placeholder={selected.length === 0 ? "เลือกหรือพิมพ์ชื่อผู้สอน" : ""}
                                className="min-w-24 flex-1 bg-transparent px-1 py-0.5 outline-none placeholder:text-muted-foreground"
                            />
                        </>
                    )}
                </Combobox.Value>
            </Combobox.Chips>

            <Combobox.Portal>
                <Combobox.Positioner sideOffset={4} className="z-[60]">
                    <Combobox.Popup className="max-h-60 w-(--anchor-width) overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
                        <Combobox.List>
                            {(item: string) => (
                                <Combobox.Item
                                    key={item}
                                    value={item}
                                    className="flex cursor-default items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                                >
                                    <span>{labelOf(item)}</span>
                                    <Combobox.ItemIndicator>
                                        <Check className="size-4" />
                                    </Combobox.ItemIndicator>
                                </Combobox.Item>
                            )}
                        </Combobox.List>
                        <Combobox.Empty className="px-2 py-1.5 text-sm text-muted-foreground empty:hidden">
                            ไม่พบผู้สอน — พิมพ์ชื่อเพื่อเพิ่มใหม่
                        </Combobox.Empty>
                    </Combobox.Popup>
                </Combobox.Positioner>
            </Combobox.Portal>
        </Combobox.Root>
    );
}