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

export function timestampToNumber(timestamp: FirebaseFirestore.Timestamp) {
  const { seconds, nanoseconds } = timestamp;
  return seconds * 1000 + nanoseconds / 1000000;
}

export function getInitials(fullname: string) {
  const nameArr = fullname.split(" ");
  const initals = nameArr.map((item) => item.at(0));

  return initals;
}
