const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const assert = require('assert');

const serverPort = 27017;
const host = '127.0.0.1';
const url = `mongodb://${host}:${serverPort}/library`;

async function createDocuement(dbo, collection, jasonObject) {
    return await dbo.collection(collection).insertOne(jasonObject);
};

async function getBooksByWriterName(db, writerName) {
    let docs = [];
    docs = db.collection('books').find({ writerName: writerName }).toArray();
    return docs
};

class db_api {
    serverPort: number;
    host: string;
    url: string;
    client: any;
    db: any;
    constructor(serverPort, host) {
        this.serverPort = serverPort;
        this.host = host;
        this.url = `mongodb://${host}:${serverPort}/library`;
    };

    connect() {
        mongoose.connect(this.url, { poolSize: 50, bufferMaxEntries: 0, reconnectTries: 5000, useNewUrlParser: true });
        this.db = mongoose.connection;
        this.db.on('error', console.error.bind(console, 'connection error:'));
        this.db.once('open', function () {
            // we're connected!
            console.log("connection active")
        });
    };

    CreatePerson(jason: any) {
        console.log('test')
    };

}

let api_test = new db_api(serverPort, host);
api_test.connect();
console.log("test");