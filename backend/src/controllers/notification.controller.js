const notificationService = require("../services/notification.service");

exports.listMine = async (req, res) => {
  const result = await notificationService.listMine({
    userId: req.user.id,
    role: req.user.role,
    page: req.query.page,
    limit: req.query.limit,
    unreadOnly: req.query.unreadOnly
  });

  res.status(200).json(result);
};

exports.markRead = async (req, res) => {
  const result = await notificationService.markRead({
    notificationId: req.params.notificationId,
    userId: req.user.id,
    role: req.user.role
  });

  res.status(200).json(result);
};

exports.markAllRead = async (req, res) => {
  const result = await notificationService.markAllRead({
    userId: req.user.id,
    role: req.user.role
  });

  res.status(200).json(result);
};
