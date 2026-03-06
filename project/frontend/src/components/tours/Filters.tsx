// --- Constants ---
export const DURATIONS = [
    { label: "1 วัน", value: "1 Day" },
    { label: "2 วัน", value: "2 Days" },
    { label: "3 วัน", value: "3 Days" }
];

export const REGIONS = [
    { label: "ภาคเหนือ", value: "North" },
    { label: "ภาคกลาง", value: "Central" },
    { label: "ภาคอีสาน", value: "Northeast" },
    { label: "ภาคตะวันตก", value: "West" },
    { label: "ภาคตะวันออก", value: "East" },
    { label: "ภาคใต้", value: "South" },
];

export const CATEGORIES = [
    { label: "ทะเล", value: "Sea" },
    { label: "ภูเขา", value: "Mountain" },
    { label: "ธรรมชาติ", value: "Nature" },
    { label: "วัฒนธรรม", value: "Cultural" },
    { label: "ในเมือง", value: "City" },
    { label: "ผจญภัย", value: "Adventure" },
];

interface FilterItemProps {
    label: string;
    isChecked: boolean;
    onChange: () => void;
}

function FilterItem({ label, isChecked, onChange }: FilterItemProps) {
    return (
        <label className="flex items-center gap-3 cursor-pointer group">
            <input
                type="checkbox"
                checked={isChecked}
                onChange={onChange}
                className="w-5 h-5 accent-[#FF8400] rounded-md cursor-pointer"
            />
            <span className={`text-sm group-hover:text-[#FF8400] transition-colors ${isChecked ? "font-bold text-[#FF8400]" : "font-medium text-gray-700"}`}>
                {label}
            </span>
        </label>
    );
}

interface FilterContentProps {
    durationFilter: string;
    regionFilter: string;
    categoryFilter: string;
    handleFilterChange: (key: string, value: string) => void;
}

export function FilterContent({ durationFilter, regionFilter, categoryFilter, handleFilterChange }: FilterContentProps) {
    return (
        <>
            <div>
                <h3 className="font-extrabold text-lg mb-4 text-[#4F200D]">ระยะเวลา</h3>
                <div className="space-y-3">
                    {DURATIONS.map((item) => (
                        <FilterItem
                            key={item.value}
                            label={item.label}
                            isChecked={durationFilter === item.value}
                            onChange={() => handleFilterChange("duration", item.value)}
                        />
                    ))}
                </div>
            </div>
            <div className="pt-6 border-t border-gray-100">
                <h3 className="font-extrabold text-lg mb-4 text-[#4F200D]">ภูมิภาค</h3>
                <div className="space-y-3">
                    {REGIONS.map((zone) => (
                        <FilterItem
                            key={zone.value}
                            label={zone.label}
                            isChecked={regionFilter === zone.value}
                            onChange={() => handleFilterChange("region", zone.value)}
                        />
                    ))}
                </div>
            </div>
            <div className="pt-6 border-t border-gray-100">
                <h3 className="font-extrabold text-lg mb-4 text-[#4F200D]">ประเภททัวร์</h3>
                <div className="space-y-3">
                    {CATEGORIES.map((cat) => (
                        <FilterItem
                            key={cat.value}
                            label={cat.label}
                            isChecked={categoryFilter === cat.value}
                            onChange={() => handleFilterChange("category", cat.value)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
