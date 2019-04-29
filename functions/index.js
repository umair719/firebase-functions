const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Cloud storage triggers
// exports.onArchive = functions.storage.object().onArchive((object => {
//     console.info("onArchive storage");
// }));
//
// exports.onDelete = functions.storage.object().onDelete((object => {
//     console.info("onDelete storage");
// }));
//
// exports.onFinalize = functions.storage.object().onFinalize((object => {
//     console.info("onFinalize storage");
//     const firebucket = object.bucket;
//     const filepath = object.name;
//     const contentType = object.contentType;
//
//     console.info('filebucket - ', firebucket);
//     console.info('filepath - ', filepath);
//     console.info('contentType - ', contentType);
// }));
//
// exports.onMetadataUpdate = functions.storage.object().onMetadataUpdate((object => {
//     console.info("onMetadataUpdate storage");
// }));

// // Authentication triggers
exports.sendWelcomeEmail = functions.runWith({
    timeoutSeconds: 300
}).auth.user().onCreate((user) => {
    const email = user.email;
    console.info("New user created  - ", user);
});

exports.sendByeEmail = functions.auth.user().onDelete((user) => {
    console.info("User deleted");
});

// Realtime database triggers
exports.addText = functions.database.ref('text/{textId}').onCreate((snapshot, context) => {
    console.log('Text was added');
});

exports.updateText = functions.database.ref('text/{textId}').onUpdate((snapshot, context) => {
    console.log("Text was updated");
});

exports.deleteText = functions.database.ref('text/{textId}').onDelete((snapshot, context) => {
    console.log("Text was deleted");
});

exports.changeText = functions.database.ref('text/mytext').onWrite((snapshot, context) => {
    console.log("My text was changed");
});

// Cloud Firestore Triggers
exports.staffAdded = functions.firestore.document('staff/{staffId}').onCreate((snap, context) => {
    console.info('A new staff member was added');
});

exports.staffUpdated = functions.firestore.document('staff/{staffId}/{staffComment}/{commentId}').onUpdate((snap, context) => {
    console.info('A staff member was updated');
    const newValue = snap.after.data();
    const oldValue = snap.before.data();
    console.log("New - ", newValue);
    console.log('Old - ', oldValue);

    return snap.after.ref.set({
        comment: "Document updated!"
    }, {merge: true});
});

exports.staffDeleted = functions.firestore.document('staff/{staffId}').onDelete((snap, context) => {
    console.log('A staff member was deleted');
});

exports.staffChanged = functions.firestore.document('staff/{staffId}').onWrite((snap, context) => {
    console.log('A staff member was deleted');
});

exports.addPerson = functions.https.onCall((data, context) => {
    var firstName = data.firstName;
    var lastName = data.lastName;

    return admin.database().ref('/persons').push({
        firstName: firstName,
        lastName: lastName,
        fullName: firstName + " " + lastName
    }).then(() => {
        console.log('New person added');
        return "Ok";
    }).catch((error) => {
        throw new functions.https.HttpsError('unknown', error.message, error);
    });
});


exports.date = functions.https.onRequest((req, res) => {
    if (req.method != 'GET') {
        return res.status(403).send('Forbidden!');
    }
    const date = new Date();
    const snapshot = admin.database().ref('/dates').push({now: date.toDateString()});
    res.redirect(303, snapshot.ref.toString());
});


exports.dateNew = functions.region('europe-west1').https.onRequest((req, res) => {
    if (req.method != 'GET') {
        return res.status(403).send('Forbidden!');
    }
    const date = new Date();
    const snapshot = admin.database().ref('/dates').push({now: date.toDateString()});
    res.redirect(303, snapshot.ref.toString());
});
