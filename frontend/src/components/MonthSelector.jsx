import { CalendarDays, Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const MonthSelector = ({ id = "month-selector", label = "Month", value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) || options[0],
    [options, value]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (monthValue) => {
    onChange(monthValue);
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className="relative w-full sm:w-64">
      <span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">{label}</span>
      <button
        id={id}
        type="button"
        className="focus-ring flex h-11 w-full items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-left shadow-sm transition hover:border-emerald-300"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <CalendarDays aria-hidden="true" className="shrink-0 text-emerald-700" size={17} />
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-950">
          {selectedOption?.label || "Select month"}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`shrink-0 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`}
          size={18}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          <ul className="max-h-64 overflow-y-auto py-1" role="listbox" aria-labelledby={id}>
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`flex h-10 w-full items-center justify-between gap-2 px-3 text-left text-sm font-semibold transition ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check aria-hidden="true" size={16} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MonthSelector;
