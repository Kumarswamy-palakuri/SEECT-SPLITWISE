import { Hash, Tag, X } from "lucide-react";
import { useMemo } from "react";
import { formatCurrency } from "../utils/splitCalculator";
import { getTagAnalytics } from "../utils/tagUtils";

const TagAnalytics = ({ expenses = [], selectedTag = null, onSelectTag }) => {
  const analytics = useMemo(() => getTagAnalytics(expenses), [expenses]);
  const totalTags = analytics.length;

  if (totalTags === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm font-medium text-slate-500">
        <Tag className="mx-auto mb-1 h-5 w-5 text-slate-400" />
        No remarks tags found in this period. Add words/hashtags in remarks when creating expenses!
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-950 sm:text-lg">Tag Analytics</h3>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
            {totalTags} tag{totalTags === 1 ? "" : "s"}
          </span>
        </div>

        {selectedTag && onSelectTag && (
          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            <X size={14} />
            Clear Tag Filter
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {analytics.map(({ tag, displayTag, count, totalAmount }) => {
          const isSelected = selectedTag && selectedTag.toLowerCase() === tag.toLowerCase();

          return (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectTag && onSelectTag(isSelected ? null : tag)}
              className={`group flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                isSelected
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-900"
              }`}
            >
              <span className="font-bold">{displayTag}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  isSelected
                    ? "bg-indigo-700 text-white"
                    : "bg-indigo-100 text-indigo-800 group-hover:bg-indigo-200"
                }`}
                title={`${count} transaction${count === 1 ? "" : "s"}`}
              >
                {count}
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  isSelected ? "text-indigo-100" : "text-slate-500"
                }`}
              >
                {formatCurrency(totalAmount)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TagAnalytics;
