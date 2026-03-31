const { initializeApp } = require("firebase/app");
const { getDatabase, ref, push, set } = require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyCps08uxkg-GMDez5f3AQ5Hav693M9T69c",
  authDomain: "data-centre-app.firebaseapp.com",
  databaseURL: "https://data-centre-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "data-centre-app",
  storageBucket: "data-centre-app.firebasestorage.app",
  messagingSenderId: "755553079743",
  appId: "1:755553079743:web:73b99f2c1c1578789fd10a"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const newUser = {
  name: "AGUS",
  username: "AGUS",
  password: "@Agustus2",
  role: "Admin",
  createdAt: new Date().toISOString(),
  activeDevId: null
};

async function addUser() {
  try {
    const usersRef = ref(db, 'users');
    await push(usersRef, newUser);
    console.log("SUCCESS: User AGUS has been added as ADMIN.");
    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err);
    process.exit(1);
  }
}

addUser();
