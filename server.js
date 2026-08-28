const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const crypto = require('crypto');
const app = express();
app.use(cors());
app.use(express.json()); 
app.use(express.json());
app.use(express.static('public'));

// MySQL ডেটাবেস কানেকশন
// MySQL ডেটাবেস কানেকশন
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Dey@200421',
    database: 'dey_auto_parts',
    waitForConnections: true,
    connectionLimit: 10
});

// ডেটাবেস কানেকশন ঠিক আছে কি না তা চেক করা
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to MySQL Database Successfully!');
        connection.release();
    }
});
// লগইন/রেজিস্ট্রেশন API
app.post('/api/auth', (req, res) => {
    // লগইন সফল হয়েছে বলে ফ্রন্টএন্ডকে জানিয়ে দেওয়া
    res.json({ success: true, message: 'Login successful!' });
});

// Front-page demo inventory keeps the storefront usable even when the local
// MySQL catalogue has not been set up yet.
const featuredProducts = [
    { id: 'featured-air-filter', part_name: 'Hero Splendor Air Filter Element', brand_name: 'Hero', category: 'Air filter', price: 249, image_url: 'https://loremflickr.com/900/650/motorcycle,air-filter?lock=201' },
    { id: 'featured-brake-pad', part_name: 'Bajaj Pulsar Front Brake Pad Set', brand_name: 'Bajaj', category: 'Brake', price: 389, image_url: 'https://loremflickr.com/900/650/motorcycle,brake?lock=202' },
    { id: 'featured-chain-kit', part_name: 'Bajaj Pulsar Chain Sprocket Kit', brand_name: 'Bajaj', category: 'Chain sprockets', price: 1099, image_url: 'https://loremflickr.com/900/650/motorcycle,chain?lock=203' },
    { id: 'featured-light', part_name: 'Hero Motorcycle LED Headlight Unit', brand_name: 'Hero', category: 'Light', price: 799, image_url: 'https://loremflickr.com/900/650/motorcycle,headlight?lock=204' }
];
app.get('/api/products', (req, res) => res.json({ success: true, data: featuredProducts }));

// --------------------------------------------------

// Catalogue APIs: values are parameterised to prevent SQL injection.
app.get('/api/models/:brand', (req, res) => {
    const sql = `SELECT id, brand_name, model_name, model_year, image_url
                 FROM bike_models WHERE brand_name = ? ORDER BY model_name`;
    db.query(sql, [req.params.brand], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Could not load bike models.' });
        res.json({ success: true, data: rows });
    });
});

app.get('/api/parts/:modelId', (req, res) => {
    const sql = `SELECT sp.id, sp.part_name, sp.category, sp.price, sp.stock_quantity, sp.image_url,
                        bm.brand_name, bm.model_name
                 FROM spare_parts sp JOIN bike_models bm ON bm.id = sp.model_id
                 WHERE sp.model_id = ? AND sp.is_active = 1 ORDER BY sp.part_name`;
    db.query(sql, [req.params.modelId], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Could not load spare parts.' });
        res.json({ success: true, data: rows });
    });
});

