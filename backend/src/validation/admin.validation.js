const { isBlank, isEmail, isMongoId, oneOf, isBooleanString } = require("../utils/validation");

const userRoles = ["ADMIN", "PHARMACY_OWNER", "USER"];
const userStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED"];
const pharmacyStatuses = ["ACTIVE", "INACTIVE", "PENDING"];
const reservationStatuses = ["ACTIVE", "COMPLETED", "CANCELLED", "PENDING", "Aktiv", "Tamamlandı", "Ləğv edildi"];
const chatStatuses = ["OPEN", "PENDING", "RESOLVED"];
const chatPriorities = ["LOW", "MEDIUM", "HIGH"];

exports.validateAdminLogin = ({ body }) => {
  const errors = [];

  if (isBlank(body.email) || !isEmail(body.email)) errors.push("Valid email is required");
  if (isBlank(body.password)) errors.push("Password is required");

  return errors;
};

exports.validateUserUpdate = ({ body, params }) => {
  const errors = [];

  if (!isMongoId(params.userId)) errors.push("Valid userId is required");
  if (body.role !== undefined && !oneOf(body.role, userRoles)) errors.push("Invalid user role");
  if (body.status !== undefined && !oneOf(body.status, userStatuses)) errors.push("Invalid user status");

  return errors;
};

exports.validatePharmacyCreate = ({ body }) => {
  const errors = [];

  if (isBlank(body.name)) errors.push("Pharmacy name is required");
  if (body.ownerId !== undefined && body.ownerId !== null && !isMongoId(body.ownerId)) {
    errors.push("Invalid ownerId");
  }
  if (body.status !== undefined && !oneOf(body.status, pharmacyStatuses)) {
    errors.push("Invalid pharmacy status");
  }

  return errors;
};

exports.validatePharmacyUpdate = ({ body, params }) => {
  const errors = [];

  if (!isMongoId(params.pharmacyId)) errors.push("Valid pharmacyId is required");
  if (body.ownerId !== undefined && body.ownerId !== null && !isMongoId(body.ownerId)) {
    errors.push("Invalid ownerId");
  }
  if (body.status !== undefined && !oneOf(body.status, pharmacyStatuses)) {
    errors.push("Invalid pharmacy status");
  }

  return errors;
};

exports.validateMedicineCreate = ({ body }) => {
  const errors = [];

  if (isBlank(body.name)) errors.push("Medicine name is required");
  if (!isMongoId(body.pharmacyId)) errors.push("Valid pharmacyId is required");

  return errors;
};

exports.validateMedicineUpdate = ({ body, params }) => {
  const errors = [];

  if (!isMongoId(params.medicineId)) errors.push("Valid medicineId is required");
  if (body.pharmacyId !== undefined && !isMongoId(body.pharmacyId)) {
    errors.push("Invalid pharmacyId");
  }

  return errors;
};

exports.validateMedicineListQuery = ({ query }) => {
  const errors = [];

  if (query.pharmacyId !== undefined && !isMongoId(query.pharmacyId)) {
    errors.push("Invalid pharmacyId");
  }

  if (query.isActive !== undefined && !isBooleanString(query.isActive)) {
    errors.push("isActive must be true or false");
  }

  return errors;
};

exports.validateReservationStatusUpdate = ({ body, params }) => {
  const errors = [];

  if (!isMongoId(params.reservationId)) errors.push("Valid reservationId is required");
  if (!oneOf(body.status, reservationStatuses)) errors.push("Invalid reservation status");

  return errors;
};

exports.validateReminderCreate = ({ body }) => {
  const errors = [];

  if (!isMongoId(body.userId)) errors.push("Valid userId is required");
  if (body.medicineId !== undefined && body.medicineId !== null && !isMongoId(body.medicineId)) {
    errors.push("Invalid medicineId");
  }
  if (isBlank(body.title)) errors.push("Reminder title is required");
  if (isBlank(body.scheduledAt)) errors.push("scheduledAt is required");

  return errors;
};

exports.validateReminderUpdate = ({ body, params }) => {
  const errors = [];

  if (!isMongoId(params.reminderId)) errors.push("Valid reminderId is required");
  if (body.userId !== undefined && !isMongoId(body.userId)) errors.push("Invalid userId");
  if (body.medicineId !== undefined && body.medicineId !== null && !isMongoId(body.medicineId)) {
    errors.push("Invalid medicineId");
  }

  return errors;
};

exports.validateReminderListQuery = ({ query }) => {
  const errors = [];

  if (query.userId !== undefined && !isMongoId(query.userId)) errors.push("Invalid userId");
  if (query.enabled !== undefined && !isBooleanString(query.enabled)) {
    errors.push("enabled must be true or false");
  }

  return errors;
};

exports.validateSupportCreate = ({ body }) => {
  const errors = [];

  if (isBlank(body.subject)) errors.push("Subject is required");
  if (isBlank(body.message)) errors.push("Message is required");
  if (body.priority !== undefined && !oneOf(body.priority, chatPriorities)) {
    errors.push("Invalid priority");
  }

  return errors;
};

exports.validateSupportReply = ({ body, params }) => {
  const errors = [];

  if (!isMongoId(params.conversationId)) errors.push("Valid conversationId is required");
  if (isBlank(body.message)) errors.push("Message is required");

  return errors;
};

exports.validateSupportStatus = ({ body, params }) => {
  const errors = [];

  if (!isMongoId(params.conversationId)) errors.push("Valid conversationId is required");
  if (!oneOf(body.status, chatStatuses)) errors.push("Invalid support status");

  return errors;
};
