const LS_REMINDERS_KEY = "medsearch_reminders_v1";
const LS_BELLS_KEY = "medsearch_bells_v1";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getReminders() {
  return readJson(LS_REMINDERS_KEY, [
    {
      id: "1",
      name: "Metformin",
      dose: "500mg",
      timesPerDay: 2,
      hours: ["08:00", "20:00"],
      tag: "Şəkərli diabet"
    },
    {
      id: "2",
      name: "Lisinopril",
      dose: "10mg",
      timesPerDay: 1,
      hours: ["09:00"],
      tag: "Hipertoniya"
    }
  ]);
}

export function setReminders(rems) {
  writeJson(LS_REMINDERS_KEY, rems);
}

export function getBellStates() {
  return readJson(LS_BELLS_KEY, {});
}

export function setBellStates(states) {
  writeJson(LS_BELLS_KEY, states);
}