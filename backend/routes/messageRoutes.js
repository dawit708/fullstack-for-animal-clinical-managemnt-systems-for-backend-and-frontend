const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', messageController.getMessages);
router.post('/', messageController.sendMessage);
router.get('/sent', messageController.getSentMessages);
router.get('/staff', messageController.getStaffList);
router.put('/:id/read', messageController.markAsRead);

module.exports = router;