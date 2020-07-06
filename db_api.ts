const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const events = require('events');
const eventEmitter = new events.EventEmitter();

// setup mongoDB connection details
const serverPort = 27017;
const host = '127.0.0.1';
const dbScope = 'server_task';
const url = `mongodb://${host}:${serverPort}/${dbScope}`;

const Schema = mongoose.Schema;

mongoose.connect(url, { poolSize: 50, bufferMaxEntries: 0, useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// define the schemas to work with
let personSchema = new Schema({
    firstName: { type: String },
    lastName: { type: String },
    groups: [String]
});

let groupSchema = new Schema({
    groupName: { type: String },
    parentGroup: { type: String },
    members: [String],
    subGroups: [String]
});

let person = mongoose.model('persons', personSchema);
let group = mongoose.model('groups', groupSchema);

function findOneGroup(findJASON) {
    // function to take find query for finding one group from the groups collection
    let result = group.findOne(findJASON).cursor().next();
    return result
};

function findOnePerson(findJASON) {
    // function to take find query for finding one group from the groups collection
    let result = person.findOne(findJASON).cursor().next();
    return result
};

export async function createPerson(firstName, lastName, groups) {
    let fullName = `${firstName} ${lastName}`;
    let groupsValid = [];
    // find existing groups
    let query: any = await Promise.all(groups.map(element => {
        element = findOneGroup({
            groupName: element
        });
        return element;
    }));

    // check each result if its not null and also confirm it exists, then, add the person to it (should be moved to modifyGroup?)
    for (let i = 0; i < query.length; i++) {
        if (!query[i]) {
            console.log(`Warning: ${groups[i]} doesn't exist`)
        } else if (groups.includes(query[i].groupName)) {
            groupsValid += query[i].groupName;
            query[i].members.push(fullName);
            await query[i].save();
        };
    };

    // create a person document
    let newPerson = new person({
        firstName: firstName,
        lastName: lastName,
        groups: groupsValid
    });
    newPerson.save();
};

const personGroupsModify = function personGroupsModify(test) {
    console.log("event person groups fired");
    console.log(test)
};
eventEmitter.on('personAddedToGroup', personGroupsModify);

export async function createGroup(groupName, parentGroup, members) {
    // check if parent group exist, if not, dont set it, also, check if members added exist
    // veify that all members added exist, omit ones that doesn't.
    let membersVerified: any = await Promise.all(members.map(async element => {
        element = element.split(' ');
        element = await findOnePerson({
            firstName: element[0],
            lastName: element[1]
        });
        if (element) {
            return `${element.firstName} ${element.lastName}`;
        };
    }));
    membersVerified = membersVerified.filter(item => { if (item) { return item } });

    // Verift the group doesn't already exist
    let groupVerify = await findOneGroup({
        groupName: groupName
    });
    if (groupVerify) {
        return [400, 'Group already exists, request aborted'];
    };

    // Check if parent group exist, if not, don't set it, also, add the group to the parent group.
    parentGroup = await Promise.all([parentGroup].map(async element => {
        let parentGroupCheck = await findOneGroup({
            groupName: element
        });
        if (parentGroupCheck) {
            parentGroupCheck.subGroups.push(groupName);
            await parentGroupCheck.save();
            return parentGroupCheck.groupName;
        } else {
            return '';
        };
    }));
    parentGroup = parentGroup[0];

    // create a group document
    let newGroup = new group({
        groupName: groupName,
        parentGroup: parentGroup,
        subGroups: [],
        members: membersVerified
    });
    newGroup.save();

    // emit event to modify related persons
    eventEmitter.emit('personAddedToGroup', "I am a test");
};

export async function modifyPerson(firstName, lastName, newName, addGroups, removeGroups) {
    // modify existing person
    let fullName = `${firstName} ${lastName}`;
    let personObject = await findOnePerson({
        firstName: firstName,
        lastName: lastName
    });
    if (!personObject) {
        return [404, "person doesn't exist"];
    };

    if (newName !== 'no') {
        newName.split(' ');
        personObject.firstName = newName[0];
        personObject.lastName = newName[1];
    };

    if (addGroups !== 'no' && Array.isArray(addGroups)) {
        for (const groupItem of addGroups) {
            
        }
    }

};