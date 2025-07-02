import mongoose from 'mongoose';

const embeddingSchema = new mongoose.Schema({
    texto: { type: String, required: true },
    embedding: { type: [Number], required: true },
    fecha: { type: Date, default: Date.now }
});

export default mongoose.model('Embedding', embeddingSchema);
