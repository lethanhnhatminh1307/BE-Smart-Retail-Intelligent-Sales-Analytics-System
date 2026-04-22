const mongoose = require('mongoose');
const {MongoClient,BSONType} = require('mongodb')
mongoose.set('strictQuery',true);
async function connect() {

    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('successfully');
    } catch (error) {
        console.log(error);
        console.log('failure');
    }
}

module.exports = { connect };
