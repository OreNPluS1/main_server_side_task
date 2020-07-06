const express = require('express');
const sys = require('sys');
const exec = require('child_process').exec;

//import './db_api';
import { createPerson, createGroup, modifyPerson } from './db_api';

const app = express();
const hostname = '127.0.0.1';
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
class Person {
    firstName: string;
    lastName: string;
    groups: string[];
    jason: any;
    constructor(firstName, lastName, groups) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.groups = groups;
        this.jason = {
            firstName: firstName,
            lastName: lastName,
            groups: groups
        };
    };
};

class Group {
    groupName: any;
    parentGroup: any;
    jason: any;
    constructor(groupName, parentGroup) {
        this.groupName = groupName;
        this.parentGroup = parentGroup;
        this.jason = {
            groupName: groupName,
            parentGroup: parentGroup,
            members: []
        };
    };
};
*/

app.post('/api/mongodb/create_person', (req, res) => {
    // Create a person
    res.status(200);
    // api function to add the new person to the db, should check if specified groups exits
    createPerson(req.body.firstName, req.body.lastName, req.body.groups.split(", "));

    // use person.groups and emit event to sync to groups
    res.end();
});

app.post('/api/mongodb/create_group', async (req, res) => {
    // Create a group
    res.status(200);
    let errorValue = await createGroup(req.body.groupName, req.body.parentGroup, req.body.members.split(", "));
    if (errorValue) {
        res.status(errorValue[0]);
        res.send(errorValue[1]);
    };
    res.end();
});


app.patch('/api/mongodb/modify_person', async (req, res) => {
    // Modify existing person details
    res.status(200);
    let errorValue = await modifyPerson();
    if (errorValue) {
        res.status(errorValue[0]);
        res.send(errorValue[1]);
    };
    res.end();
    //let person = new Person(req.body.firstName, req.body.lastName, req.body.groups);
    // check if person exists, if so, update his details
    // this should emit event to sync with the groups, check against old group details
});

app.patch('/api/mongodb/modify_group', (req, res) => {
    // Modify existing group details
    res.status(200);
    //let group = new Group(req.body.groupName, req.body.parentGroup);
    // this should make the changes and sync with another groups if needed
});


app.delete('/api/mongodb/delete_person', (req, res) => {
    // Delete a person
    res.status(200);
    let person = req.query.firstName + " " + req.query.lastName;
    // this should emit event to delete the person from all releted groups
});

app.delete('/api/mongodb/delete_group', (req, res) => {
    // Delete a group
    res.status(200);
    let group = req.query.groupName
    // this should emit event to delete the group and its child groups, this doesn't should delete persons, only remove the group from them
});


app.get('/api/mongodb/read_person', (req, res) => {
    // Get person details
    res.status(200);
    let person = req.query.firstName + " " + req.query.lastName;
    // this should get person details from the db
});

app.get('/api/mongodb/read_group', (req, res) => {
    // Get group details
    let group = req.query.groupName
    // this should get group details from db
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});