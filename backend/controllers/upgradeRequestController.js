const db = require('../config/db');

// Create a new upgrade request (Store Owner)
exports.createRequest = async (req, res) => {
    const { store_id, current_tier, requested_tier, message } = req.body;
    try {
        // Verify store ownership
        const { rows: stores } = await db.execute('SELECT id FROM stores WHERE id = $1 AND owner_id = $2', [store_id, req.user.id]);
        if (stores.length === 0) {
            return res.status(403).json({ message: 'Not authorized to request upgrade for this store' });
        }

        // Check if there is already a pending request
        const { rows: existing } = await db.execute("SELECT id FROM upgrade_requests WHERE store_id = $1 AND status = 'pending'", [store_id]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'You already have a pending upgrade request' });
        }

        await db.execute(
            'INSERT INTO upgrade_requests (store_id, current_tier, requested_tier, message) VALUES ($1, $2, $3, $4)',
            [store_id, current_tier, requested_tier, message]
        );
        res.status(201).json({ message: 'Upgrade request submitted successfully' });
    } catch (err) {
        console.error('Error creating upgrade request:', err);
        res.status(500).json({ message: 'Error submitting upgrade request' });
    }
};

// Get all requests (Super Admin)
exports.getAllRequests = async (req, res) => {
    try {
        const { rows: requests } = await db.execute(`
            SELECT ur.*, s.name as store_name, u.username as owner_name, u.email as owner_email
            FROM upgrade_requests ur
            JOIN stores s ON ur.store_id = s.id
            JOIN users u ON s.owner_id = u.id
            ORDER BY ur.created_at DESC
        `);
        res.json(requests);
    } catch (err) {
        console.error('Error fetching upgrade requests:', err);
        res.status(500).json({ message: 'Error fetching upgrade requests' });
    }
};

// Update request status (Super Admin: Approve/Reject)
exports.updateRequestStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        // Get the request details
        const { rows: requests } = await db.execute('SELECT * FROM upgrade_requests WHERE id = $1', [id]);
        if (requests.length === 0) {
            return res.status(404).json({ message: 'Upgrade request not found' });
        }

        const request = requests[0];

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'This request has already been processed' });
        }

        // Start a transaction if approving
        if (status === 'approved') {
            const client = await db.pool.connect();
            try {
                await client.query('BEGIN');

                // Update request status
                await client.query('UPDATE upgrade_requests SET status = $1 WHERE id = $2', [status, id]);

                // Update store subscription tier
                await client.query('UPDATE stores SET subscription_tier = $1 WHERE id = $2', [request.requested_tier, request.store_id]);

                await client.query('COMMIT');
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        } else {
            // Just update request status to rejected
            await db.execute('UPDATE upgrade_requests SET status = $1 WHERE id = $2', [status, id]);
        }

        res.json({ message: `Upgrade request ${status}` });
    } catch (err) {
        console.error('Error updating upgrade request status:', err);
        res.status(500).json({ message: 'Error updating upgrade request status' });
    }
};

// Get requests for a specific store (Owner)
exports.getStoreRequests = async (req, res) => {
    const { storeId } = req.params;
    try {
        // Verify store ownership
        const { rows: stores } = await db.execute('SELECT id FROM stores WHERE id = $1 AND owner_id = $2', [storeId, req.user.id]);
        if (stores.length === 0) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { rows: requests } = await db.execute('SELECT * FROM upgrade_requests WHERE store_id = $1 ORDER BY created_at DESC', [storeId]);
        res.json(requests);
    } catch (err) {
        console.error('Error fetching store upgrade requests:', err);
        res.status(500).json({ message: 'Error fetching upgrade requests' });
    }
};
