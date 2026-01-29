const supabase = require('../config/supabase');
const db = require('../config/db');

const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        let userId;
        let userPayload;

        // Try Supabase first
        try {
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (!error && user) {
                userId = user.id;
            }
        } catch (err) {
            // Not a Supabase token or Supabase error
        }

        // If not Supabase, try local JWT
        if (!userId) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                return res.status(401).json({ message: 'Not authorized, token failed' });
            }
        }

        // Check if user is banned in our public table and get their role
        let { rows: dbUsers } = await db.execute('SELECT id, role, is_banned FROM users WHERE id = $1', [userId]);

        if (dbUsers.length === 0) {
            // It's possible the trigger is still running (latency). 
            // For new users, let's wait a tiny bit and retry once.
            await new Promise(resolve => setTimeout(resolve, 1000));
            const retry = await db.execute('SELECT id, role, is_banned FROM users WHERE id = $1', [userId]);
            dbUsers = retry.rows;
        }

        if (dbUsers.length === 0 || dbUsers[0].is_banned) {
            return res.status(401).json({
                message: dbUsers.length === 0 ? 'Syncing your account, please wait a moment...' : 'User is banned'
            });
        }

        req.user = { id: dbUsers[0].id, role: dbUsers[0].role }; // Ensure ID matches what's in our DB
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err.message);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};

exports.protectOptional = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            let userId;
            // Try Supabase
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (!error && user) {
                userId = user.id;
            } else {
                // Try Local
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            }

            if (userId) {
                // Check if user is banned
                const { rows: dbUsers } = await db.execute('SELECT id, role, is_banned FROM users WHERE id = $1', [userId]);
                if (dbUsers.length > 0 && !dbUsers[0].is_banned) {
                    req.user = { id: dbUsers[0].id, role: dbUsers[0].role };
                }
            }
        } catch (err) {
            // Ignore token error if optional
        }
    }
    next();
};

