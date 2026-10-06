const express = require('express');
const router = express.Router();

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  broadcastToRole
} = require('../controllers/notificationController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All routes need auth
router.use(authMiddleware);

// User's own notifications
router.get('/', getMyNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

// Create (internal/admin)
router.post('/', createNotification);
router.post('/broadcast', roleMiddleware('admin'), broadcastToRole);

module.exports = router;