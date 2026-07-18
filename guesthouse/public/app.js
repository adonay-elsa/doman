document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('feedbackForm');
const status = document.getElementById('formStatus');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = 'Sending...';
  status.className = 'status';
  const data = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    rating: Number(form.rating.value),
    message: form.message.value.trim()
  };

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send');
    }
    status.textContent = 'Thank you! Your feedback has been received.';
    status.className = 'status ok';
    form.reset();
  } catch (err) {
    status.textContent = err.message || 'Something went wrong. Please try again.';
    status.className = 'status err';
  }
});
