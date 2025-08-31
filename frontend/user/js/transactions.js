document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userId = JSON.parse(localStorage.getItem("userId"));
  const tbody = document.getElementById("transactionsTable");

  try {
    const res = await fetch(
      `http://localhost:3000/account/transactions/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();

    tbody.innerHTML = data
      .map(
        (t) => `
        <tr>
          <td>${t.id}</td>
          <td class="status-${t.type}">${t.type}</td>
          <td>Ghc${t.amount}</td>
          <td>${t.to_user || "-"}</td>
          <td>${new Date(t.created_at).toLocaleString()}</td>
        </tr>
      `
      )
      .join("");
  } catch (err) {
    console.error("Error loading transactions:", err);
  }
});
