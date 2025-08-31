async function fetchTransactions() {
  try {
    const res = await fetch("http://localhost:3000/account/transactions/0", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });

    if (!res.ok) throw new Error("Failed to fetch transactions");

    const transactions = await res.json();
    const tbody = document.querySelector("#transactionsTable tbody");
    tbody.innerHTML = "";

    transactions.forEach((tx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${tx.id}</td>
        <td>${tx.from_user || "—"}</td>
        <td class="status-${tx.type}">${tx.type}</td>
        <td>Ghc${tx.amount}</td>
        <td>${tx.to_user || "—"}</td>
        <td>${new Date(tx.created_at).toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

fetchTransactions();
