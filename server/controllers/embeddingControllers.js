import Embedding from '../models/Embedding.js';

// Crear o actualizar
export const saveEmbedding = async (req, res) => {
    try {
        const { texto, embedding } = req.body;

        const existente = await Embedding.findOne({ texto });

        if (existente) {
            existente.embedding = embedding;
            await existente.save();
            return res.status(200).json({ success: true, mensaje: 'Actualizado' });
        }

        const nuevo = new Embedding({ texto, embedding });
        await nuevo.save();

        res.status(201).json({ success: true, mensaje: 'Guardado' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Obtener todos
export const getEmbeddings = async (req, res) => {
    const embeddings = await Embedding.find();
    res.json({ success: true, embeddings });
};
