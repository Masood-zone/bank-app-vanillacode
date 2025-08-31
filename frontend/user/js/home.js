document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userId = JSON.parse(localStorage.getItem("userId"));
  const userName = localStorage.getItem("username");
  document.getElementById("username").textContent = userName;

  try {
    // Get balance
    const res1 = await fetch(
      `http://localhost:3000/account/balance/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const balData = await res1.json();
    document.getElementById("balance").textContent = `Ghc${balData.balance}`;

    // Get transactions count
    const res2 = await fetch(
      `http://localhost:3000/account/transactions/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const txData = await res2.json();
    document.getElementById("transactionsCount").textContent = txData.length;
  } catch (err) {
    console.error("Error loading user home:", err);
  }
});
