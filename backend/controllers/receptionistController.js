const crypto = require('crypto');
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { sendNotification } = require('../utils/notifyHelper');

// ============================================
// HELPERS
// ============================================

// Index-friendly "is today" condition (DATE(col) = CURDATE() can't use an index)
const isToday = (col) => `(${col} >= CURDATE() AND ${col} < CURDATE() + INTERVAL 1 DAY)`;

// Don't leak internal error messages in production
const serverError = (res, label, err) => {
  console.error(`${label}:`, err);
  return res.status(500).json({
    success: false,
    message: 'Server error',
    ...(process.env.NODE_ENV !== 'production' && { error: err.message })
  });
};

// A failed notification must never break a request whose DB work already succeeded
const safeNotify = async (...args) => {
  try {
    await sendNotification(...args);
  } catch (err) {
    console.error('Notification failed:', err.message);
  }
};

const notifyVet = async (vetId, title, body, link = '/vet/dashboard') => {
  if (!vetId) return;
  try {
    const [rows] = await db.query('SELECT user_id FROM veterinarians WHERE id = ?', [vetId]);
    if (rows.length > 0) {
      await safeNotify(rows[0].user_id, title, body, 'appointment', link);
    }
  } catch (err) {
    console.error('Notify vet failed:', err.message);
  }
};

const escapeLike = (s) => String(s).replace(/[\\%_]/g, '\\$&');

const PAYMENT_METHODS = ['cash', 'telebirr', 'cbe', 'chapa'];

