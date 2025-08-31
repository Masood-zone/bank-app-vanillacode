const token = localStorage.getItem("token");
const userSelect = document.getElementById("userSelect");
const transferTo = document.getElementById("transferTo");
const transferToWrapper = document.getElementById("transferToWrapper");
const operationType = document.getElementById("operationType");
const operationForm = document.getElementById("operationForm");
const opResult = document.getElementById("opResult");

if (!token) {
  window.location.href = "../index.html";
}

// ✅ Fetch all users and populate dropdowns with IDs as values
async function loadUsers() {
  try {
    const res = await fetch("http://localhost:3000/account/users", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Handle auth / server errors explicitly so the UI shows feedback
    if (!res.ok) {
      // If token is invalid/expired, drop it and go back to login
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        window.location.href = "../index.html";
        return;
      }

      const errBody = await res
        .json()
        .catch(() => ({ message: res.statusText }));
      console.error("Error loading users", errBody);
      opResult.textContent = `❌ ${errBody.message || "Failed to load users"}`;
      opResult.style.color = "red";
      return;
    }

    const users = await res.json();

    // Defensive: ensure we have an array
    if (!Array.isArray(users)) {
      console.error("Unexpected users response", users);
      opResult.textContent = "❌ Unexpected data from server";
      opResult.style.color = "red";
      return;
    }

    userSelect.innerHTML = "";
    transferTo.innerHTML = "";

    // placeholder so the select shows something immediately
    const placeholder1 = document.createElement("option");
    placeholder1.value = "";
    placeholder1.textContent = "-- Select user --";
    placeholder1.disabled = true;
    placeholder1.selected = true;
    userSelect.appendChild(placeholder1);

    const placeholder2 = document.createElement("option");
    placeholder2.value = "";
    placeholder2.textContent = "-- Select recipient --";
    placeholder2.disabled = true;
    placeholder2.selected = true;
    transferTo.appendChild(placeholder2);

    users.forEach((u) => {
      const display = u.email || u.name || `User ${u.id}`;

      const opt1 = document.createElement("option");
      opt1.value = u.id; // backend expects IDs
      opt1.textContent = display;

      const opt2 = document.createElement("option");
      opt2.value = u.id;
      opt2.textContent = display;

      userSelect.appendChild(opt1);
      transferTo.appendChild(opt2);
    });
  } catch (err) {
    console.error("Error loading users", err);
    opResult.textContent = "❌ Network / server error while loading users";
    opResult.style.color = "red";
  }
}

loadUsers();

// ✅ Show transferTo only if operation is transfer
operationType.addEventListener("change", () => {
  if (operationType.value === "transfer") {
    transferToWrapper.style.display = "block";
  } else {
    transferToWrapper.style.display = "none";
  }
});

// ✅ Handle form submission
operationForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const type = operationType.value;
  const amount = parseFloat(document.getElementById("amount").value);

  let url = "";
  let payload = {};

  if (type === "deposit") {
    url = "http://localhost:3000/account/deposit";
    payload = { userId: userSelect.value, amount };
  } else if (type === "withdraw") {
    url = "http://localhost:3000/account/withdraw";
    payload = { userId: userSelect.value, amount };
  } else if (type === "transfer") {
    url = "http://localhost:3000/account/transfer";
    payload = {
      fromUserId: userSelect.value,
      toUserId: transferTo.value,
      amount,
    };
  }

  try {
    const res = await fetch(url, {
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
      transferToWrapper.style.display = "none"; // hide again after reset
    } else {
      opResult.textContent = `❌ ${
        data.message || "Error performing operation"
      }`;
      opResult.style.color = "red";
    }
  } catch (err) {
    console.error("Error performing operation", err);
    opResult.textContent = "❌ Server error";
    opResult.style.color = "red";
  }
});
