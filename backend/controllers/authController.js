const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

exports.register = async (req, res) => {
    const { username, email, password, role, name } = req.body;
    const finalUsername = username || name;

    // Simple validation
    if (!finalUsername || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields (Name, Email, Password)' });
    }

    try {
        // Check if user exists
        const { rows: existingUsers } = await db.execute('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user (force 'user' role for public registration unless specified otherwise)
        const validRoles = ['user', 'admin'];
        const userRole = validRoles.includes(role) ? role : 'user';

        const { rows } = await db.execute(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [finalUsername, email, hashedPassword, userRole]
        );

        const userId = rows[0].id;
        const token = generateToken(userId, userRole);

        res.status(201).json({
            token,
            user: {
                id: userId,
                username,
                email,
                role: userRole,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    console.log('Login attempt for:', email);
    console.log('Password type:', typeof password);
    // Explicitly convert to string if it's not (though express.json() usually handles this, 
    // but if the client sends an object, we need to catch it)
    if (typeof password !== 'string') {
        console.error('Invalid password format received:', password);
        return res.status(400).json({ message: 'Invalid password format' });
    }

    try {
        const { rows: users } = await db.execute('SELECT * FROM users WHERE email = $1', [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        if (user.is_banned) {
            return res.status(403).json({ message: 'Your account has been restricted. Please contact support.' });
        }

        // 🛡️ CRITICAL FIX: Handle users synced from Supabase Auth who have no local password
        if (!user.password) {
            console.error('Login attempt for user with no local password (likely synced from Supabase Auth):', email);
            return res.status(401).json({
                message: 'This account was created via Supabase Auth. Please login using Supabase or reset your password.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.role);

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMe = async (req, res) => {
    try {
        const { rows: users } = await db.execute('SELECT id, username, email, role FROM users WHERE id = $1', [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: users[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