// ============================================
// 1. DASHBOARD - 4 Stat Cards
// GET /api/receptionist/dashboard
// ============================================
exports.getDashboard = async (req, res) => {
  try {
    const [todayAppts] = await db.query(
      `SELECT 
        COUNT(*) AS total,
        COALESCE(SUM(status = 'completed'), 0) AS completed,
        COALESCE(SUM(status IN ('cancelled', 'no_show')), 0) AS changes
       FROM appointments
       WHERE ${isToday('appointment_date')}`
    );

    const [checkedIn] = await db.query(
      `SELECT 
        COUNT(*) AS count,
        COALESCE(AVG(TIMESTAMPDIFF(MINUTE, check_in_time, NOW())), 0) AS avg_wait
       FROM appointments
       WHERE status = 'checked_in'
         AND ${isToday('appointment_date')}`
    );

    // Outstanding = total minus what has already been paid (partial invoices)
    const [unpaid] = await db.query(
      `SELECT 
        COUNT(*) AS count,
        COALESCE(SUM(i.total - COALESCE(p.paid, 0)), 0) AS outstanding
       FROM invoices i
       LEFT JOIN (
         SELECT invoice_id, SUM(amount) AS paid
         FROM payments WHERE payment_status = 'paid'
         GROUP BY invoice_id
       ) p ON p.invoice_id = i.id
       WHERE i.status IN ('unpaid', 'partial')`
    );

    const [newRegs] = await db.query(
      `SELECT COUNT(*) AS count
       FROM users
       WHERE role = 'owner'
         AND ${isToday('created_at')}`
    );

    const [receptionist] = await db.query(
      `SELECT u.full_name, u.profile_image, b.name AS branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      receptionist: receptionist[0] || {},
      stats: {
        appointments_today: {
          total: Number(todayAppts[0].total) || 0,
          completed: Number(todayAppts[0].completed) || 0,
          changes: Number(todayAppts[0].changes) || 0
        },
        checked_in: {
          count: Number(checkedIn[0].count) || 0,
          average_wait_minutes: Math.round(Number(checkedIn[0].avg_wait)) || 0
        },
        unpaid_invoices: {
          count: Number(unpaid[0].count) || 0,
          outstanding_amount: parseFloat(unpaid[0].outstanding) || 0
        },
        new_registrations: {
          count: Number(newRegs[0].count) || 0,
          // Same set as "checked in today": patients waiting for a consultation
          awaiting_consultation: Number(checkedIn[0].count) || 0
        }
      }
    });
  } catch (err) {
    return serverError(res, 'Receptionist dashboard error', err);
  }
};

// ============================================
// 2. CHECK-IN QUEUE
// GET /api/receptionist/check-in-queue
// ============================================
exports.getCheckInQueue = async (req, res) => {
  try {
    const { filter } = req.query;

    let statusFilter = '';
    if (filter === 'waiting') {
      statusFilter = "AND a.status = 'checked_in'";
    } else if (filter === 'with_clinician') {
      statusFilter = "AND a.status = 'in_consultation'";
    } else if (filter === 'expected') {
      statusFilter = "AND a.status IN ('pending', 'confirmed')";
    }

    const [queue] = await db.query(
      `SELECT 
        a.id AS appointment_id,
        a.appointment_date, a.reason, a.status, a.check_in_time,
        TIMESTAMPDIFF(MINUTE, a.check_in_time, NOW()) AS wait_minutes,
        an.id AS animal_id, an.name AS animal_name, an.species,
        an.breed, an.photo AS animal_photo,
        u.id AS owner_id, u.full_name AS owner_name, u.phone AS owner_phone,
        CONCAT(
          SUBSTRING(u.full_name, 1, 1),
          SUBSTRING(SUBSTRING_INDEX(u.full_name, ' ', -1), 1, 1)
        ) AS owner_initials,
        s.name AS service_name,
        vst.full_name AS vet_name,
        CASE
          WHEN a.status = 'in_consultation' THEN 'with_clinician'
          WHEN a.status = 'checked_in' 
            AND TIMESTAMPDIFF(MINUTE, a.check_in_time, NOW()) > 30 THEN 'triage_now'
          WHEN a.status = 'checked_in' THEN 'checked_in'
          WHEN a.status IN ('pending', 'confirmed') THEN 'expected'
          ELSE a.status
        END AS display_status
       FROM appointments a
       JOIN animals an ON a.animal_id = an.id
       JOIN users u ON a.owner_id = u.id
       LEFT JOIN services s ON a.service_id = s.id
       LEFT JOIN veterinarians v ON a.vet_id = v.id
       LEFT JOIN users vst ON v.user_id = vst.id
       WHERE ${isToday('a.appointment_date')}
         AND a.status NOT IN ('completed', 'cancelled', 'no_show')
         ${statusFilter}
       ORDER BY 
         CASE a.status
           WHEN 'in_consultation' THEN 1
           WHEN 'checked_in' THEN 2
           WHEN 'confirmed' THEN 3
           WHEN 'pending' THEN 4
           ELSE 5
         END,
         COALESCE(a.check_in_time, a.appointment_date) ASC`
    );

    const [counts] = await db.query(
      `SELECT 
        COUNT(*) AS all_count,
        COALESCE(SUM(status = 'checked_in'), 0) AS waiting,
        COALESCE(SUM(status = 'in_consultation'), 0) AS with_clinician,
        COALESCE(SUM(status IN ('pending', 'confirmed')), 0) AS expected
       FROM appointments
       WHERE ${isToday('appointment_date')}
         AND status NOT IN ('completed', 'cancelled', 'no_show')`
    );

    res.json({
      success: true,
      count: queue.length,
      filter_counts: {
        all: Number(counts[0].all_count) || 0,
        waiting: Number(counts[0].waiting) || 0,
        with_clinician: Number(counts[0].with_clinician) || 0,
        expected: Number(counts[0].expected) || 0
      },
      queue
    });
  } catch (err) {
    return serverError(res, 'Check-in queue error', err);
  }
};

// ============================================
// 3. CHECK-IN PATIENT
// PUT /api/receptionist/check-in/:id
// Notifies: Vet
// ============================================
exports.checkInPatient = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      `SELECT a.id, a.status, a.vet_id,
              an.name AS animal_name,
              u.full_name AS owner_name
       FROM appointments a
       JOIN animals an ON a.animal_id = an.id
       JOIN users u ON a.owner_id = u.id
       WHERE a.id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found ❌' });
    }

    // Only pending/confirmed appointments can be checked in
    if (!['pending', 'confirmed'].includes(existing[0].status)) {
      return res.status(400).json({
        success: false,
        message: existing[0].status === 'checked_in'
          ? 'Already checked in ❌'
          : `Cannot check in an appointment that is ${existing[0].status} ❌`
      });
    }

    // Status guard in WHERE prevents a double check-in race
    const [upd] = await db.query(
      `UPDATE appointments 
       SET status = 'checked_in', check_in_time = NOW() 
       WHERE id = ? AND status IN ('pending', 'confirmed')`,
      [id]
    );

    if (upd.affectedRows === 0) {
      return res.status(409).json({
        success: false,
        message: 'Appointment status just changed, please refresh ❌'
      });
    }

    await notifyVet(
      existing[0].vet_id,
      'ታካሚ ተመዝግቧል 👤',
      `${existing[0].animal_name} (${existing[0].owner_name}) ይጠብቃል`
    );

    res.json({
      success: true,
      message: 'Patient checked in successfully ✅',
      check_in_time: new Date().toISOString()
    });
  } catch (err) {
    return serverError(res, 'Check-in error', err);
  }
};

