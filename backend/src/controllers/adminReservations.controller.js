const adminReservationsService = require("../services/adminReservations.service");

exports.list = async (req, res) => {
  const result = await adminReservationsService.list(req.query);
  res.status(200).json(result);
};

exports.getById = async (req, res) => {
  const result = await adminReservationsService.getById(req.params.reservationId);
  res.status(200).json(result);
};

exports.updateStatus = async (req, res) => {
  const result = await adminReservationsService.updateStatus(
    req.params.reservationId,
    req.body.status
  );
  res.status(200).json(result);
};
