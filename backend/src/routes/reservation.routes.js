const express = require("express");
const router = express.Router();

const reservationController = require("../controllers/reservation.controller");
const auth = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const requireSelfOrAdmin = require("../middleware/requireSelfOrAdmin");
const validate = require("../middleware/validate");
const {
  validateAuthenticatedReservationCreate,
  validateReservationStatus,
  validateReservationUserParam,
  validateReservationIdParam
} = require("../validation/reservation.validation");

/**
 * @swagger
 * /api/reservations/create:
 *   post:
 *     summary: Create reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medicineName
 *               - pharmacyName
 *               - quantity
 *               - price
 *               - address
 *               - phone
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Optional for regular users; derived from the Bearer token unless an admin sends it explicitly.
 *                 example: "699c31334f90e52785c9757b"
 *               pharmacyId:
 *                 type: string
 *                 example: "690eeeed6bffef0bb767f901"
 *               medicineId:
 *                 type: string
 *                 example: "690eeeed6bffef0bb767f902"
 *               medicineName:
 *                 type: string
 *                 example: "Paracetamol"
 *               pharmacyName:
 *                 type: string
 *                 example: "Tebib Apteki"
 *               quantity:
 *                 type: number
 *                 example: 2
 *               price:
 *                 type: number
 *                 example: 8.5
 *               address:
 *                 type: string
 *                 example: "Nizami küçəsi 15, Bakı"
 *               phone:
 *                 type: string
 *                 example: "+994125551122"
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/create",
  auth,
  validate(validateAuthenticatedReservationCreate),
  asyncHandler(reservationController.createReservation)
);

/**
 * @swagger
 * /api/reservations/user/{userId}:
 *   get:
 *     summary: Get user reservations
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *           example: "699c31334f90e52785c9757b"
 *     responses:
 *       200:
 *         description: User reservations fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/user/:userId",
  auth,
  validate(validateReservationUserParam),
  requireSelfOrAdmin((req) => req.params.userId),
  asyncHandler(reservationController.getUserReservations)
);

/**
 * @swagger
 * /api/reservations/{reservationId}:
 *   get:
 *     summary: Get reservation by ID
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         description: Reservation ID
 *         schema:
 *           type: string
 *           example: "690eeeed6bffef0bb767f950"
 *     responses:
 *       200:
 *         description: Reservation fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:reservationId",
  auth,
  validate(validateReservationIdParam),
  asyncHandler(reservationController.getReservationById)
);

/**
 * @swagger
 * /api/reservations/{reservationId}/status:
 *   patch:
 *     summary: Update reservation status
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         description: Reservation ID
 *         schema:
 *           type: string
 *           example: "690eeeed6bffef0bb767f950"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Aktiv, Tamamlandı, Ləğv edildi]
 *                 example: "Tamamlandı"
 *     responses:
 *       200:
 *         description: Reservation status updated successfully
 *       400:
 *         description: Invalid status value
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.patch(
  "/:reservationId/status",
  auth,
  validate(validateReservationStatus),
  asyncHandler(reservationController.updateReservationStatus)
);

/**
 * @swagger
 * /api/reservations/user/{userId}/stats:
 *   get:
 *     summary: Get user reservation stats
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *           example: "699c31334f90e52785c9757b"
 *     responses:
 *       200:
 *         description: Reservation stats fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/user/:userId/stats",
  auth,
  validate(validateReservationUserParam),
  requireSelfOrAdmin((req) => req.params.userId),
  asyncHandler(reservationController.getUserReservationStats)
);

module.exports = router;
