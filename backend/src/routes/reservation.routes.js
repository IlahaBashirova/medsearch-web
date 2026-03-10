const express = require("express");
const router = express.Router();

const reservationController = require("../controllers/reservation.controller");

/**
 * @swagger
 * /api/reservations/create:
 *   post:
 *     summary: Create reservation
 *     tags: [Reservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - medicineName
 *               - pharmacyName
 *               - quantity
 *               - price
 *               - address
 *               - phone
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "699c31334f90e52785c9757b"
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
 *       500:
 *         description: Server error
 */
router.post("/create", reservationController.createReservation);

/**
 * @swagger
 * /api/reservations/user/{userId}:
 *   get:
 *     summary: Get user reservations
 *     tags: [Reservations]
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
 *       500:
 *         description: Server error
 */
router.get("/user/:userId", reservationController.getUserReservations);

/**
 * @swagger
 * /api/reservations/{reservationId}:
 *   get:
 *     summary: Get reservation by ID
 *     tags: [Reservations]
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
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.get("/:reservationId", reservationController.getReservationById);

/**
 * @swagger
 * /api/reservations/{reservationId}/status:
 *   patch:
 *     summary: Update reservation status
 *     tags: [Reservations]
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
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.patch("/:reservationId/status", reservationController.updateReservationStatus);

/**
 * @swagger
 * /api/reservations/user/{userId}/stats:
 *   get:
 *     summary: Get user reservation stats
 *     tags: [Reservations]
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
 *       500:
 *         description: Server error
 */
router.get("/user/:userId/stats", reservationController.getUserReservationStats);

module.exports = router;