// ============================================
// 4. TODAY'S APPOINTMENTS
// GET /api/receptionist/appointments
// ============================================
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'date must be YYYY-MM-DD ❌'
      });
    }

    // Let MySQL decide "today" so server timezone and DB timezone never disagree
    const dateExpr = date ? '?' : 'CURDATE()';
    const params = date ? [date] : [];

    let query = `
      SELECT 
        a.*,
        an.name AS animal_name, an.species, an.photo AS animal_photo,
        u.full_name AS owner_name, u.phone AS owner_phone,
        vst.full_name AS vet_name,
        s.name AS service_name, s.price AS service_price
      FROM appointments a
      JOIN animals an ON a.animal_id = an.id
      JOIN users u ON a.owner_id = u.id
      LEFT JOIN veterinarians v ON a.vet_id = v.id
      LEFT JOIN users vst ON v.user_id = vst.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.appointment_date >= ${dateExpr}
        AND a.appointment_date < ${dateExpr} + INTERVAL 1 DAY
    `;
    if (date) params.push(date);

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.appointment_date ASC';

    const [appointments] = await db.query(query, params);

    res.json({
      success: true,
      date: date || new Date().toISOString().split('T')[0],
      count: appointments.length,
      appointments
    });
  } catch (err) {
    return serverError(res, 'All appointments error', err);
  }
};

