async function fetchAnalytics() {
  const res = await fetch("http://localhost:3000/account/analytics", {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") },
  });
  const data = await res.json();

  document.querySelector("#cardUsers p").textContent = data.totalUsers;
  document.querySelector("#cardBalance p").textContent =
    "Ghc" + data.totalBalance;
  document.querySelector("#cardTransactions p").textContent =
    data.totalTransactions;
}

fetchAnalytics();
