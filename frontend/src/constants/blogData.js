// Every blog post lives in its own module under ./posts/<id>.js and default-exports
// { id, title, date, aiSummary, image, tags, type, content, part? }.
// Adding a post = adding one file; no list to update here.
const modules = import.meta.glob('./posts/*.js', { eager: true });

const toTime = (date) => {
  const t = Date.parse(date);
  return Number.isNaN(t) ? 0 : t;
};

// Newest first; posts from the same day (a series) in reading order via `part`.
const blogData = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => toTime(b.date) - toTime(a.date) || (a.part ?? 0) - (b.part ?? 0));

export default blogData;
