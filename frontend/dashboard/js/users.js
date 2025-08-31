const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const tbody = document.getElementById("usersTable");

if (!token) {
  window.location.href = "../index.html";
}

// Load Users into table
async function loadUsers() {
  try {
    const res = await fetch("http://localhost:3000/auth/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const users = await res.json();
    tbody.innerHTML = users
      .map(
        (u) => `
          <tr>
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.name}</td>
            <td>${u.role}</td>
            <td>Ghc${u.balance}</td>
          </tr>`
      )
      .join("");
  } catch (err) {
    console.error("Error loading users:", err);
  }
}

loadUsers();

// Modal logic
const modal = document.getElementById("userModal");
const openModalBtn = document.getElementById("openUserModal");
const closeModal = modal.querySelector(".close");

openModalBtn.onclick = () => (modal.style.display = "block");
closeModal.onclick = () => (modal.style.display = "none");
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// Handle Register Form
const registerForm = document.getElementById("registerUserForm");
const resultMsg = document.getElementById("registerResult");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    username: document.getElementById("newUsername").value,
    email: document.getElementById("newUserEmail").value,
    name: document.getElementById("newName").value,
    password: document.getElementById("newPassword").value,
    role: document.getElementById("newRole").value,
    adminId: userId,
  };

  try {
    const res = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      resultMsg.textContent = "✅ User registered successfully!";
      resultMsg.style.color = "green";
      registerForm.reset();
      loadUsers();
    } else {
      resultMsg.textContent = `❌ ${data.message || "Error"}`;
      resultMsg.style.color = "red";
    }
  } catch (err) {
    console.error("Error registering user:", err);
    resultMsg.textContent = "❌ Server error";
    resultMsg.style.color = "red";
  }
});
