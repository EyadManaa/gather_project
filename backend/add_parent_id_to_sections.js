const db = require('./config/db');

const addParentIdColumn = async () => {
    try {
        await db.execute(`
            ALTER TABLE product_sections 
            ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES product_sections(id) ON DELETE SET NULL;
        `);
        console.log("Successfully added parent_id column to product_sections table");
    } catch (err) {
        console.error("Error adding column:", err);
    } finally {
        process.exit();
    }
};

addParentIdColumn();
