const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const assert = require('assert');

// setup mongoDB connection details
const serverPort = 27017;
const host = '127.0.0.1';
const dbScope = 'server_task';
const url = `mongodb://${host}:${serverPort}/${dbScope}`;

const Schema = mongoose.Schema;

mongoose.connect(url, { poolSize: 50, bufferMaxEntries: 0, useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

let personSchema = new Schema({
    firstName: { type: String },
    lastName: { type: String },
    groups: [String]
});

let groupSchema = new Schema({
    groupName: { type: String },
    parentGroup: { type: String },
    members: [String]
});

let person = mongoose.model('persons', personSchema);
let group = mongoose.model('groups', groupSchema);

async function createPerson(firstName, lastName, groups) {
    let fullName = `${firstName} ${lastName}`;
    let groupsValid = [];
    // check if each group exists, if it does, add the person to it (should be moved to modifyGroup?)
    let query = await Promise.all(groups.map(element => {
        for (const i of groups) {
            element = group.findOne({
                groupName: i
            }).cursor().next();
        };
        return element;
    }));
    console.log(query[0].members);

    for (let i = 0; i <= query.length; i++) {
        if (groups.includes(query[i].groupName)) {
            groupsValid += query[i].groupName;
            query[i].members.push(fullName);
            query[i].save();
        }
    };

    // create a person document
    let newPerson = new person({
        firstName: firstName,
        lastName: lastName,
        groups: groupsValid
    });
    newPerson.save();
};

function createGroup(firstName, lastName, groups) {
    // create a person document
    let newPerson = new person({
        firstName: firstName,
        lastName: lastName,
        groups: groups
    });
    newPerson.save();
};


// test.findIndex(item => {return item === 'apple'})

//createPerson('test', 'toster', undefined);

exports.createPerson = createPerson;