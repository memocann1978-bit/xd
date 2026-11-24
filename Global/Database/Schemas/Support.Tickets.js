const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    guildID: { type: String, required: true, index: true },
    channelID: { type: String, required: true, unique: true },
    creatorID: { type: String, required: true, index: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
    createdAt: { type: Date, default: Date.now },
    closedAt: { type: Date, default: null },
    closedBy: { type: String, default: null }
}, { timestamps: true });

ticketSchema.index({ guildID: 1, creatorID: 1, status: 1 });

module.exports = mongoose.models.SupportTicket || mongoose.model('SupportTicket', ticketSchema);
