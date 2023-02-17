import mongoose from 'mongoose';

const collectionUsuarios = "users"

const schemaUsuarios = new mongoose.Schema(
    {
        username: { type: String, required: true },
        password: { type: String, required: true },
    },
    { versionKey: false },
);

const modelsUsers = mongoose.model(collectionUsuarios, schemaUsuarios);

export {
    modelsUsers
};