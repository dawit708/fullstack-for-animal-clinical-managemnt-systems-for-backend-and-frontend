const db = require('../config/database');

// ============================================
// 1. GET MY NOTIFICATIONS
// GET /api/notifications
// ============================================
exports.getMyNotifications = async (req, res) => {
  try {
    const { unread_only } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT 
        n.id, n.title, n.message, n.type, n.is_read, n.created_at,
        TIMESTAMPDIFF(MINUTE, n.created_at, NOW()) AS minutes_ago,
        TIMESTAMPDIFF(HOUR, n.created_at, NOW()) AS hours_ago,
        TIMESTAMPDIFF(DAY, n.created_at, NOW()) AS days_ago
       FROM notifications n
       WHERE n.user_id = ?
    `;
    const params = [userId];

    if (unread_only === 'true') {
      query += ' AND n.is_read = FALSE';
    }

    query += ' ORDER BY n.created_at DESC LIMIT 50';

    const [notifications] = await db.query(query, params);

    // Unread count
    const [count] = await db.query(
      'SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    // Format time display
    const formatted = notifications.map((n) => {
      let time_display = '';
      if (n.minutes_ago < 60) time_display = `${n.minutes_ago}m ago`;
      else if (n.hours_ago < 24) time_display = `${n.hours_ago}h ago`;
      else time_display = `${n.days_ago}d ago`;

      return { ...n, time_display };
    });

    res.json({
      success: true,
      count: formatted.length,
      unread_count: count[0].unread || 0,
      notifications: formatted
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// ============================================
// 2. MARK AS READ
// PUT /api/notifications/:id/read
// ============================================
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Notification marked as read ✅'
    });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// ============================================
// 3. MARK ALL AS READ
// PUT /api/notifications/read-all
// ============================================
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read ✅'
    });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// ============================================
// 4. DELETE NOTIFICATION
// DELETE /api/notifications/:id
// ============================================
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Notification deleted ✅'
    });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// ============================================
// 5. CREATE NOTIFICATION (Internal use)
// POST /api/notifications
// ============================================
exports.createNotification = async (req, res) => {
  try {
    const { user_id, title, message, type, link } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Required: user_id, title, message ❌'
      });
    }

    const [result] = await db.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, title, message, type || 'general', link || null]
    );

    res.status(201).json({
      success: true,
      message: 'Notification created ✅',
      notification_id: result.insertId
    });
  } catch (err) {
    console.error('Create notification error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// ============================================
// 6. BROADCAST TO ROLE (Admin only)
// POST /api/notifications/broadcast
// ============================================
exports.broadcastToRole = async (req, res) => {
  try {
    const { role, title, message, type } = req.body;

    if (!role || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Required: role, title, message ❌'
      });
    }

    // Get all users with this role
    const [users] = await db.query(
      'SELECT id FROM users WHERE role = ? AND is_active = TRUE',
      [role]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found with this role ❌'
      });
    }

    // Insert for each user
    const values = users.map((u) => [u.id, title, message, type || 'general']);
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ?',
      [values]
    );

    res.json({
      success: true,
      message: `Broadcast sent to ${users.length} users ✅`,
      recipients: users.length
    });
  } catch (err) {
    console.error('Broadcast error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};