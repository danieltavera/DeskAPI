async function loadLogs() {
  const rows = document.getElementById('log-rows');
  try {
    const res = await fetch('/api/logs');
    const logs = await res.json();
    if (!logs.length) {
      rows.innerHTML = '<tr><td colspan="4">No events yet.</td></tr>';
      return;
    }
    rows.innerHTML = logs
      .map(
        (log) => `
          <tr>
            <td><span class="badge">${log.event}</span></td>
            <td>${log.user_id}</td>
            <td>${log.message}</td>
            <td>${new Date(log.date).toLocaleString()}</td>
          </tr>`
      )
      .join('');
  } catch (err) {
    rows.innerHTML = '<tr><td colspan="4">Could not load activity history.</td></tr>';
  }
}

loadLogs();
