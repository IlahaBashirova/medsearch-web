const { isBlank, isMongoId, oneOf } = require("../utils/validation");

const reservationStatuses = ["ACTIVE", "COMPLETED", "CANCELLED", "PENDING", "Aktiv", "Tamamlandı", "Ləğv edildi"];

exports.validateReservationCreate = ({ body }) => {
  const errors = [];

  if (!isMongoId(body.userId)) errors.push("Valid userId is required");
  if (body.pharmacyId !== undefined && body.pharmacyId !== null && !isMongoId(body.pharmacyId)) {
    errors.push("Invalid pharmacyId");
  }
  if (body.medicineId !== undefined && body.medicineId !== null && !isMongoId(body.medicineId)) {
    errors.push("Invalid medicineId");
  }
  if (isBlank(body.pharmacyName)) errors.push("pharmacyName is required");
  if (isBlank(body.medicineName)) errors.push("medicineName is required");
  if (body.quantity === undefined) errors.push("quantity is required");
  if (body.price === undefined) errors.push("price is required");
  if (isBlank(body.address)) errors.push("address is required");
  if (isBlank(body.phone)) errors.push("phone is required");

  return errors;
};

exports.validateAuthenticatedReservationCreate = ({ body, user }) => {
  const errors = exports.validateReservationCreate({
    body: {
      ...body,
      userId: body.userId || user?.id
    }
  });

  return errors;
};

exports.validateReservationStatus = ({ body, params }) => {
  const errors = [];

  if (!isMongoId(params.reservationId)) errors.push("Valid reservationId is required");
  if (!oneOf(body.status, reservationStatuses)) errors.push("Invalid reservation status");

  return errors;
};

exports.validateReservationUserParam = ({ params }) => {
  const errors = [];

  if (!isMongoId(params.userId)) errors.push("Valid userId is required");

  return errors;
};

exports.validateReservationIdParam = ({ params }) => {
  const errors = [];

  if (!isMongoId(params.reservationId)) errors.push("Valid reservationId is required");

  return errors;
};
