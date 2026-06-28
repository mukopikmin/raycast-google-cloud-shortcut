export const toReadableCron = (cron: string): string => {
  const parts = cron.trim().split(/\s+/);

  if (parts.length !== 5) {
    return cron;
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Every minute
  if (cron === "* * * * *") {
    return `Every minute`;
  }

  // Every N minutes
  if (minute.startsWith("*/") && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return `Every ${minute.slice(2)} minutes`;
  }

  // Every hour
  if (hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return `Every hour at minute ${Number(minute)}`;
  }

  const time = formatTime(hour, minute);

  // Every week
  if (dayOfWeek !== "*") {
    const weekday = WEEKDAYS[Number(dayOfWeek)] ?? dayOfWeek;
    return `Every ${weekday} at ${time}`;
  }

  // Every month
  if (dayOfMonth !== "*") {
    return `On day ${dayOfMonth} of every month at ${time}`;
  }

  // Default → every day
  if (month === "*") {
    return `Every day at ${time}`;
  }

  return cron;
};

const formatTime = (hour: string, minute: string): string => {
  const h = Number(hour);
  const m = Number(minute);
  return `${h}:${m.toString().padStart(2, "0")}`;
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
