const SupportConversation = require("../models/SupportConversation");
const AppError = require("../utils/AppError");
const { getPagination, formatPaginatedResult } = require("../utils/pagination");

exports.list = async ({ status, priority, page, limit }) => {
  const query = {};
  const pagination = getPagination({ page, limit });

  if (status) {
    query.status = status;
  }

  if (priority) {
    query.priority = priority;
  }

  const [data, total] = await Promise.all([
    SupportConversation.find(query)
      .sort({ lastMessageAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("userId", "name email role"),
    SupportConversation.countDocuments(query)
  ]);

  return formatPaginatedResult({ data, total, page: pagination.page, limit: pagination.limit });
};

exports.create = async ({ userId, subject, message, priority }) => {
  return SupportConversation.create({
    userId,
    subject,
    priority,
    messages: [
      {
        senderRole: "USER",
        senderId: userId,
        message
      }
    ],
    lastMessageAt: new Date()
  });
};

exports.replyAsAdmin = async (conversationId, adminId, message) => {
  const conversation = await SupportConversation.findById(conversationId);

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  conversation.messages.push({
    senderRole: "ADMIN",
    senderId: adminId,
    message
  });
  conversation.lastMessageAt = new Date();
  if (conversation.status === "RESOLVED") {
    conversation.status = "PENDING";
  }
  await conversation.save();

  return conversation;
};

exports.updateStatus = async (conversationId, status) => {
  const conversation = await SupportConversation.findById(conversationId);

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  conversation.status = status;
  await conversation.save();

  return conversation;
};
