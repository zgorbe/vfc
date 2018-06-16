import firebase from 'firebase/app';
import 'firebase/database';

const app = firebase.initializeApp({
    apiKey: "AIzaSyDfWvKdwMJBI2DCX1G92b0crjQqyNfoedg",
    authDomain: "fire-chess-d2f51.firebaseapp.com",
    databaseURL: "https://fire-chess-d2f51.firebaseio.com",
    projectId: "fire-chess-d2f51",
    storageBucket: "fire-chess-d2f51.appspot.com",
    messagingSenderId: "385304048657"
});

export const db = app.database();
export const tableRef = db.ref('table');
export const selectedRef = db.ref('selected');
export const deletedWhitesRef = db.ref('deletedWhites');
export const deletedBlacksRef = db.ref('deletedBlacks');
