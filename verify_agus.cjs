const { initializeApp } = require("firebase/app");
const { getDatabase, ref, get } = require("firebase/database");

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

async function verifyAgus() {
  try {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    let found = false;
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const u = child.val();
        if (u.username === "AGUS") {
          console.log("MATCH FOUND:", u);
          found = true;
        }
      });
    }

    if (found) {
      console.log("VERIFICATION SUCCESS: AGUS is in the database.");
    } else {
      console.log("VERIFICATION FAILED: AGUS not found in 'users' node.");
    }
    process.exit(0);
  } catch (err) {
    console.error("VERIFICATION ERROR (Check Rules):", err.message);
    process.exit(1);
  }
}

verifyAgus();