app.post('/api/checkout', (req, res) => {
    const { customerName, customerEmail, paymentMethod, items } = req.body;
    if (!customerName || !customerEmail || !paymentMethod || !Array.isArray(items) || !items.length) {
        return res.status(400).json({ success: false, message: 'Customer, payment, and cart details are required.' });
    }
    const quantities = new Map();
    for (const item of items) {
        const id = Number(item.partId), quantity = Number(item.quantity);
        if (!Number.isInteger(id) || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Invalid cart item.' });
        }
        quantities.set(id, (quantities.get(id) || 0) + quantity);
    }
    const ids = [...quantities.keys()];
    db.getConnection((connectionError, connection) => {
        if (connectionError) return res.status(500).json({ success: false, message: 'Database unavailable.' });
        connection.beginTransaction(transactionError => {
            if (transactionError) { connection.release(); return res.status(500).json({ success: false, message: 'Could not start checkout.' }); }
            connection.query('SELECT id, part_name, price, stock_quantity FROM spare_parts WHERE id IN (?) FOR UPDATE', [ids], (partsError, parts) => {
                if (partsError || parts.length !== ids.length || parts.some(part => part.stock_quantity < quantities.get(part.id))) return rollback('One or more parts are unavailable.');
                const total = parts.reduce((sum, part) => sum + Number(part.price) * quantities.get(part.id), 0);
                connection.query('INSERT INTO orders (customer_name, customer_email, payment_method, total_amount, status) VALUES (?, ?, ?, ?, ?)', [customerName, customerEmail, paymentMethod, total, 'placed'], (orderError, orderResult) => {
                    if (orderError) return rollback('Could not create order.');
                    const orderItems = parts.map(part => [orderResult.insertId, part.id, quantities.get(part.id), part.price]);
                    connection.query('INSERT INTO order_items (order_id, spare_part_id, quantity, unit_price) VALUES ?', [orderItems], itemError => {
                        if (itemError) return rollback('Could not save order items.');
                        const stockSql = `UPDATE spare_parts SET stock_quantity = stock_quantity - CASE id ${parts.map(() => 'WHEN ? THEN ?').join(' ')} END WHERE id IN (?)`;
                        const stockValues = [...parts.flatMap(part => [part.id, quantities.get(part.id)]), ids];
                        connection.query(stockSql, stockValues, updateError => {
                            if (updateError) return rollback('Could not reserve stock.');
                            connection.commit(commitError => {
                                if (commitError) return rollback('Could not finalise order.');
                                connection.release();
                                res.status(201).json({ success: true, orderId: orderResult.insertId, total: Number(total.toFixed(2)) });
                            });
                        });
                    });
                });
            });
            function rollback(message) { connection.rollback(() => { connection.release(); res.status(400).json({ success: false, message }); }); }
        });
    });
});

// Admin API. Set ADMIN_TOKEN_SECRET to a long, random value in production.
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || crypto.randomBytes(48).toString('hex');
const adminLoginAttempts = new Map();

