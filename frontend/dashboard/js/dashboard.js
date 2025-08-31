document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("contentArea");

  // Logout clears token
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "../index.html";
    });
  }

  // Protect dashboard
  if (!localStorage.getItem("token")) {
    window.location.href = "../index.html";
  }

  // Load page dynamically
  async function loadPage(page) {
    try {
      const res = await fetch(page);
      if (!res.ok) throw new Error("Failed to fetch " + page);

      const html = await res.text();
      contentArea.innerHTML = html;

      // If the page has a matching JS file, load it dynamically
      const scriptPath = `js/${page.replace(".html", "")}.js`;
      fetch(scriptPath)
        .then((r) => {
          if (r.ok) {
            const script = document.createElement("script");
            script.src = scriptPath;
            script.defer = true;
            document.body.appendChild(script);
          }
        })
        .catch(() => {});
    } catch (err) {
      console.error(err);
      contentArea.innerHTML = `<p style="color:red;">Error loading ${page}</p>`;
    }
  }

  // Attach sidebar link listeners
  document.querySelectorAll(".sidebar a[data-page]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("href");
      loadPage(page);
    });
  });

  // Default: load home page
  loadPage("home.html");
});
