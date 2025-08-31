document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "../index.html";
    return;
  }

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // clear user cache
    window.location.href = "../index.html";
  });

  // Check role
  const role = localStorage.getItem("role");
  if (!role || role !== "user") {
    window.location.href = "../index.html"; // block admins here
  }
});
