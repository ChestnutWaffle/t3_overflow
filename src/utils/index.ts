import type { Timestamp } from "firebase/firestore/lite";
export function getDateString(unixDate: number | undefined) {
  if (!unixDate) return "";
  return new Date(unixDate / 1).toLocaleString("en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    year: "numeric",
    month: "short",
  });
}

export function timestampToString(timestamp: Timestamp) {
  const { seconds, nanoseconds } = timestamp;
  return getDateString(seconds * 1000 + nanoseconds / 1000000);
}

export function getInitials(fullname: string) {
  const nameArr = fullname.split(" ");
  const initals = nameArr.map((item) => item.at(0));

  return initals;
}
