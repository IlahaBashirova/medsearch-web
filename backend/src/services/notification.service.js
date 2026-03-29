const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");
const { getPagination, formatPaginatedResult } = require("../utils/pagination");

function buildRecipientQuery({ userId, role }) {
  if (role === "ADMIN") {
    return {
      $or: [{ recipientId: userId }, { recipientRole: "ADMIN" }]
    };
  }

  return {
    recipientId: userId,
    recipientRole: role || "USER"
  };
}

exports.createNotification = async ({
  recipientId = null,
  recipientRole,
  type,
  title,
  message,
  relatedConversationId = null
}) => {
  return Notification.create({
    recipientId,
    recipientRole,
    type,
    title,
    message,
    relatedConversationId
  });
};

exports.listMine = async ({ userId, role, page, limit, unreadOnly }) => {
  const query = buildRecipientQuery({ userId, role });
  const pagination = getPagination({ page, limit });

  if (unreadOnly === "true") {
    query.isRead = false;
  }

  const [data, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("relatedConversationId", "subject status pharmacyRef pharmacyName"),
    Notification.countDocuments(query),
    Notification.countDocuments({ ...buildRecipientQuery({ userId, role }), isRead: false })
  ]);

  return {
    ...formatPaginatedResult({ data, total, page: pagination.page, limit: pagination.limit }),
    unreadCount
  };
};

exports.markRead = async ({ notificationId, userId, role }) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    ...buildRecipientQuery({ userId, role })
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  notification.isRead = true;
  await notification.save();

  return notification;
};

exports.markAllRead = async ({ userId, role }) => {
  await Notification.updateMany(buildRecipientQuery({ userId, role }), { $set: { isRead: true } });
  return { success: true };
};
