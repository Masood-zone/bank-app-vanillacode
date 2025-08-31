document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginResult = document.getElementById("loginResult");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("userId", data.user.id);

        // ✅ Redirect based on role
        if (data.user.role === "admin") {
          window.location.href = "dashboard/dashboard.html";
        } else {
          window.location.href = "user/dashboard.html";
        }
      } else {
        loginResult.textContent = `❌ ${data.message}`;
        loginResult.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      loginResult.textContent = "❌ Server error";
      loginResult.style.color = "red";
    }
  });
});
