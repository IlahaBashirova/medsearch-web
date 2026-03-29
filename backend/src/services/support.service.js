const SupportConversation = require("../models/SupportConversation");
const AppError = require("../utils/AppError");
const { getPagination, formatPaginatedResult } = require("../utils/pagination");
const { createNotification } = require("./notification.service");

function buildConversationSubject({ subject, pharmacyName }) {
  if (subject && String(subject).trim()) {
    return String(subject).trim();
  }

  if (pharmacyName && String(pharmacyName).trim()) {
    return `Online Konsultasiya - ${String(pharmacyName).trim()}`;
  }

  return "Online Konsultasiya";
}

async function findLatestConversation({ userId, pharmacyRef, pharmacyName }) {
  const query = { userId };

  if (pharmacyRef) {
    query.pharmacyRef = pharmacyRef;
  } else if (pharmacyName) {
    query.pharmacyName = pharmacyName;
  } else {
    query.pharmacyRef = "";
  }

  return SupportConversation.findOne(query).sort({ updatedAt: -1, createdAt: -1 });
}

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

exports.getMine = async ({ userId, pharmacyRef, pharmacyName }) => {
  const conversation = await findLatestConversation({ userId, pharmacyRef, pharmacyName });
  return conversation || null;
};

exports.create = async ({ userId, subject, message, priority, pharmacyRef, pharmacyName }) => {
  const trimmedPharmacyRef = String(pharmacyRef || "").trim();
  const trimmedPharmacyName = String(pharmacyName || "").trim();
  const trimmedMessage = String(message || "").trim();
  const trimmedSubject = buildConversationSubject({ subject, pharmacyName: trimmedPharmacyName });

  const existingConversation = await findLatestConversation({
    userId,
    pharmacyRef: trimmedPharmacyRef,
    pharmacyName: trimmedPharmacyName
  });

  if (existingConversation) {
    existingConversation.messages.push({
      senderRole: "USER",
      senderId: userId,
      message: trimmedMessage
    });
    existingConversation.subject = trimmedSubject;
    existingConversation.priority = priority || existingConversation.priority;
    existingConversation.pharmacyRef = trimmedPharmacyRef;
    existingConversation.pharmacyName = trimmedPharmacyName;
    existingConversation.status = "PENDING";
    existingConversation.lastMessageAt = new Date();
    await existingConversation.save();
    await createNotification({
      recipientRole: "ADMIN",
      type: "SUPPORT_NEW_MESSAGE",
      title: "Yeni konsultasiya mesajı",
      message: trimmedPharmacyName
        ? `${trimmedPharmacyName} üzrə yeni mesaj var.`
        : "İstifadəçidən yeni konsultasiya mesajı var.",
      relatedConversationId: existingConversation._id
    });

    return existingConversation;
  }

  const createdConversation = await SupportConversation.create({
    userId,
    pharmacyRef: trimmedPharmacyRef,
    pharmacyName: trimmedPharmacyName,
    subject: trimmedSubject,
    priority,
    status: "PENDING",
    messages: [
      {
        senderRole: "USER",
        senderId: userId,
        message: trimmedMessage
      }
    ],
    lastMessageAt: new Date()
  });

  await createNotification({
    recipientRole: "ADMIN",
    type: "SUPPORT_NEW_MESSAGE",
    title: "Yeni konsultasiya mesajı",
    message: trimmedPharmacyName
      ? `${trimmedPharmacyName} üzrə yeni mesaj var.`
      : "İstifadəçidən yeni konsultasiya mesajı var.",
    relatedConversationId: createdConversation._id
  });

  return createdConversation;
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
  conversation.status = "OPEN";
  await conversation.save();
  await createNotification({
    recipientId: conversation.userId,
    recipientRole: "USER",
    type: "SUPPORT_ADMIN_REPLY",
    title: "Konsultasiya cavabı",
    message: "Admin konsultasiya mesajınıza cavab verdi.",
    relatedConversationId: conversation._id
  });

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
