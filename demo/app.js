const cars = [
  { name: "Toyota Corolla 2021", price: "$18,500", icon: "🚗" },
  { name: "Honda Civic 2020", price: "$16,900", icon: "🚙" },
  { name: "Ford Focus 2022", price: "$21,200", icon: "🚘" },
  { name: "Mazda 3 2019", price: "$14,750", icon: "🚗" }
];

const carGrid = document.getElementById("carGrid");
cars.forEach(c => {
  const div = document.createElement("div");
  div.className = "car-card";
  div.innerHTML = `
    <div class="img">${c.icon}</div>
    <div class="body">
      <h3>${c.name}</h3>
      <p class="price">${c.price}</p>
    </div>`;
  carGrid.appendChild(div);
});

function showMsg(el, text, ok) {
  el.textContent = text;
  el.className = "msg " + (ok ? "ok" : "err");
}

document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const msg = document.getElementById("feedbackMsg");
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const out = await res.json();
    if (res.ok) { showMsg(msg, out.message, true); form.reset(); }
    else showMsg(msg, out.error || "Something went wrong.", false);
  } catch {
    showMsg(msg, "Server error. Try again later.", false);
  }
});

document.getElementById("appointmentForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const msg = document.getElementById("appointmentMsg");
  try {
    const res = await fetch("/api/appointment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const out = await res.json();
    if (res.ok) { showMsg(msg, out.message, true); form.reset(); }
    else showMsg(msg, out.error || "Something went wrong.", false);
  } catch {
    showMsg(msg, "Server error. Try again later.", false);
  }
});
