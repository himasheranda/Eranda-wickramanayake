// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDh2ixTT2gaQ0eLNVg5GjMGy3BAGrIUe20",
    authDomain: "eranda-wickramanayake.firebaseapp.com",
    projectId: "eranda-wickramanayake"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to handle redirection based on Role
async function redirectUser(user) {
    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
            window.location.href = "admin.html"; // Send Admin to Admin Panel
        } else {
            window.location.href = "index.html"; // Send Students to Home
        }
    } catch (error) {
        console.error("Error fetching user role:", error);
        window.location.href = "index.html"; 
    }
}

// Redirect if already logged in (Only if not already on a dashboard)
onAuthStateChanged(auth, user => {
    if (user) {
        // We only auto-redirect if the user is sitting on the login page
        // This prevents the "infinite loop" of redirection
        console.log("User detected, checking role...");
    }
});

// Login function
window.login = async function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
        
        // Check role and redirect
        await redirectUser(userCredential.user);
        
    } catch (error) {
        alert("Login failed: " + error.message);
    }
}