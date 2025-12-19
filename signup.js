import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDh2ixTT2gaQ0eLNVg5GjMGy3BAGrIUe20",
    authDomain: "eranda-wickramanayake.firebaseapp.com",
    projectId: "eranda-wickramanayake",
    storageBucket: "eranda-wickramanayake.firebasestorage.app",
    messagingSenderId: "99264304270",
    appId: "1:99264304270:web:af3f602f958b6a7d2525df"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.signup = async function() {
    // Get values from the HTML inputs
    // Note: ensure your HTML select ID is "userClass" to match the HTML I gave you earlier
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const studentClass = document.getElementById("userClass").value;
    const password = document.getElementById("password").value;

    // Basic validation
    if (!name || !email || !studentClass || !password) {
        alert("Please fill all fields and select your class.");
        return;
    }

    try {
        // 1. CREATE AUTH ACCOUNT
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. STORE DATA IN 'user' COLLECTION
        // Note: We use 'user' because your Rules say: match /user/{userId}
        await setDoc(doc(db, "user", user.uid), {
            name: name,
            email: email,
            class: studentClass,
            role: "student",
            createdAt: new Date()
        });

        alert("Signup successful! Welcome to Eranda Science.");
        window.location.href = "index.html";

    } catch (error) {
        console.error("Signup error:", error);
        alert("Signup failed: " + error.message);
    }
}