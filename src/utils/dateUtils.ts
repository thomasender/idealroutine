export function getTodayDate() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function formatDateWithDay(dateStr: string) {
  const date = new Date(dateStr);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const day = days[date.getDay()];
  return `${dateStr} (${day})`;
} 