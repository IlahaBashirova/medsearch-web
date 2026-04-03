const Reminder = require("../models/Reminder");
const AppError = require("../utils/AppError");

function toScheduledAt(hours = []) {
  const firstHour = Array.isArray(hours) && hours.length ? hours[0] : "09:00";
  const [hourRaw, minuteRaw] = String(firstHour).split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  const scheduledAt = new Date();

  scheduledAt.setSeconds(0, 0);
  scheduledAt.setHours(Number.isFinite(hour) ? hour : 9, Number.isFinite(minute) ? minute : 0, 0, 0);

  return scheduledAt;
}

function formatReminder(reminder) {
  const item = reminder.toObject ? reminder.toObject() : reminder;
  const fallbackHour = item.scheduledAt
    ? new Date(item.scheduledAt).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })
    : "09:00";
  const hours = Array.isArray(item.hours) && item.hours.length ? item.hours : [fallbackHour];

  return {
    id: item._id.toString(),
    name: item.medicineId?.name || item.title,
    dose: item.dose || "",
    timesPerDay: item.timesPerDay || hours.length || 1,
    hours,
    tag: item.tag || "",
    isEnabled: item.isEnabled,
    createdAt: item.createdAt
  };
}

exports.listByUser = async (userId) => {
  const reminders = await Reminder.find({ userId }).sort({ createdAt: -1 }).populate("medicineId", "name");
  return reminders.map(formatReminder);
};

exports.createForUser = async (userId, payload) => {
  const reminder = await Reminder.create({
    userId,
    title: payload.name.trim(),
    dose: payload.dose.trim(),
    scheduledAt: toScheduledAt(payload.hours),
    hours: payload.hours,
    timesPerDay: payload.timesPerDay,
    tag: payload.tag?.trim() || "",
    channel: "IN_APP",
    isEnabled: true
  });

  return formatReminder(reminder);
};

exports.removeForUser = async (userId, reminderId) => {
  const reminder = await Reminder.findOne({ _id: reminderId, userId });

  if (!reminder) {
    throw new AppError("Reminder not found", 404);
  }

  await reminder.deleteOne();
};