// ============================================
// 5. REGISTER OWNER & ANIMAL
// POST /api/receptionist/register
// ============================================
exports.registerOwnerAndAnimal = async (req, res) => {
  const {
    owner_full_name, owner_email, owner_phone, owner_address, owner_password,
    animal_name, animal_species, animal_breed, animal_age_months,
    animal_gender, animal_color, animal_weight_kg, animal_microchip_id
  } = req.body;

  // Validate BEFORE opening a connection/transaction
  if (!owner_full_name || !owner_phone) {
    return res.status(400).json({
      success: false,
      message: 'Owner name and phone required ❌'
    });
  }

  if (!animal_name || !animal_species || !animal_gender) {
    return res.status(400).json({
      success: false,
      message: 'Animal name, species, gender required ❌'
    });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let ownerId;
    let tempPassword = null;
    let isNewOwner = false;

    // Only match real owners (never staff accounts)
    const [existingOwner] = await connection.query(
      `SELECT id FROM users 
       WHERE role = 'owner' 
         AND (phone = ? OR (? IS NOT NULL AND email = ?))`,
      [owner_phone, owner_email || null, owner_email || null]
    );

    if (existingOwner.length > 0) {
      ownerId = existingOwner[0].id;
    } else {
      // No hardcoded default password: use the supplied one or a random temp one
      tempPassword = owner_password ? null : crypto.randomBytes(4).toString('hex');
      const hashedPassword = await bcrypt.hash(owner_password || tempPassword, 10);

      const [result] = await connection.query(
        `INSERT INTO users 
         (full_name, email, phone, password, role, address) 
         VALUES (?, ?, ?, ?, 'owner', ?)`,
        [
          owner_full_name,
          owner_email || null,
          owner_phone,
          hashedPassword,
          owner_address || null
        ]
      );
      ownerId = result.insertId;
      isNewOwner = true;
    }

    const [animalResult] = await connection.query(
      `INSERT INTO animals 
       (owner_id, name, species, breed, age_months, gender, 
        color, weight_kg, microchip_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ownerId, animal_name, animal_species, animal_breed || null,
        animal_age_months || null, animal_gender, animal_color || null,
        animal_weight_kg || null, animal_microchip_id || null
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: isNewOwner
        ? 'Owner and animal registered successfully ✅'
        : 'Animal added to existing owner ✅',
      owner: {
        id: ownerId,
        full_name: owner_full_name,
        phone: owner_phone,
        is_new: isNewOwner,
        // Shown once so the receptionist can hand it to the owner
        ...(tempPassword && { temp_password: tempPassword })
      },
      animal: {
        id: animalResult.insertId,
        name: animal_name,
        species: animal_species
      }
    });
  } catch (err) {
    await connection.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Duplicate phone, email or microchip ID ❌'
      });
    }
    return serverError(res, 'Register error', err);
  } finally {
    connection.release();
  }
};

// ============================================
// 6. SEARCH OWNER
// GET /api/receptionist/search-owner?q=maya
// ============================================
exports.searchOwner = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();

    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query required ❌' });
    }

    const like = `%${escapeLike(q)}%`;

    const [owners] = await db.query(
      `SELECT 
        u.id, u.full_name, u.email, u.phone, u.address,
        (SELECT COUNT(*) FROM animals WHERE owner_id = u.id) AS animal_count
       FROM users u
       WHERE u.role = 'owner'
         AND (u.full_name LIKE ? OR u.phone LIKE ? OR u.email LIKE ?)
       ORDER BY u.full_name ASC
       LIMIT 10`,
      [like, like, like]
    );

    res.json({ success: true, count: owners.length, owners });
  } catch (err) {
    return serverError(res, 'Search owner error', err);
  }
};

// ============================================
// 7. GET OWNER DETAIL
// GET /api/receptionist/owners/:id
// ============================================
exports.getOwnerDetail = async (req, res) => {
  try {
    const [owners] = await db.query(
      `SELECT id, full_name, email, phone, address, created_at
       FROM users WHERE id = ? AND role = 'owner'`,
      [req.params.id]
    );

    if (owners.length === 0) {
      return res.status(404).json({ success: false, message: 'Owner not found ❌' });
    }

    const [animals] = await db.query(
      `SELECT * FROM animals WHERE owner_id = ? ORDER BY created_at DESC`,
      [req.params.id]
    );

    const [invoices] = await db.query(
      `SELECT * FROM invoices WHERE owner_id = ? ORDER BY created_at DESC LIMIT 10`,
      [req.params.id]
    );

    res.json({ success: true, owner: owners[0], animals, invoices });
  } catch (err) {
    return serverError(res, 'Owner detail error', err);
  }
};

// ============================================
// 8. UNPAID INVOICES
// GET /api/receptionist/unpaid-invoices
// ============================================
exports.getUnpaidInvoices = async (req, res) => {
  try {
    const [invoices] = await db.query(
      `SELECT 
        i.id, i.invoice_number, i.total, i.status, 
        i.due_date, i.created_at,
        COALESCE(p.paid, 0) AS amount_paid,
        (i.total - COALESCE(p.paid, 0)) AS balance,
        u.id AS owner_id, u.full_name AS owner_name, u.phone AS owner_phone,
        an.name AS animal_name, an.species
       FROM invoices i
       JOIN users u ON i.owner_id = u.id
       LEFT JOIN animals an ON i.animal_id = an.id
       LEFT JOIN (
         SELECT invoice_id, SUM(amount) AS paid
         FROM payments WHERE payment_status = 'paid'
         GROUP BY invoice_id
       ) p ON p.invoice_id = i.id
       WHERE i.status IN ('unpaid', 'partial')
       ORDER BY i.created_at DESC`
    );

    // Outstanding is the remaining balance, not the full total
    const totalOutstanding = invoices.reduce(
      (sum, inv) => sum + parseFloat(inv.balance), 0
    );

    res.json({
      success: true,
      count: invoices.length,
      total_outstanding: parseFloat(totalOutstanding.toFixed(2)),
      invoices
    });
  } catch (err) {
    return serverError(res, 'Unpaid invoices error', err);
  }
};

// ============================================
// 9. CREATE INVOICE
// POST /api/receptionist/invoices
// ============================================
exports.createInvoice = async (req, res) => {
  const {
    owner_id, animal_id, appointment_id,
    items, tax, discount, notes
  } = req.body;

  if (!owner_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Owner ID and items required ❌'
    });
  }

  // Validate every line item
  const cleanItems = [];
  for (const item of items) {
    const unitPrice = parseFloat(item.unit_price);
    const quantity = parseInt(item.quantity, 10);
    if (!Number.isFinite(unitPrice) || unitPrice < 0 || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Each item needs a valid unit_price and quantity ❌'
      });
    }
    cleanItems.push({
      description: item.description || item.name || 'Item',
      service_id: item.service_id || null,
      quantity,
      unit_price: unitPrice,
      total: Math.round(unitPrice * quantity * 100) / 100
    });
  }

  const round2 = (n) => Math.round(n * 100) / 100;
  const subtotal = round2(cleanItems.reduce((s, i) => s + i.total, 0));
  // tax = 0 is a valid value, so check for undefined/null, not truthiness
  const taxAmount = tax !== undefined && tax !== null && tax !== ''
    ? round2(parseFloat(tax))
    : round2(subtotal * 0.15);
  const discountAmount = discount ? round2(parseFloat(discount)) : 0;

  if (!Number.isFinite(taxAmount) || !Number.isFinite(discountAmount) ||
      taxAmount < 0 || discountAmount < 0 || discountAmount > subtotal + taxAmount) {
    return res.status(400).json({ success: false, message: 'Invalid tax or discount ❌' });
  }

  const total = round2(subtotal + taxAmount - discountAmount);

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Temporary unique number, replaced from the auto-increment id.
    // (COUNT(*)+1 produced duplicate numbers under concurrent requests.)
    const tempNumber = `TMP-${crypto.randomBytes(6).toString('hex')}`;

    const [result] = await connection.query(
      `INSERT INTO invoices 
       (invoice_number, owner_id, animal_id, appointment_id,
        subtotal, tax, discount, total, status, notes, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', ?, ?)`,
      [
        tempNumber, owner_id, animal_id || null, appointment_id || null,
        subtotal, taxAmount, discountAmount, total,
        notes || null, req.user.id
      ]
    );

    const invoiceId = result.insertId;
    const invoiceNumber = `INV-${10984 + invoiceId}`;

    await connection.query(
      'UPDATE invoices SET invoice_number = ? WHERE id = ?',
      [invoiceNumber, invoiceId]
    );

    // Line items were never saved in the original code.
    // ASSUMPTION: table `invoice_items(invoice_id, description, quantity, unit_price, total)`
    await connection.query(
      `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total)
       VALUES ?`,
      [cleanItems.map(i => [invoiceId, i.description, i.quantity, i.unit_price, i.total])]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Invoice created ✅',
      invoice: {
        id: invoiceId,
        invoice_number: invoiceNumber,
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total,
        status: 'unpaid',
        items: cleanItems
      }
    });
  } catch (err) {
    await connection.rollback();
    return serverError(res, 'Create invoice error', err);
  } finally {
    connection.release();
  }
};

