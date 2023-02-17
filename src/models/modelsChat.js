import mongoose from 'mongoose';

const collectionChat = "chat"

const schemaChat = new mongoose.Schema({
    author:
        {
            email: String,
            name: String,
            surname: String,
            age: Number,
            alias: String,
            avatar: String
        },
    text: String,
    date: String,
    id: Number
})

const modelsChat = mongoose.model(collectionChat, schemaChat)

export  {
    modelsChat
};