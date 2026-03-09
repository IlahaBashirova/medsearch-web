const Reservation = require("../models/Reservation");

// Yeni reservation yaratmaq
exports.createReservation = async (req, res) => {
  try {
    const reservation = await Reservation.create({
      userId: req.body.userId,
      pharmacyName: req.body.pharmacyName,
      medicineName: req.body.medicineName,
      quantity: req.body.quantity,
      price: req.body.price,
      address: req.body.address,
      phone: req.body.phone,
    });

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// İstifadəçinin bütün reservation-larını gətirmək
exports.getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      userId: req.params.userId,
    });

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 1) Tək bir reservation-u ID ilə gətirmək
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.reservationId);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation tapılmadı" });
    }

    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2) Reservation statusunu dəyişmək
exports.updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["Aktiv", "Tamamlandı", "Ləğv edildi"];

    if (!status) {
      return res.status(400).json({ message: "Status göndərilməyib" });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Yanlış status dəyəri. Yalnız 'Aktiv', 'Tamamlandı', 'Ləğv edildi' ola bilər",
      });
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.reservationId,
      { status },
      { new: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({ message: "Reservation tapılmadı" });
    }

    res.status(200).json({
      message: "Reservation statusu yeniləndi",
      reservation: updatedReservation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3) İstifadəçinin reservation statistikası
exports.getUserReservationStats = async (req, res) => {
  try {
    const userId = req.params.userId;

    const reservations = await Reservation.find({ userId });

    const active = reservations.filter((item) => item.status === "Aktiv").length;
    const completed = reservations.filter((item) => item.status === "Tamamlandı").length;
    const cancelled = reservations.filter((item) => item.status === "Ləğv edildi").length;

    res.status(200).json({
      total: reservations.length,
      active,
      completed,
      cancelled,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
