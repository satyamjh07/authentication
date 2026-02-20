import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const AFTER_LOGIN_REDIRECT = "https://adultverse.netlify.app/";

// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC8D0_4qFsTCYtFtzKFDcb3ExHUdm5MNas",
  authDomain: "unbound-auh.firebaseapp.com",
  projectId: "unbound-auh",
  storageBucket: "unbound-auh.firebasestorage.app",
  messagingSenderId: "826706998099",
  appId: "1:826706998099:web:c63b75992e13b7af8667a6",
  measurementId: "G-L0VEBEZT7F"
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


// 🔔 Toast Function
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.classList.add("toast", type);
  toast.innerText = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}


// ===================================================
// 🔐 AUTH STATE LISTENER (GLOBAL REDIRECTION + PROFILE)
// ===================================================

onAuthStateChanged(auth, (user) => {

  const path = window.location.pathname;

  const isDashboard = path.includes("dashboard");
  const isAuthPage = path.includes("index") || 
                     path.includes("signup") || 
                     path === "/" || 
                     path === "";

  // 🔐 If logged in → prevent staying on login/signup
  if (user && isAuthPage) {
    window.location.replace(AFTER_LOGIN_REDIRECT);
    return;
  }

  // 🚫 If NOT logged in → block dashboard access
  if (!user && isDashboard) {
    window.location.replace("index.html");
    return;
  }

  // 👤 If logged in AND on dashboard → show profile info
  if (user && isDashboard) {

    const usernameEl = document.getElementById("username");
    const emailEl = document.getElementById("emailDisplay");
    const profilePicEl = document.getElementById("profilePic");

    if (usernameEl) {
      usernameEl.innerText = user.displayName || "User";
    }

    if (emailEl) {
      emailEl.innerText = user.email;
    }

    if (profilePicEl) {
      profilePicEl.src = user.photoURL || "default-avatar.png";
    }

  }

});


// ===================================================
// 📝 SIGN UP
// ===================================================

const signupBtn = document.getElementById("signupBtn");

if (signupBtn) {
  signupBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email) return showToast("Email is required", "error");
    if (!password) return showToast("Password is required", "error");
    if (password.length < 6) return showToast("Password must be at least 6 characters", "error");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      showToast("Account created! Verification email sent.", "success");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);

    } catch (error) {
      showToast(error.message, "error");
    }

  });
}


// ===================================================
// 🔑 LOGIN (EMAIL + PASSWORD)
// ===================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const loginBtn = document.getElementById("loginBtn");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email) return showToast("Email is required", "error");
    if (!password) return showToast("Password is required", "error");

    loginBtn.innerText = "Logging in...";
    loginBtn.disabled = true;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        showToast("Please verify your email first.", "error");
        loginBtn.innerText = "Login";
        loginBtn.disabled = false;
        return;
      }

      showToast("Login Successful!", "success");

      setTimeout(() => {
        window.location.replace(AFTER_LOGIN_REDIRECT);
      }, 1200);

    } catch (error) {
      showToast(error.message, "error");
    }

    loginBtn.innerText = "Login";
    loginBtn.disabled = false;

  });
}


// ===================================================
// 🌍 GOOGLE LOGIN
// ===================================================

async function signInWithGoogle() {
  try {
    await signInWithPopup(auth, provider);
    showToast("Logged in successfully!", "success");
  } catch (error) {
    showToast("Google login failed", "error");
  }
}

const googleBtn = document.getElementById("googleLoginBtn");

if (googleBtn) {
  googleBtn.addEventListener("click", signInWithGoogle);
}


// ===================================================
// 🔁 FORGOT PASSWORD
// ===================================================

const forgotPassword = document.getElementById("forgotPassword");

if (forgotPassword) {
  forgotPassword.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();

    if (!email) return showToast("Please enter your email first", "error");

    try {
      await sendPasswordResetEmail(auth, email);
      showToast("Password reset email sent!", "success");
    } catch (error) {
      showToast(error.message, "error");
    }

  });
}


// ===================================================
// 🚪 LOGOUT
// ===================================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      showToast("Logged out successfully!", "success");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);

    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

// UPDATING PROFILE SYSTEM
const saveBtn = document.getElementById("saveProfile");

if (saveBtn) {
  saveBtn.addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) return;

    const newName = document.getElementById("newName").value.trim();
    const newPhoto = document.getElementById("newPhoto").value.trim();

    try {
      await updateProfile(user, {
        displayName: newName || user.displayName,
        photoURL: newPhoto || user.photoURL
      });

      showToast("Profile updated successfully!", "success");

      // Refresh UI instantly
      document.getElementById("username").innerText = user.displayName;
      document.getElementById("profilePic").src = user.photoURL;

    } catch (error) {
      showToast(error.message, "error");
    }

  });
}
