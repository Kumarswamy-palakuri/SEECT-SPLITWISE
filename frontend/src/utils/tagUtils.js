/**
 * Parses remarks text into an array of tag strings.
 * Handles space and comma separated words/hashtags.
 * E.g., "Dinner, groceries fuel" -> ["Dinner", "groceries", "fuel"]
 */
export const parseTags = (remarks) => {
  if (!remarks || typeof remarks !== "string") {
    return [];
  }

  // Split by comma or whitespace
  const tokens = remarks.trim().split(/[,\s]+/);
  
  // Clean tokens and filter empty strings
  const tags = tokens
    .map((token) => token.replace(/^[^\w#]+|[^\w#]+$/g, "")) // trim surrounding punctuation except #
    .filter(Boolean);

  // Return unique tags maintaining original order
  const uniqueTags = [];
  const seenLower = new Set();

  for (const tag of tags) {
    const lower = tag.toLowerCase();
    if (!seenLower.has(lower)) {
      seenLower.add(lower);
      uniqueTags.push(tag);
    }
  }

  return uniqueTags;
};

/**
 * Aggregates tag usage across an array of expenses.
 * Returns array of { tag, displayTag, count, totalAmount, expenses } sorted by count and totalAmount.
 */
export const getTagAnalytics = (expenses = []) => {
  const tagMap = new Map();

  for (const expense of expenses) {
    if (!expense || expense.isHidden) continue;
    const remarks = expense.remarks || "";
    const tags = parseTags(remarks);

    for (const tag of tags) {
      const key = tag.toLowerCase();
      if (!tagMap.has(key)) {
        tagMap.set(key, {
          tag: key.startsWith("#") ? key : `#${key}`,
          displayTag: tag.startsWith("#") ? tag : `#${tag}`,
          count: 0,
          totalAmount: 0,
          expenses: []
        });
      }

      const item = tagMap.get(key);
      item.count += 1;
      item.totalAmount += Number(expense.amount || 0);
      item.expenses.push(expense);
    }
  }

  return Array.from(tagMap.values()).sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return b.totalAmount - a.totalAmount;
  });
};

/**
 * Retrieves all unique tags from expenses, ordered by frequency of use.
 */
export const getAllUniqueTags = (expenses = []) => {
  const analytics = getTagAnalytics(expenses);
  return analytics.map((item) => item.displayTag);
};

/**
 * Gets tag suggestions based on the current remarks text and existing expenses.
 * Filters out tags that have already been added to the remarks.
 */
export const getTagSuggestions = (remarks = "", expenses = []) => {
  const allTags = getAllUniqueTags(expenses);
  if (allTags.length === 0) {
    return [];
  }

  const currentTags = parseTags(remarks).map((t) => t.toLowerCase().replace(/^#/, ""));
  const currentTagsSet = new Set(currentTags);

  // Extract the last active token being typed
  const tokens = remarks.split(/[,\s]+/);
  const lastTokenRaw = tokens[tokens.length - 1] || "";
  const lastTokenClean = lastTokenRaw.replace(/^[^\w#]+|[^\w#]+$/g, "").toLowerCase().replace(/^#/, "");

  // Available tags not already added
  const availableTags = allTags.filter((tag) => {
    const cleanTag = tag.toLowerCase().replace(/^#/, "");
    return !currentTagsSet.has(cleanTag);
  });

  if (!lastTokenClean) {
    // If no active token, show top available suggestions (up to 6)
    return availableTags.slice(0, 6);
  }

  // Filter available tags matching the typed token
  const matching = availableTags.filter((tag) => {
    const cleanTag = tag.toLowerCase().replace(/^#/, "");
    return cleanTag.startsWith(lastTokenClean) || cleanTag.includes(lastTokenClean);
  });

  return matching.slice(0, 6);
};

/**
 * Appends or replaces the active token in remarks with the selected tag.
 */
export const appendTagToRemarks = (remarks = "", selectedTag = "") => {
  if (!selectedTag) return remarks;

  const cleanSelected = selectedTag.replace(/^#/, "");

  // Check if remarks ends with space or comma
  const endsWithSeparator = /[,\s]$/.test(remarks) || remarks.trim() === "";

  if (endsWithSeparator) {
    const trimmed = remarks.trimEnd();
    return trimmed ? `${trimmed} ${cleanSelected} ` : `${cleanSelected} `;
  }

  // Replace last typing word with the selected tag
  const lastSpaceIdx = Math.max(remarks.lastIndexOf(" "), remarks.lastIndexOf(","));
  if (lastSpaceIdx === -1) {
    return `${cleanSelected} `;
  }

  const prefix = remarks.slice(0, lastSpaceIdx + 1);
  return `${prefix}${cleanSelected} `;
};
