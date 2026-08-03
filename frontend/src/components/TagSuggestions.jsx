import { Plus, Sparkles } from "lucide-react";
import { getTagSuggestions } from "../utils/tagUtils";

const TagSuggestions = ({ remarks = "", expenses = [], onSelectTag }) => {
  const suggestions = getTagSuggestions(remarks, expenses);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 rounded-md border border-indigo-100 bg-indigo-50/60 p-2 text-xs">
      <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-indigo-900">
        <Sparkles size={13} className="text-indigo-600" />
        <span>Suggested tags:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onSelectTag(tag)}
            className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2 py-1 font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-100 hover:text-indigo-900 shadow-2xs"
          >
            <Plus size={12} className="text-indigo-500" />
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagSuggestions;