// ============================================
// 10. PROCESS PAYMENT
// POST /api/receptionist/payments
// Notifies: Owner
// ============================================
exports.processPayment = async (req, res) => {
  const { invoice_id, payment_method, transaction_id } = req.body;
  const amount = parseFloat(req.body.amount);

  if (!invoice_id || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'invoice_id and a positive amount required ❌'
    });
  }

  const method = payment_method || 'cash';
  if (!PAYMENT_METHODS.includes(method)) {
    return res.status(400).json({
      success: false,
      message: `payment_method must be one of: ${PAYMENT_METHODS.join(', ')} ❌`
    });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Lock the invoice row so two simultaneous payments can't both pass the checks
    const [invoices] = await connection.query(
      `SELECT id, total, status, owner_id, invoice_number
       FROM invoices WHERE id = ? FOR UPDATE`,
      [invoice_id]
    );

    if (invoices.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Invoice not found ❌' });
    }

    const invoice = invoices[0];

    if (invoice.status === 'paid') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Invoice already paid ❌' });
    }

    // Status must come from ALL payments, not just this one
    const [paidRows] = await connection.query(
      `SELECT COALESCE(SUM(amount), 0) AS paid
       FROM payments WHERE invoice_id = ? AND payment_status = 'paid'`,
      [invoice_id]
    );

    const alreadyPaid = parseFloat(paidRows[0].paid);
    const total = parseFloat(invoice.total);
    const balance = Math.round((total - alreadyPaid) * 100) / 100;

    if (amount > balance) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Amount exceeds remaining balance (${balance}) ❌`
      });
    }

    const [result] = await connection.query(
      `INSERT INTO payments 
       (invoice_id, amount, payment_method, payment_status, 
        transaction_id, paid_at, received_by) 
       VALUES (?, ?, ?, 'paid', ?, NOW(), ?)`,
      [invoice_id, amount, method, transaction_id || null, req.user.id]
    );

    const newBalance = Math.round((balance - amount) * 100) / 100;
    const newStatus = newBalance <= 0 ? 'paid' : 'partial';

    await connection.query(
      'UPDATE invoices SET status = ? WHERE id = ?',
      [newStatus, invoice_id]
    );

    await connection.commit();

    await safeNotify(
      invoice.owner_id,
      'ክፍያ ተቀብሏል ✅',
      `ክፍያዎ በተሳካ ሁኔታ ተቀብሏል (${amount} ብር)`,
      'payment',
      '/owner/invoices'
    );

    res.status(201).json({
      success: true,
      message: 'Payment processed ✅',
      payment_id: result.insertId,
      invoice_status: newStatus,
      remaining_balance: newBalance
    });
  } catch (err) {
    await connection.rollback();
    return serverError(res, 'Process payment error', err);
  } finally {
    connection.release();
  }
};

// ============================================
// 11. GET INVOICE DETAIL
// GET /api/receptionist/invoices/:id
// ============================================
exports.getInvoiceDetail = async (req, res) => {
  try {
    const [invoices] = await db.query(
      `SELECT 
        i.*,
        u.full_name AS owner_name, u.phone AS owner_phone,
        an.name AS animal_name, an.species, an.breed
       FROM invoices i
       JOIN users u ON i.owner_id = u.id
       LEFT JOIN animals an ON i.animal_id = an.id
       WHERE i.id = ?`,
      [req.params.id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found ❌' });
    }

    const [payments] = await db.query(
      `SELECT * FROM payments WHERE invoice_id = ? ORDER BY created_at DESC`,
      [req.params.id]
    );

    // Same assumption as createInvoice: invoice_items table
    const [items] = await db.query(
      `SELECT * FROM invoice_items WHERE invoice_id = ?`,
      [req.params.id]
    );

    const amountPaid = payments
      .filter(p => p.payment_status === 'paid')
      .reduce((s, p) => s + parseFloat(p.amount || 0), 0);

    res.json({
      success: true,
      invoice: {
        ...invoices[0],
        amount_paid: parseFloat(amountPaid.toFixed(2)),
        balance: parseFloat((parseFloat(invoices[0].total) - amountPaid).toFixed(2))
      },
      items,
      payments
    });
  } catch (err) {
    return serverError(res, 'Invoice detail error', err);
  }
};

// ============================================
// 12. NEW REGISTRATIONS
// GET /api/receptionist/new-registrations
// ============================================
exports.getNewRegistrations = async (req, res) => {
  try {
    const [registrations] = await db.query(
      `SELECT 
        u.id, u.full_name, u.email, u.phone, u.address, u.created_at,
        (u.created_at >= CURDATE()) AS is_today,
        (SELECT COUNT(*) FROM animals WHERE owner_id = u.id) AS animal_count,
        (SELECT COUNT(*) FROM appointments
          WHERE owner_id = u.id 
            AND status = 'checked_in'
            AND ${isToday('appointment_date')}) AS awaiting_consultation
       FROM users u
       WHERE u.role = 'owner'
         AND u.created_at >= CURDATE() - INTERVAL 7 DAY
       ORDER BY u.created_at DESC
       LIMIT 20`
    );

    res.json({
      success: true,
      count: registrations.length,
      today_count: registrations.filter(r => Number(r.is_today) === 1).length,
      registrations
    });
  } catch (err) {
    return serverError(res, 'New registrations error', err);
  }
};

// ============================================
// 13. RESCHEDULE APPOINTMENT
// PUT /api/receptionist/reschedule/:id
// Notifies: Owner + old Vet (+ new Vet if changed)
// ============================================
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_date, new_vet_id, reason } = req.body;

    if (!new_date) {
      return res.status(400).json({ success: false, message: 'new_date required ❌' });
    }

    const parsed = new Date(new_date);
    if (Number.isNaN(parsed.getTime())) {
      return res.status(400).json({ success: false, message: 'new_date is not a valid date ❌' });
    }
    if (parsed.getTime() < Date.now() - 5 * 60 * 1000) {
      return res.status(400).json({ success: false, message: 'new_date cannot be in the past ❌' });
    }

    const [existing] = await db.query(
      `SELECT a.id, a.owner_id, a.vet_id, a.status, a.appointment_date,
              an.name AS animal_name
       FROM appointments a
       JOIN animals an ON a.animal_id = an.id
       WHERE a.id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found ❌' });
    }

    if (['completed', 'cancelled', 'no_show', 'in_consultation'].includes(existing[0].status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule an appointment that is ${existing[0].status} ❌`
      });
    }

    await db.query(
      `UPDATE appointments 
       SET appointment_date = ?,
           vet_id = COALESCE(?, vet_id),
           reason = COALESCE(?, reason),
           status = 'confirmed',
           check_in_time = NULL
       WHERE id = ?`,
      [new_date, new_vet_id || null, reason || null, id]
    );

    await safeNotify(
      existing[0].owner_id,
      'ቀጠሮ ተቀይሯል 📅',
      `የ${existing[0].animal_name} ቀጠሮ ወደ ${new_date} ተቀይሯል`,
      'appointment',
      '/owner/appointments'
    );

    const msg = `${existing[0].animal_name} ቀጠሮ ወደ ${new_date} ተቀይሯል`;
    const vetChanged = new_vet_id && Number(new_vet_id) !== Number(existing[0].vet_id);

    // Previous vet always hears about it; a newly assigned vet must too
    await notifyVet(existing[0].vet_id, 'ቀጠሮ ተቀይሯል 📅', msg);
    if (vetChanged) {
      await notifyVet(new_vet_id, 'አዲስ ቀጠሮ ተመድቧል 📅', msg);
    }

    res.json({
      success: true,
      message: 'Appointment rescheduled ✅',
      new_date
    });
  } catch (err) {
    return serverError(res, 'Reschedule error', err);
  }
};

// ============================================
// 14. CREATE WALK-IN APPOINTMENT
// POST /api/receptionist/walk-in
// Notifies: Vet
// ============================================
exports.createWalkIn = async (req, res) => {
  try {
    const { owner_id, animal_id, vet_id, reason, service_id } = req.body;

    if (!owner_id || !animal_id || !vet_id) {
      return res.status(400).json({
        success: false,
        message: 'owner_id, animal_id, vet_id required ❌'
      });
    }

    // The animal must belong to this owner
    const [animal] = await db.query(
      'SELECT id, name FROM animals WHERE id = ? AND owner_id = ?',
      [animal_id, owner_id]
    );

    if (animal.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found for this owner ❌'
      });
    }

    const [result] = await db.query(
      `INSERT INTO appointments 
       (owner_id, animal_id, vet_id, service_id, appointment_date, 
        reason, status, check_in_time) 
       VALUES (?, ?, ?, ?, NOW(), ?, 'checked_in', NOW())`,
      [owner_id, animal_id, vet_id, service_id || null, reason || 'Walk-in']
    );

    await notifyVet(
      vet_id,
      '🚨 Walk-in Patient',
      `${animal[0].name} checked in as walk-in`
    );

    res.status(201).json({
      success: true,
      message: 'Walk-in appointment created ✅',
      appointment_id: result.insertId
    });
  } catch (err) {
    return serverError(res, 'Walk-in error', err);
  }
};

// ============================================
// 15. GET ALL PAYMENTS
// GET /api/receptionist/payments
// ============================================
exports.getAllPayments = async (req, res) => {
  try {
    const { status, method, date_from, date_to } = req.query;

    let query = `
      SELECT 
        p.id, p.amount, p.payment_method, p.payment_status,
        p.transaction_id, p.paid_at, p.created_at,
        i.id AS invoice_id, i.invoice_number, i.total AS invoice_total,
        u.id AS owner_id, u.full_name AS owner_name, u.phone AS owner_phone,
        an.name AS animal_name, an.species,
        rcv.full_name AS received_by_name
       FROM payments p
       JOIN invoices i ON p.invoice_id = i.id
       JOIN users u ON i.owner_id = u.id
       LEFT JOIN animals an ON i.animal_id = an.id
       LEFT JOIN users rcv ON p.received_by = rcv.id
       WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND p.payment_status = ?';
      params.push(status);
    }
    if (method) {
      query += ' AND p.payment_method = ?';
      params.push(method);
    }
    if (date_from) {
      query += ' AND p.created_at >= ?';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND p.created_at < ? + INTERVAL 1 DAY';
      params.push(date_to);
    }

    query += ' ORDER BY p.created_at DESC LIMIT 200';

    const [payments] = await db.query(query, params);

    const paid = payments.filter(p => p.payment_status === 'paid');

    const totalReceived = paid.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    // Counts per method (paid only, so it matches total_received)
    const byMethod = PAYMENT_METHODS.reduce((acc, m) => {
      acc[m] = paid.filter(p => p.payment_method === m).length;
      return acc;
    }, {});

    res.json({
      success: true,
      count: payments.length,
      total_received: parseFloat(totalReceived.toFixed(2)),
      by_method: byMethod,
      payments
    });
  } catch (err) {
    return serverError(res, 'Get payments error', err);
  }
};