function createAdminToken(admin) {
    const payload = Buffer.from(JSON.stringify({ id: admin.id, username: admin.username, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
    const signature = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(payload).digest('base64url');
    return `${payload}.${signature}`;
}

function requireAdmin(req, res, next) {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token || !token.includes('.')) return res.status(401).json({ success: false, message: 'Admin authentication required.' });
    const [payload, signature] = token.split('.');
    const expected = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(payload).digest('base64url');
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return res.status(401).json({ success: false, message: 'Invalid admin session.' });
    try {
        const admin = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (!admin.id || !admin.username || admin.exp < Date.now()) throw new Error('Expired token');
        req.admin = admin;
        next();
    } catch (_) {
        res.status(401).json({ success: false, message: 'Admin session has expired.' });
    }
}

function validText(value, maxLength) { return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength; }
function partValues(body) {
    const modelId = Number(body.model_id), price = Number(body.price), stock = Number(body.stock_quantity);
    if (!Number.isInteger(modelId) || modelId < 1 || !validText(body.part_name, 150) || !validText(body.category, 80) || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) return null;
    return [modelId, body.part_name.trim(), body.category.trim(), price, stock, typeof body.image_url === 'string' ? body.image_url.trim().slice(0, 500) || null : null, body.is_active === false || body.is_active === 0 ? 0 : 1];
}

app.post('/api/admin/login', (req, res) => {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const attempt = adminLoginAttempts.get(req.ip) || { count: 0, since: Date.now() };
    if (Date.now() - attempt.since > 15 * 60 * 1000) { attempt.count = 0; attempt.since = Date.now(); }
    if (attempt.count >= 5) return res.status(429).json({ success: false, message: 'Too many login attempts. Try again in 15 minutes.' });
    if (!validText(username, 60) || password.length < 1) return res.status(400).json({ success: false, message: 'Username and password are required.' });
    db.query('SELECT id, username, password_hash, password_salt FROM admins WHERE username = ? AND is_active = 1 LIMIT 1', [username], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Could not complete admin login.' });
        const admin = rows[0];
        if (!admin) { adminLoginAttempts.set(req.ip, { count: attempt.count + 1, since: attempt.since }); return res.status(401).json({ success: false, message: 'Invalid username or password.' }); }
        crypto.scrypt(password, admin.password_salt, 64, (hashError, derivedKey) => {
            const stored = Buffer.from(admin.password_hash, 'hex');
            const valid = !hashError && stored.length === derivedKey.length && crypto.timingSafeEqual(stored, derivedKey);
            if (!valid) { adminLoginAttempts.set(req.ip, { count: attempt.count + 1, since: attempt.since }); return res.status(401).json({ success: false, message: 'Invalid username or password.' }); }
            adminLoginAttempts.delete(req.ip);
            res.json({ success: true, token: createAdminToken(admin), admin: { id: admin.id, username: admin.username } });
        });
    });
});

app.get('/api/admin/models', requireAdmin, (req, res) => {
    db.query('SELECT id, brand_name, model_name, model_year, image_url FROM bike_models ORDER BY brand_name, model_name', (err, rows) => err ? res.status(500).json({ success: false, message: 'Could not load models.' }) : res.json({ success: true, data: rows }));
});
app.post('/api/admin/models', requireAdmin, (req, res) => {
    const { brand_name, model_name, model_year, image_url } = req.body;
    const year = model_year === '' || model_year == null ? null : Number(model_year);
    if (!validText(brand_name, 80) || !validText(model_name, 100) || (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2100))) return res.status(400).json({ success: false, message: 'Enter a valid brand, model and year.' });
    db.query('INSERT INTO bike_models (brand_name, model_name, model_year, image_url) VALUES (?, ?, ?, ?)', [brand_name.trim(), model_name.trim(), year, typeof image_url === 'string' ? image_url.trim().slice(0, 500) || null : null], (err, result) => err ? res.status(400).json({ success: false, message: 'Could not save model. It may already exist.' }) : res.status(201).json({ success: true, id: result.insertId }));
});
app.put('/api/admin/models/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id), { brand_name, model_name, model_year, image_url } = req.body;
    const year = model_year === '' || model_year == null ? null : Number(model_year);
    if (!Number.isInteger(id) || id < 1 || !validText(brand_name, 80) || !validText(model_name, 100) || (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2100))) return res.status(400).json({ success: false, message: 'Invalid model data.' });
    db.query('UPDATE bike_models SET brand_name = ?, model_name = ?, model_year = ?, image_url = ? WHERE id = ?', [brand_name.trim(), model_name.trim(), year, typeof image_url === 'string' ? image_url.trim().slice(0, 500) || null : null, id], (err, result) => err ? res.status(400).json({ success: false, message: 'Could not update model.' }) : res.json({ success: true, affected: result.affectedRows }));
});
app.delete('/api/admin/models/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ success: false, message: 'Invalid model ID.' });
    db.query('DELETE FROM bike_models WHERE id = ?', [id], (err, result) => err ? res.status(500).json({ success: false, message: 'Could not delete model.' }) : res.json({ success: true, affected: result.affectedRows }));
});
app.get('/api/admin/parts', requireAdmin, (req, res) => {
    db.query('SELECT sp.*, bm.brand_name, bm.model_name FROM spare_parts sp JOIN bike_models bm ON bm.id = sp.model_id ORDER BY sp.id DESC', (err, rows) => err ? res.status(500).json({ success: false, message: 'Could not load parts.' }) : res.json({ success: true, data: rows }));
});
app.post('/api/admin/parts', requireAdmin, (req, res) => {
    const values = partValues(req.body);
    if (!values) return res.status(400).json({ success: false, message: 'Invalid spare-part data.' });
    db.query('INSERT INTO spare_parts (model_id, part_name, category, price, stock_quantity, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err, result) => err ? res.status(400).json({ success: false, message: 'Could not save spare part.' }) : res.status(201).json({ success: true, id: result.insertId }));
});
app.put('/api/admin/parts/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id), values = partValues(req.body);
    if (!Number.isInteger(id) || id < 1 || !values) return res.status(400).json({ success: false, message: 'Invalid spare-part data.' });
    db.query('UPDATE spare_parts SET model_id = ?, part_name = ?, category = ?, price = ?, stock_quantity = ?, image_url = ?, is_active = ? WHERE id = ?', [...values, id], (err, result) => err ? res.status(400).json({ success: false, message: 'Could not update spare part.' }) : res.json({ success: true, affected: result.affectedRows }));
});
app.delete('/api/admin/parts/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ success: false, message: 'Invalid spare-part ID.' });
    db.query('DELETE FROM spare_parts WHERE id = ?', [id], (err, result) => err ? res.status(500).json({ success: false, message: 'Could not delete spare part.' }) : res.json({ success: true, affected: result.affectedRows }));
});
app.get('/api/admin/orders', requireAdmin, (req, res) => {
    db.query('SELECT id, customer_name, customer_email, payment_method, total_amount, status, created_at FROM orders ORDER BY created_at DESC', (err, rows) => err ? res.status(500).json({ success: false, message: 'Could not load orders.' }) : res.json({ success: true, data: rows }));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
