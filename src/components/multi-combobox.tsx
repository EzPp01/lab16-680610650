import { Combobox } from "@base-ui/react/combobox";
import { Check, X } from "lucide-react";
import { useState } from "react";

type Option = { value: string; label: string };

type Props = {
    options: Option[];
    /** ค่าที่เลือก (เก็บเป็น value ของ option) */
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    id?: string;
};

/** Combobox แบบ Multiple: เลือกได้หลายรายการ แสดงเป็น chip ที่มีปุ่ม x */
export function MultiCombobox({
    options,
    value,
    onChange,
    placeholder,
    disabled,
    id,
}: Props) {
    const [query, setQuery] = useState("");

    const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;
    const q = query.trim().toLowerCase();
    const items = options
        .filter((o) => o.label.toLowerCase().includes(q))
        .map((o) => o.value);

    return (
        <Combobox.Root
            multiple
            items={items}
            filter={null}
            disabled={disabled}
            value={value}
            onValueChange={(v) => {
                onChange(v);
                setQuery("");
            }}
            inputValue={query}
            onInputValueChange={setQuery}
            itemToStringLabel={labelOf}
        >
            <Combobox.Chips
                className={
                    "flex min-h-8 w-full flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent px-1.5 py-1 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30" +
                    (disabled ? " pointer-events-none opacity-50" : "")
                }
            >
                <Combobox.Value>
                    {(selected: string[]) => (
                        <>
                            {selected.map((v) => (
                                <Combobox.Chip
                                    key={v}
                                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                                >
                                    {labelOf(v)}
                                    <Combobox.ChipRemove
                                        aria-label={`ลบ ${labelOf(v)}`}
                                        className="rounded-sm text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-3" />
                                    </Combobox.ChipRemove>
                                </Combobox.Chip>
                            ))}
                            <Combobox.Input
                                id={id}
                                placeholder={selected.length === 0 ? placeholder : ""}
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
                            ไม่พบรายการ
                        </Combobox.Empty>
                    </Combobox.Popup>
                </Combobox.Positioner>
            </Combobox.Portal>
        </Combobox.Root>
    );
}