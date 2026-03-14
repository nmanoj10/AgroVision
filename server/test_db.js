// server/test_db.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function test() {
    const uri = process.env.MONGODB_URI;
    console.log('Testing connection to:', uri ? uri.substring(0, 20) + '...' : 'MISSING');

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
        console.log('✅ Connection SUCCESS');
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection FAILED:', err.message);
        process.exit(1);
    }
}

test();
