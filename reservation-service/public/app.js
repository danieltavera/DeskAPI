const resourceSelect = document.getElementById('booking-resource');
const typeSelect = document.getElementById('booking-type');
const bookingsRows = document.getElementById('bookings-rows');

let resourcesCache = [];
let editingBookingId = null;

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? match[1] : null;
}

function getCurrentUserRole() {
  const token = getCookie('accessToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch (err) {
    return null;
  }
}

function authHeaders() {
  const token = getCookie('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function applyAdminVisibility() {
  const isAdmin = getCurrentUserRole() === 'admin';
  document.getElementById('admin-section').classList.toggle('hidden', !isAdmin);
}

async function loadResources() {
  try {
    const res = await fetch('/api/resources');
    const resources = await res.json();
    resourcesCache = resources;
    renderTypeOptions(resources);
    renderResourceOptions(typeSelect.value);
  } catch (err) {
    typeSelect.innerHTML = '<option value="">Could not load resources</option>';
    resourceSelect.innerHTML = '';
  }
}

function resourceName(resourceId) {
  const resource = resourcesCache.find((r) => String(r.id) === String(resourceId));
  return resource ? resource.name : `Resource #${resourceId}`;
}

function toDatetimeLocal(value) {
  return new Date(value).toISOString().slice(0, 16);
}

async function loadMyBookings() {
  try {
    const res = await fetch('/api/bookings', { headers: authHeaders() });
    const bookings = await res.json();
    renderBookings(bookings);
  } catch (err) {
    bookingsRows.innerHTML = '<tr><td colspan="5">Could not load bookings.</td></tr>';
  }
}

function renderBookings(bookings) {
  if (!bookings.length) {
    bookingsRows.innerHTML = '<tr><td colspan="5">You have no bookings yet.</td></tr>';
    return;
  }

  bookingsRows.innerHTML = bookings
    .map((b) => {
      if (editingBookingId === b.id) {
        return `
          <tr>
            <td>${resourceName(b.resourceId)}</td>
            <td><input type="datetime-local" id="edit-start-${b.id}" value="${toDatetimeLocal(b.startTime)}" /></td>
            <td><input type="datetime-local" id="edit-end-${b.id}" value="${toDatetimeLocal(b.endTime)}" /></td>
            <td><span class="status-badge">${b.status}</span></td>
            <td class="actions">
              <button class="btn-small btn-save" onclick="saveBookingEdit(${b.id})">Save</button>
              <button class="btn-small btn-cancel" onclick="cancelEditBooking()">Cancel</button>
            </td>
          </tr>`;
      }
      return `
        <tr>
          <td>${resourceName(b.resourceId)}</td>
          <td>${new Date(b.startTime).toLocaleString()}</td>
          <td>${new Date(b.endTime).toLocaleString()}</td>
          <td><span class="status-badge ${b.status === 'canceled' ? 'canceled' : ''}">${b.status}</span></td>
          <td class="actions">
            <button class="btn-small btn-edit" onclick="startEditBooking(${b.id})">Edit</button>
            <button class="btn-small btn-delete" onclick="deleteBooking(${b.id})">Cancel</button>
          </td>
        </tr>`;
    })
    .join('');
}

function startEditBooking(id) {
  editingBookingId = id;
  loadMyBookings();
}

function cancelEditBooking() {
  editingBookingId = null;
  loadMyBookings();
}

async function saveBookingEdit(id) {
  const startTime = document.getElementById(`edit-start-${id}`).value;
  const endTime = document.getElementById(`edit-end-${id}`).value;

  try {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ startTime, endTime }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Could not update booking');
    }
    editingBookingId = null;
    loadMyBookings();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteBooking(id) {
  if (!confirm('Cancel this booking?')) return;

  try {
    const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok && res.status !== 204) {
      const data = await res.json();
      throw new Error(data.message || 'Could not cancel booking');
    }
    loadMyBookings();
  } catch (err) {
    alert(err.message);
  }
}

function renderTypeOptions(resources) {
  const types = [...new Set(resources.map((r) => r.type))];
  typeSelect.innerHTML = types
    .map((type) => `<option value="${type}">${type}</option>`)
    .join('');
}

function renderResourceOptions(selectedType) {
  const filtered = resourcesCache.filter((r) => r.type === selectedType);
  resourceSelect.innerHTML = filtered.length
    ? filtered.map((r) => `<option value="${r.id}">${r.name}</option>`).join('')
    : '<option value="">No resources of this type</option>';
}

typeSelect.addEventListener('change', () => renderResourceOptions(typeSelect.value));

document.getElementById('booking-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageEl = document.getElementById('booking-message');
  const resourceId = resourceSelect.value;
  const startTime = document.getElementById('booking-start').value;
  const endTime = document.getElementById('booking-end').value;

  if (new Date(endTime) <= new Date(startTime)) {
    messageEl.textContent = 'End time must be after start time';
    messageEl.className = 'message error';
    return;
  }

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ resourceId, startTime, endTime }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Could not create booking');
    messageEl.textContent = 'Booking created successfully';
    messageEl.className = 'message success';
    e.target.reset();
    loadMyBookings();
  } catch (err) {
    messageEl.textContent = err.message;
    messageEl.className = 'message error';
  }
});

document.getElementById('resource-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageEl = document.getElementById('resource-message');
  const name = document.getElementById('resource-name').value;
  const type = document.getElementById('resource-type').value;
  const location = document.getElementById('resource-location').value;

  try {
    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name, type, location }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Could not create resource');
    messageEl.textContent = 'Resource created successfully';
    messageEl.className = 'message success';
    e.target.reset();
    loadResources();
  } catch (err) {
    messageEl.textContent = err.message;
    messageEl.className = 'message error';
  }
});

loadResources();
loadMyBookings();
applyAdminVisibility();
