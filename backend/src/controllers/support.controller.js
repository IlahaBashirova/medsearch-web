const supportService = require("../services/support.service");

exports.list = async (req, res) => {
  const result = await supportService.list(req.query);
  res.status(200).json(result);
};

exports.create = async (req, res) => {
  const result = await supportService.create({
    userId: req.user.id,
    subject: req.body.subject,
    message: req.body.message,
    priority: req.body.priority
  });
  res.status(201).json(result);
};

exports.replyAsAdmin = async (req, res) => {
  const result = await supportService.replyAsAdmin(
    req.params.conversationId,
    req.user.id,
    req.body.message
  );
  res.status(200).json(result);
};

exports.updateStatus = async (req, res) => {
  const result = await supportService.updateStatus(req.params.conversationId, req.body.status);
  res.status(200).json(result);
};
