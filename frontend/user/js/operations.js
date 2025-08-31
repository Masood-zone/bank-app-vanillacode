const token = localStorage.getItem("token");
const userId = JSON.parse(localStorage.getItem("userId"));
const operationType = document.getElementById("operationType");
const transferToWrapper = document.getElementById("transferToWrapper");
const transferTo = document.getElementById("transferTo");
const operationForm = document.getElementById("operationForm");
const opResult = document.getElementById("opResult");

if (!token) {
  window.location.href = "../index.html";
}

// Load users for transfer
async function loadUsers() {
  const res = await fetch("http://localhost:3000/auth/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const users = await res.json();
  transferTo.innerHTML = "";
  users
    .filter((u) => u.id !== userId) // exclude self
    .forEach((u) => {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = u.name;
      transferTo.appendChild(opt);
    });
}
loadUsers();

operationType.addEventListener("change", () => {
  transferToWrapper.style.display =
    operationType.value === "transfer" ? "block" : "none";
});

operationForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  let endpoint = "";
  let payload = {};

  if (operationType.value === "deposit") {
    endpoint = "deposit";
    payload = { userId: userId, amount: parseFloat(amount.value) };
  } else if (operationType.value === "withdraw") {
    endpoint = "withdraw";
    payload = { userId: userId, amount: parseFloat(amount.value) };
  } else {
    endpoint = "transfer";
    payload = {
      fromUserId: userId,
      toUserId: parseInt(transferTo.value),
      amount: parseFloat(amount.value),
    };
  }

  try {
    const res = await fetch(`http://localhost:3000/account/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      opResult.textContent = "✅ Operation successful!";
      opResult.style.color = "green";
      operationForm.reset();
    } else {
      opResult.textContent = `❌ ${data.message || "Operation failed"}`;
      opResult.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    opResult.textContent = "❌ Server error";
    opResult.style.color = "red";
  }
});
