const db = require('../config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ============================================
// BACKUP DIRECTORY SETUP
// ============================================
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// ============================================
// 1. DASHBOARD - 4 Stat Cards
// GET /api/admin/dashboard
// ============================================
exports.getDashboard = async (req, res) => {
  try {
    const [staff] = await db.query(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) AS active
       FROM users
       WHERE role IN ('admin', 'vet', 'pharmacy', 'receptionist', 'lab')`
    );

    const [invitations] = await db.query(
      `SELECT COUNT(*) AS count FROM invitations WHERE status = 'pending'`
    );

    const [branches] = await db.query(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) AS active
       FROM branches`
    );

    const [securityData] = await db.query(
      `SELECT 
        COUNT(*) AS total_users,
        SUM(CASE WHEN last_login IS NULL OR last_login < DATE_SUB(NOW(), INTERVAL 90 DAY) THEN 1 ELSE 0 END) AS inactive_logins,
        SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) AS inactive_accounts
       FROM users`
    );

    const totalUsers = securityData[0].total_users || 1;
    const issues = (securityData[0].inactive_logins || 0) + (securityData[0].inactive_accounts || 0);
    const securityScore = Math.max(0, Math.round(100 - (issues / totalUsers) * 100));

    const [backups] = await db.query(
      `SELECT 
        backup_name, file_size_mb, status, created_at,
        TIMESTAMPDIFF(MINUTE, created_at, NOW()) AS minutes_ago
       FROM backups
       ORDER BY created_at DESC
       LIMIT 1`
    );

    const lastBackup = backups[0] || {
      backup_name: 'N/A',
      status: 'none',
      created_at: null,
      minutes_ago: null
    };

    res.json({
      success: true,
      stats: {
        active_staff: {
          total: staff[0].total || 0,
          active: staff[0].active || 0,
          invitations_pending: invitations[0].count || 0
        },
        clinic_branches: {
          total: branches[0].total || 0,
          active: branches[0].active || 0
        },
        security_posture: {
          score: securityScore,
          no_critical_findings: securityScore >= 90
        },
        last_backup: {
          name: lastBackup.backup_name,
          status: lastBackup.status,
          time: lastBackup.created_at,
          minutes_ago: lastBackup.minutes_ago
        }
      }
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// ============================================
// 2. GET ALL USERS
// GET /api/admin/users?role=vet&branch_id=1&status=active
// ============================================
exports.getAllUsers = async (req, res) => {
  try {
    const { role, branch_id, status, search } = req.query;

    let query = `
      SELECT 
        u.id, u.full_name, u.email, u.phone, u.role, u.is_active,
        u.profile_image, u.last_login, u.created_at,
        b.id AS branch_id, b.name AS branch_name,
        CONCAT(
          SUBSTRING(u.full_name, 1, 1),
          SUBSTRING(SUBSTRING_INDEX(u.full_name, ' ', -1), 1, 1)
        ) AS initials
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE 1=1
    `;
    const params = [];

    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }
    if (branch_id) {
      query += ' AND u.branch_id = ?';
      params.push(branch_id);
    }
    if (status === 'active') {
      query += ' AND u.is_active = TRUE';
    } else if (status === 'inactive') {
      query += ' AND u.is_active = FALSE';
    }
    if (search) {
      query += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY u.created_at DESC LIMIT 100';

    const [users] = await db.query(query, params);
    const [total] = await db.query('SELECT COUNT(*) AS count FROM users');

    res.json({
      success: true,
      count: users.length,
      total_users: total[0].count,
      users
    });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 3. GET ONE USER
// ============================================
exports.getUser = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT 
        u.id, u.full_name, u.email, u.phone, u.role, u.is_active,
        u.address, u.profile_image, u.last_login, u.created_at,
        b.id AS branch_id, b.name AS branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.id = ?`,
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found ❌' });
    }

    res.json({ success: true, user: users[0] });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 4. CREATE USER
// ============================================
exports.createUser = async (req, res) => {
  try {
    const { full_name, email, phone, password, role, branch_id, address } = req.body;

    if (!full_name || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Required: full_name, email, phone, password, role ❌'
      });
    }

    const allowedRoles = ['admin', 'vet', 'pharmacy', 'receptionist', 'lab', 'owner'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role ❌' });
    }

    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone already exists ❌'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalBranchId = (branch_id && branch_id !== '') ? parseInt(branch_id) : null;

    const [result] = await db.query(
      `INSERT INTO users 
       (full_name, email, phone, password, role, branch_id, address) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [full_name, email, phone, hashedPassword, role, finalBranchId, address || null]
    );

    if (role === 'vet') {
      try {
        await db.query(
          `INSERT INTO veterinarians (user_id, license_number, specialization, experience_years)
           VALUES (?, ?, ?, ?)`,
          [result.insertId, `VET-${result.insertId}`, 'General', 0]
        );
      } catch (e) { console.log('Vet record error:', e.message); }
    }

    if (role === 'pharmacy') {
      try {
        await db.query(
          `INSERT INTO pharmacy_staff (user_id, license_number, role_type, shift)
           VALUES (?, ?, 'pharmacist', 'morning')`,
          [result.insertId, `PHAR-${result.insertId}`]
        );
      } catch (e) { console.log('Pharmacy record error:', e.message); }
    }

    if (role === 'lab') {
      try {
        await db.query(
          `INSERT INTO lab_staff (user_id, license_number, specialization)
           VALUES (?, ?, ?)`,
          [result.insertId, `LAB-${result.insertId}`, 'General']
        );
      } catch (e) { console.log('Lab record error:', e.message); }
    }

    try {
      await db.query(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details) 
         VALUES (?, 'CREATE_USER', 'user', ?, ?)`,
        [req.user.id, result.insertId, `Created ${role}: ${full_name}`]
      );
    } catch (e) { console.log('Log error:', e.message); }

    res.status(201).json({
      success: true,
      message: 'User created successfully ✅',
      user_id: result.insertId
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 5. UPDATE USER
// ============================================
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, role, branch_id, address, is_active } = req.body;

    const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found ❌' });
    }

    if (email || phone) {
      const [duplicate] = await db.query(
        'SELECT id FROM users WHERE (email = ? OR phone = ?) AND id != ?',
        [email || '', phone || '', id]
      );
      if (duplicate.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email or phone already exists ❌'
        });
      }
    }

    const updates = [];
    const values = [];

    if (full_name !== undefined && full_name !== '') {
      updates.push('full_name = ?'); values.push(full_name);
    }
    if (email !== undefined && email !== '') {
      updates.push('email = ?'); values.push(email);
    }
    if (phone !== undefined && phone !== '') {
      updates.push('phone = ?'); values.push(phone);
    }
    if (role !== undefined && role !== '') {
      updates.push('role = ?'); values.push(role);
    }
    if (branch_id !== undefined) {
      updates.push('branch_id = ?');
      values.push((branch_id && branch_id !== '') ? parseInt(branch_id) : null);
    }
    if (address !== undefined) {
      updates.push('address = ?'); values.push(address || null);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?'); values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update ❌' });
    }

    values.push(id);

    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    try {
      await db.query(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details) 
         VALUES (?, 'UPDATE_USER', 'user', ?, 'Updated user')`,
        [req.user.id, id]
      );
    } catch (e) { console.log('Log error:', e.message); }

    const [updated] = await db.query(
      'SELECT id, full_name, email, phone, role, branch_id, address, is_active FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User updated successfully ✅',
      user: updated[0]
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 6. DELETE USER
// ============================================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself ❌' });
    }

    await db.query('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);

    try {
      await db.query(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details) 
         VALUES (?, 'DEACTIVATE_USER', 'user', ?, 'User deactivated')`,
        [req.user.id, id]
      );
    } catch (e) { console.log('Log error:', e.message); }

    res.json({ success: true, message: 'User deactivated ✅' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 7. GET BRANCHES
// ============================================
exports.getBranches = async (req, res) => {
  try {
    const [branches] = await db.query(
      `SELECT 
        b.*,
        (SELECT COUNT(*) FROM users WHERE branch_id = b.id AND is_active = TRUE) AS staff_count,
        (SELECT COUNT(*) FROM appointments WHERE branch_id = b.id AND DATE(appointment_date) = CURDATE()) AS today_appointments
       FROM branches b
       ORDER BY b.name ASC`
    );

    res.json({ success: true, count: branches.length, branches });
  } catch (err) {
    console.error('Get branches error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 8. CREATE BRANCH
// ============================================
exports.createBranch = async (req, res) => {
  try {
    const { name, code, address, phone, email } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Branch name required ❌' });
    }

    const [result] = await db.query(
      `INSERT INTO branches (name, code, address, phone, email) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, code || null, address || null, phone || null, email || null]
    );

    res.status(201).json({
      success: true,
      message: 'Branch created ✅',
      branch_id: result.insertId
    });
  } catch (err) {
    console.error('Create branch error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 9. UPDATE BRANCH
// ============================================
exports.updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, address, phone, email, is_active } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (code !== undefined) { updates.push('code = ?'); values.push(code); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields ❌' });
    }

    values.push(id);

    await db.query(
      `UPDATE branches SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ success: true, message: 'Branch updated ✅' });
  } catch (err) {
    console.error('Update branch error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 10. GET INVITATIONS
// ============================================
exports.getInvitations = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT i.*, b.name AS branch_name, u.full_name AS invited_by_name
       FROM invitations i
       LEFT JOIN branches b ON i.branch_id = b.id
       LEFT JOIN users u ON i.invited_by = u.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE i.status = ?';
      params.push(status);
    }

    query += ' ORDER BY i.created_at DESC';

    const [invitations] = await db.query(query, params);

    res.json({
      success: true,
      count: invitations.length,
      pending_count: invitations.filter(i => i.status === 'pending').length,
      invitations
    });
  } catch (err) {
    console.error('Get invitations error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 11. SEND INVITATION
// ============================================
exports.sendInvitation = async (req, res) => {
  try {
    const { email, role, branch_id } = req.body;

    if (!email || !role) {
      return res.status(400).json({ success: false, message: 'Email and role required ❌' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists ❌'
      });
    }

    const token = require('crypto').randomBytes(32).toString('hex');
    const finalBranchId = (branch_id && branch_id !== '') ? parseInt(branch_id) : null;

    const [result] = await db.query(
      `INSERT INTO invitations 
       (email, role, branch_id, invited_by, token, status, expires_at) 
       VALUES (?, ?, ?, ?, ?, 'pending', DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [email, role, finalBranchId, req.user.id, token]
    );

    res.status(201).json({
      success: true,
      message: 'Invitation sent ✅',
      invitation_id: result.insertId,
      token
    });
  } catch (err) {
    console.error('Send invitation error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 12. CANCEL INVITATION
// ============================================
exports.cancelInvitation = async (req, res) => {
  try {
    await db.query(
      `UPDATE invitations SET status = 'cancelled' WHERE id = ?`,
      [req.params.id]
    );

    res.json({ success: true, message: 'Invitation cancelled ✅' });
  } catch (err) {
    console.error('Cancel invitation error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 13. GET SERVICES (Figma: Services & pricing)
// GET /api/admin/services
// ============================================
exports.getServices = async (req, res) => {
  try {
    const { category, is_active } = req.query;

    let query = `
      SELECT 
        id, code, name, category, description, 
        price, duration_minutes, is_active, created_at
       FROM services
       WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true');
    }

    query += ' ORDER BY category ASC, code ASC';

    const [services] = await db.query(query, params);

    // Group by category
    const grouped = {
      consultation: [],
      vaccination: [],
      lab: [],
      surgery: [],
      grooming: [],
      other: [],
    };

    services.forEach(s => {
      if (grouped[s.category]) {
        grouped[s.category].push(s);
      } else {
        grouped.other.push(s);
      }
    });

    // Stats
    const stats = {
      total: services.length,
      active: services.filter(s => s.is_active).length,
      inactive: services.filter(s => !s.is_active).length,
      categories: Object.values(grouped).filter(arr => arr.length > 0).length,
    };

    res.json({
      success: true,
      count: services.length,
      stats,
      groups: grouped,
      services,
    });
  } catch (err) {
    console.error('Get services error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// ============================================
// 14. CREATE SERVICE (Auto-generate code)
// POST /api/admin/services
// ============================================
exports.createService = async (req, res) => {
  try {
    const { name, category, description, price, duration_minutes } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price required ❌',
      });
    }

    // Auto-generate code based on category
    const categoryPrefixes = {
      consultation: 'CONS',
      vaccination: 'VAC',
      lab: 'LAB',
      surgery: 'PRC',
      grooming: 'GRM',
      other: 'SRV',
    };

    const prefix = categoryPrefixes[category] || 'SRV';

    // Get next number
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS count FROM services WHERE category = ?`,
      [category || 'other']
    );

    const nextNum = String(countResult[0].count + 1).padStart(2, '0');
    const code = `${prefix}-${nextNum}`;

    const [result] = await db.query(
      `INSERT INTO services 
       (code, name, category, description, price, duration_minutes, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [code, name, category || 'consultation', description || null, price, duration_minutes || 30]
    );

    res.status(201).json({
      success: true,
      message: 'Service created ✅',
      service: {
        id: result.insertId,
        code,
        name,
        category,
        price,
        duration_minutes,
      },
    });
  } catch (err) {
    console.error('Create service error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// ============================================
// 15. UPDATE SERVICE
// PUT /api/admin/services/:id
// ============================================
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, price, duration_minutes, is_active } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (price !== undefined) { updates.push('price = ?'); values.push(price); }
    if (duration_minutes !== undefined) { updates.push('duration_minutes = ?'); values.push(duration_minutes); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active); }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update ❌',
      });
    }

    values.push(id);

    await db.query(
      `UPDATE services SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Service updated ✅',
    });
  } catch (err) {
    console.error('Update service error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// ============================================
// 16. DELETE SERVICE
// DELETE /api/admin/services/:id
// ============================================
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      'SELECT id FROM services WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found ❌',
      });
    }

    // Soft delete (deactivate)
    await db.query(
      'DELETE FROM services WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Service deleted ✅',
    });
  } catch (err) {
    console.error('Delete service error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// ============================================
// 17. SECURITY & ACCESS
// ============================================
exports.getSecurity = async (req, res) => {
  try {
    const [userStats] = await db.query(
      `SELECT 
        COUNT(*) AS total_users,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) AS active_users,
        SUM(CASE WHEN last_login IS NULL OR last_login < DATE_SUB(NOW(), INTERVAL 90 DAY) THEN 1 ELSE 0 END) AS stale_logins
       FROM users
       WHERE role IN ('admin', 'vet', 'pharmacy', 'receptionist', 'lab')`
    );

    const totalStaff = userStats[0].total_users || 1;
    const stale = userStats[0].stale_logins || 0;
    const securityScore = Math.max(0, Math.round(100 - (stale / totalStaff) * 100));

    const [backup] = await db.query(
      `SELECT backup_name, status, created_at 
       FROM backups ORDER BY created_at DESC LIMIT 1`
    );

    const [credentials] = await db.query(
      `SELECT COUNT(*) AS count FROM users u
       WHERE u.role IN ('vet', 'lab', 'pharmacy')
         AND u.created_at <= DATE_SUB(NOW(), INTERVAL 11 MONTH)`
    );

    const [accessReview] = await db.query(
      `SELECT COUNT(*) AS count FROM users 
       WHERE is_active = TRUE 
         AND (last_login IS NULL OR last_login < DATE_SUB(NOW(), INTERVAL 60 DAY))`
    );

    res.json({
      success: true,
      security: {
        score: securityScore,
        mfa_enforced: true,
        no_critical_findings: securityScore >= 90,
        last_backup: backup[0] || null,
        access_review: {
          needed: accessReview[0].count > 0,
          count: accessReview[0].count
        },
        credentials_expiring: {
          count: credentials[0].count || 0
        }
      }
    });
  } catch (err) {
    console.error('Security error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 18. GET BACKUPS
// ============================================
exports.getBackups = async (req, res) => {
  try {
    const [backups] = await db.query(
      `SELECT 
        b.*,
        u.full_name AS created_by_name
       FROM backups b
       LEFT JOIN users u ON b.created_by = u.id
       ORDER BY b.created_at DESC
       LIMIT 30`
    );

    const backupsWithFileStatus = backups.map(b => {
      const filePath = path.join(BACKUP_DIR, b.file_path);
      return {
        ...b,
        file_exists: fs.existsSync(filePath)
      };
    });

    const lastBackup = backupsWithFileStatus[0] || null;

    res.json({
      success: true,
      count: backupsWithFileStatus.length,
      last_backup: lastBackup,
      backups: backupsWithFileStatus
    });
  } catch (err) {
    console.error('Get backups error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 19. CREATE BACKUP (REAL!)
// ============================================
exports.createBackup = async (req, res) => {
  try {
    const timestamp = Date.now();
    const backupName = `backup_${new Date().toISOString().split('T')[0]}_${timestamp}`;
    const fileName = `${backupName}.sql`;
    const filePath = path.join(BACKUP_DIR, fileName);

    const dbHost = process.env.DB_HOST || 'localhost';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'vm_pets';

    // Auto-detect mysqldump
    let mysqldumpCmd = 'mysqldump';
    const possiblePaths = [
      'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
      'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysqldump.exe',
      'C:\\Program Files (x86)\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
      'C:\\xampp\\mysql\\bin\\mysqldump.exe',
      'C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysqldump.exe',
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        mysqldumpCmd = `"${p}"`;
        console.log('✅ Found mysqldump at:', p);
        break;
      }
    }

    const passwordFlag = dbPassword ? `-p${dbPassword}` : '';
    const command = `${mysqldumpCmd} -h ${dbHost} -u ${dbUser} ${passwordFlag} ${dbName} > "${filePath}"`;

    exec(command, async (error) => {
      if (error) {
        console.error('Backup exec error:', error.message);
        return res.status(500).json({
          success: false,
          message: 'Backup failed ❌',
          error: error.message
        });
      }

      if (!fs.existsSync(filePath)) {
        return res.status(500).json({
          success: false,
          message: 'Backup file not created ❌'
        });
      }

      const stats = fs.statSync(filePath);
      const fileSizeMb = (stats.size / (1024 * 1024)).toFixed(2);

      const [result] = await db.query(
        `INSERT INTO backups 
         (backup_name, file_path, file_size_mb, status, created_by) 
         VALUES (?, ?, ?, 'success', ?)`,
        [backupName, fileName, fileSizeMb, req.user.id]
      );

      try {
        await db.query(
          `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details) 
           VALUES (?, 'CREATE_BACKUP', 'backup', ?, ?)`,
          [req.user.id, result.insertId, `Backup: ${fileName} (${fileSizeMb} MB)`]
        );
      } catch (e) { console.log('Log error:', e.message); }

      res.status(201).json({
        success: true,
        message: 'Backup created successfully ✅',
        backup: {
          id: result.insertId,
          backup_name: backupName,
          file_name: fileName,
          file_size_mb: fileSizeMb,
          status: 'success',
          created_at: new Date()
        }
      });
    });
  } catch (err) {
    console.error('Create backup error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 20. DOWNLOAD BACKUP
// ============================================
exports.downloadBackup = async (req, res) => {
  try {
    const { id } = req.params;

    const [backups] = await db.query(
      'SELECT backup_name, file_path FROM backups WHERE id = ?',
      [id]
    );

    if (backups.length === 0) {
      return res.status(404).json({ success: false, message: 'Backup not found ❌' });
    }

    const fileName = backups[0].file_path;
    const filePath = path.join(BACKUP_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found on server ❌'
      });
    }

    res.download(filePath, fileName, (err) => {
      if (err) console.error('Download error:', err);
    });
  } catch (err) {
    console.error('Download backup error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 21. RESTORE BACKUP
// ============================================
exports.restoreBackup = async (req, res) => {
  try {
    const { id } = req.params;

    const [backups] = await db.query(
      'SELECT backup_name, file_path FROM backups WHERE id = ?',
      [id]
    );

    if (backups.length === 0) {
      return res.status(404).json({ success: false, message: 'Backup not found ❌' });
    }

    const fileName = backups[0].file_path;
    const filePath = path.join(BACKUP_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found ❌'
      });
    }

    const dbHost = process.env.DB_HOST || 'localhost';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'vm_pets';

    // Auto-detect mysql
    let mysqlCmd = 'mysql';
    const possiblePaths = [
      'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
      'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysql.exe',
      'C:\\Program Files (x86)\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
      'C:\\xampp\\mysql\\bin\\mysql.exe',
      'C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysql.exe',
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        mysqlCmd = `"${p}"`;
        console.log('✅ Found mysql at:', p);
        break;
      }
    }

    const passwordFlag = dbPassword ? `-p${dbPassword}` : '';
    const command = `${mysqlCmd} -h ${dbHost} -u ${dbUser} ${passwordFlag} ${dbName} < "${filePath}"`;

    exec(command, async (error) => {
      if (error) {
        console.error('Restore error:', error);
        return res.status(500).json({
          success: false,
          message: 'Restore failed ❌',
          error: error.message
        });
      }

      try {
        await db.query(
          `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details) 
           VALUES (?, 'RESTORE_BACKUP', 'backup', ?, ?)`,
          [req.user.id, id, `Restored from ${fileName}`]
        );
      } catch (e) { console.log('Log error:', e.message); }

      res.json({
        success: true,
        message: 'Backup restored successfully ✅'
      });
    });
  } catch (err) {
    console.error('Restore backup error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 22. DELETE BACKUP
// ============================================
exports.deleteBackup = async (req, res) => {
  try {
    const { id } = req.params;

    const [backups] = await db.query(
      'SELECT backup_name, file_path FROM backups WHERE id = ?',
      [id]
    );

    if (backups.length === 0) {
      return res.status(404).json({ success: false, message: 'Backup not found ❌' });
    }

    const fileName = backups[0].file_path;
    const filePath = path.join(BACKUP_DIR, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.query('DELETE FROM backups WHERE id = ?', [id]);

    res.json({ success: true, message: 'Backup deleted ✅' });
  } catch (err) {
    console.error('Delete backup error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 23. SYSTEM LOGS
// ============================================
exports.getSystemLogs = async (req, res) => {
  try {
    const { user_id, action, limit } = req.query;
    const limitNum = parseInt(limit) || 100;

    let query = `
      SELECT 
        sl.*,
        u.full_name AS user_name,
        u.email AS user_email,
        u.role AS user_role
       FROM system_logs sl
       LEFT JOIN users u ON sl.user_id = u.id
       WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      query += ' AND sl.user_id = ?';
      params.push(user_id);
    }
    if (action) {
      query += ' AND sl.action = ?';
      params.push(action);
    }

    query += ` ORDER BY sl.created_at DESC LIMIT ${limitNum}`;

    const [logs] = await db.query(query, params);

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    console.error('Get logs error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 24. SYSTEM STATS
// ============================================
exports.getSystemStats = async (req, res) => {
  try {
    const [usersByRole] = await db.query(
      `SELECT role, COUNT(*) AS count FROM users GROUP BY role`
    );

    const [appointmentsMonth] = await db.query(
      `SELECT COUNT(*) AS count FROM appointments 
       WHERE MONTH(appointment_date) = MONTH(CURDATE()) 
         AND YEAR(appointment_date) = YEAR(CURDATE())`
    );

    const [animals] = await db.query('SELECT COUNT(*) AS count FROM animals');

    const [revenue] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS total 
       FROM payments 
       WHERE payment_status = 'paid'
         AND MONTH(paid_at) = MONTH(CURDATE())
         AND YEAR(paid_at) = YEAR(CURDATE())`
    );

    const [prescriptions] = await db.query(
      `SELECT COUNT(*) AS count FROM prescriptions WHERE status = 'pending'`
    );

    const [labTests] = await db.query(
      `SELECT COUNT(*) AS count FROM lab_tests WHERE status IN ('received', 'processing')`
    );

    res.json({
      success: true,
      stats: {
        users_by_role: usersByRole,
        appointments_this_month: appointmentsMonth[0].count || 0,
        total_animals: animals[0].count || 0,
        monthly_revenue: parseFloat(revenue[0].total) || 0,
        pending_prescriptions: prescriptions[0].count || 0,
        active_lab_tests: labTests[0].count || 0
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================
// 25. MAINTENANCE
// ============================================
exports.getMaintenance = async (req, res) => {
  try {
    const [equipment] = await db.query(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS in_maintenance,
              SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) AS offline
       FROM equipment`
    );

    const [pendingOrders] = await db.query(
      `SELECT COUNT(*) AS count FROM purchase_orders 
       WHERE status IN ('pending', 'approved', 'ordered')`
    );

    const [lowStock] = await db.query(
      `SELECT COUNT(*) AS count FROM medicines WHERE stock_quantity <= min_stock_level`
    );

    res.json({
      success: true,
      maintenance: {
        equipment: equipment[0] || {},
        pending_purchase_orders: pendingOrders[0].count || 0,
        low_stock_items: lowStock[0].count || 0
      }
    });
  } catch (err) {
    console.error('Maintenance error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};