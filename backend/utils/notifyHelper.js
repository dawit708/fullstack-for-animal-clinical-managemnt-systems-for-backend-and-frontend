const db = require('../config/database');

// ============================================
// SEND NOTIFICATION
// ============================================
const sendNotification = async (userId, title, message, type = 'general', link = null) => {
  try {
    if (!userId) return false;

    // Remove emojis from title & message
    const cleanTitle = title.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
    const cleanMessage = message.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();

    await db.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, cleanTitle || title, cleanMessage || message, type, link]
    );
    return true;
  } catch (err) {
    console.error('Notification error:', err.message);
    return false;
  }
};

// ============================================
// SEND TO ROLE
// ============================================
const sendToRole = async (role, title, message, type = 'general') => {
  try {
    const [users] = await db.query(
      'SELECT id FROM users WHERE role = ? AND is_active = TRUE',
      [role]
    );

    if (users.length === 0) return false;

    // Remove emojis
    const cleanTitle = title.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
    const cleanMessage = message.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();

    const values = users.map((u) => [
      u.id,
      cleanTitle || title,
      cleanMessage || message,
      type,
    ]);

    await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ?',
      [values]
    );
    return true;
  } catch (err) {
    console.error('Role broadcast error:', err.message);
    return false;
  }
};

module.exports = {
  sendNotification,
  sendToRole,
};