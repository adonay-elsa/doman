document.getElementById("reserveForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const msg = document.getElementById("reserveMsg");
  try {
    const res = await fetch("/api/reserve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const out = await res.json();
    if (res.ok) { msg.textContent = out.message; msg.className = "msg ok"; form.reset(); }
    else { msg.textContent = out.error || "Something went wrong."; msg.className = "msg err"; }
  } catch {
    msg.textContent = "Cannot reach the server. Make sure it is running (npm start).";
    msg.className = "msg err";
  }
});
