export const formatDate = (date: Date | null | undefined): string | null => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
};

export const parseDate = (val: string | null): Date | undefined => {
  if (val === null || val === undefined || val === "") return undefined;

  return new Date(String(val));
};
