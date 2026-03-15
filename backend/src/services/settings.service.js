const os = require("os");
const Setting = require("../models/Setting");

const getOrCreateSettings = async () => {
  let settings = await Setting.findOne();

  if (!settings) {
    settings = await Setting.create({});
  }

  return settings;
};

exports.getSettings = async () => getOrCreateSettings();

exports.updateSettings = async (payload) => {
  const settings = await getOrCreateSettings();

  if (payload.general) {
    settings.general = { ...settings.general.toObject(), ...payload.general };
  }

  if (payload.notifications) {
    settings.notifications = {
      ...settings.notifications.toObject(),
      ...payload.notifications
    };
  }

  if (payload.email) {
    settings.email = { ...settings.email.toObject(), ...payload.email };
  }

  if (payload.security) {
    settings.security = { ...settings.security.toObject(), ...payload.security };
  }

  await settings.save();
  return settings;
};

exports.getSystemInfo = async () => ({
  nodeVersion: process.version,
  platform: process.platform,
  uptimeSeconds: Math.floor(process.uptime()),
  hostname: os.hostname(),
  memoryUsage: process.memoryUsage()
});

exports.getQuickActions = async () => ({
  actions: [
    { key: "exportUsers", label: "Export users", enabled: true },
    { key: "reviewReservations", label: "Review reservations", enabled: true },
    { key: "resolveSupport", label: "Resolve support tickets", enabled: true }
  ]
});