// ============================================
// 16. GET PAYMENT STATS
// GET /api/receptionist/payments/stats
// ============================================
exports.getPaymentStats = async (req, res) => {
  try {
    const [todayStats] = await db.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
       FROM payments
       WHERE payment_status = 'paid'
         AND ${isToday('paid_at')}`
    );

    // Mode 1 = weeks start Monday; the default mode can mis-handle year boundaries
    const [weekStats] = await db.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
       FROM payments
       WHERE payment_status = 'paid'
         AND YEARWEEK(paid_at, 1) = YEARWEEK(CURDATE(), 1)`
    );

    const [monthStats] = await db.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
       FROM payments
       WHERE payment_status = 'paid'
         AND paid_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
         AND paid_at < DATE_FORMAT(CURDATE(), '%Y-%m-01') + INTERVAL 1 MONTH`
    );

    const [methodStats] = await db.query(
      `SELECT payment_method, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
       FROM payments
       WHERE payment_status = 'paid'
       GROUP BY payment_method`
    );

    res.json({
      success: true,
      stats: {
        today: {
          count: Number(todayStats[0].count) || 0,
          total: parseFloat(todayStats[0].total) || 0
        },
        this_week: {
          count: Number(weekStats[0].count) || 0,
          total: parseFloat(weekStats[0].total) || 0
        },
        this_month: {
          count: Number(monthStats[0].count) || 0,
          total: parseFloat(monthStats[0].total) || 0
        },
        by_method: methodStats.map(m => ({
          payment_method: m.payment_method,
          count: Number(m.count) || 0,
          total: parseFloat(m.total) || 0
        }))
      }
    });
  } catch (err) {
    return serverError(res, 'Payment stats error', err);
  }
};