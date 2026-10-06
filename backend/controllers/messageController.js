const db = require('../config/database');

// ============================================
// 1. GET ALL MESSAGES FOR USER
// GET /api/messages
// ============================================
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const [messages] = await db.query(
      `SELECT 
        m.id, m.subject, m.message, m.priority, m.is_read, m.created_at,
        m.recipient_role,
        u.id AS sender_id, u.full_name AS sender_name, u.role AS sender_role,
        CONCAT(SUBSTRING(u.full_name, 1, 1), 
               SUBSTRING(SUBSTRING_INDEX(u.full_name, ' ', -1), 1, 1)) AS sender_initials
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE (m.recipient_id = ? OR m.recipient_role = ? OR m.recipient_role = 'all')
         AND m.sender_id != ?
       ORDER BY 
         CASE m.priority 
           WHEN 'urgent' THEN 1 
           WHEN 'high' THEN 2 
           ELSE 3 
         END,
         m.created_at DESC
       LIMIT 100`,
      [userId, userRole, userId]
    );

    res.json({
      success: true,
      count: messages.length,
      unread_count: messages.filter(m => !m.is_read).length,
      messages
    });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================================
// 2. SEND MESSAGE
// POST /api/messages
// ============================================
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { recipient_role, recipient_id, subject, message, priority } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message text required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO messages 
       (sender_id, recipient_id, recipient_role, subject, message, priority) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        senderId,
        recipient_id || null,
        recipient_role || 'all',
        subject || null,
        message,
        priority || 'normal'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Message sent ✅',
      message_id: result.insertId
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================================
// 3. MARK AS READ
// PUT /api/messages/:id/read
// ============================================
exports.markAsRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE id = ?',
      [req.params.id]
    );

    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================================
// 4. GET SENT MESSAGES
// GET /api/messages/sent
// ============================================
exports.getSentMessages = async (req, res) => {
  try {
    const [messages] = await db.query(
      `SELECT 
        m.id, m.subject, m.message, m.priority, m.recipient_role, 
        m.created_at, m.is_read,
        u.full_name AS recipient_name
       FROM messages m
       LEFT JOIN users u ON m.recipient_id = u.id
       WHERE m.sender_id = ?
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    console.error('Get sent error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================================
// 5. GET STAFF LIST (for recipient selection)
// GET /api/messages/staff
// ============================================
exports.getStaffList = async (req, res) => {
  try {
    const [staff] = await db.query(
      `SELECT id, full_name, role, email
       FROM users
       WHERE role IN ('admin', 'vet', 'pharmacy', 'receptionist', 'lab')
         AND is_active = TRUE
       ORDER BY role, full_name`
    );

    res.json({ success: true, count: staff.length, staff });
  } catch (err) {
    console.error('Get staff error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};