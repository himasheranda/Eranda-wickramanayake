// 1️⃣ Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDh2ixTT2gaQ0eLNVg5GjMGy3BAGrIUe20",
    authDomain: "eranda-wickramanayake.firebaseapp.com",
    projectId: "eranda-wickramanayake",
    storageBucket: "eranda-wickramanayake.firebasestorage.app",
    messagingSenderId: "99264304270",
    appId: "1:99264304270:web:af3f602f958b6a7d2525df",
    measurementId: "G-TC5T521VEQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 2️⃣ Protect Admin Page
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.href = "login.html";
        return;
    }

    try {
        const userRef = doc(db, "user", user.uid);
        const userDoc = await getDoc(userRef);

        // Master Admin Check
        const isMaster = user.uid === "99264304270"; 

        if ((userDoc.exists() && userDoc.data().role === "admin") || isMaster) {
            console.log("Admin verified.");
            loadClasses(); 
        } else {
            alert("Access Denied: Admin rights required.");
            location.href = "index.html"; 
        }
    } catch (error) {
        console.error("Auth Error:", error);
        location.href = "index.html";
    }
});

// 3️⃣ Add Content
async function addClass() {
    const title = document.getElementById("title").value.trim();
    const subtitle = document.getElementById("subtitle").value.trim();
    const link = document.getElementById("link").value.trim();
    const category = document.getElementById("category").value;

    if(!title || !link) {
        alert("Please fill in the title and link.");
        return;
    }

    try {
        await addDoc(collection(db, "classes"), {
            title: title,
            subtitle: subtitle, 
            link: link, 
            category: category, 
            visible: true,
            createdAt: new Date()
        });

        alert("Uploaded successfully to " + category);
        
        // Clear main inputs
        document.getElementById("title").value = "";
        document.getElementById("subtitle").value = "";
        document.getElementById("link").value = "";
        
        loadClasses();
    } catch (error) {
        alert("Error: " + error.message);
    }
}

// 4️⃣ Load & Manage Content
async function loadClasses() {
    const list = document.getElementById("classList");
    if(!list) return;

    list.innerHTML = `<p style="color: #999;">Updating list...</p>`;

    try {
        const snap = await getDocs(collection(db, "classes"));
        list.innerHTML = ""; 

        if (snap.empty) {
            list.innerHTML = `<p style="color: #999; padding: 20px;">No content found.</p>`;
            return;
        }

        // Sort locally (Newest first)
        const sortedDocs = snap.docs.sort((a, b) => {
            const dateA = a.data().createdAt?.seconds || 0;
            const dateB = b.data().createdAt?.seconds || 0;
            return dateB - dateA;
        });

        sortedDocs.forEach(documentSnapshot => {
            const c = documentSnapshot.data();
            const id = documentSnapshot.id;
            
            const div = document.createElement("div");
            div.className = "class-item";
            div.setAttribute('data-category', c.category || 'general');
            
            let catDisplay = c.category ? c.category.toUpperCase() : 'GENERAL';
            
            div.innerHTML = `
                <div style="text-align: left;">
                    <span style="font-size: 0.7rem; color: var(--accent-blue); font-weight: bold;">${catDisplay}</span>
                    <br><strong style="font-size: 1.1rem;">${c.title}</strong>
                    <div style="color: #666; font-size: 0.9rem;">${c.subtitle || ''}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button onclick="toggleVisibility('${id}', ${c.visible})" class="status-badge ${c.visible ? 'visible' : 'hidden'}">
                        ${c.visible ? 'Visible' : 'Hidden'}
                    </button>
                    <span class="material-symbols-rounded delete-btn" onclick="deleteClass('${id}')">delete</span>
                </div>
            `;
            list.appendChild(div);
        });
    } catch (error) {
        console.error("Error loading list:", error);
        list.innerHTML = `<p style="color:red;">Error loading content list.</p>`;
    }
}

// 5️⃣ Toggle Visibility
async function toggleVisibility(id, currentStatus) {
    try {
        const docRef = doc(db, "classes", id);
        await updateDoc(docRef, { visible: !currentStatus });
        loadClasses();
    } catch (error) {
        alert("Error updating visibility");
    }
}

// 6️⃣ Delete
async function deleteClass(id) {
    if(confirm("Delete this permanently?")) {
        try {
            await deleteDoc(doc(db, "classes", id));
            loadClasses();
        } catch (error) {
            alert("Error: " + error.message);
        }
    }
}

// 7️⃣ Logout
async function logout() {
    try {
        await signOut(auth);
        location.href = "login.html";
    } catch (error) {
        console.error("Logout failed", error);
    }
}

// 8️⃣ Global Exports 
window.addClass = addClass;
window.deleteClass = deleteClass;
window.toggleVisibility = toggleVisibility;
window.logout = logout;