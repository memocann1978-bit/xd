const mongoose = require('mongoose');
class Mongoose {
    static async Connect(active, url, client = global.client) {
        if (!active) {
            client?._logger?.log('MongoDB is disabled; continuing without database.', 'warn');
            return false;
        }
        if (!url) throw new Error('MongoDB is enabled but MongoURL is empty. Set MONGODB_URI.');
        mongoose.set('strictQuery', true);
        try {
            await mongoose.connect(url);
            client?._logger?.log('Connected to MongoDB.', 'mongodb');
            return true;
        } catch (error) {
            client?._logger?.log('MongoDB connection failed: ' + error.message, 'error');
            throw error;
        }
    }
    static async Disconnect() {
        if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
}
module.exports = { Mongoose };