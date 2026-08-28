const resourceSelect = document.getElementById('booking-resource');
const typeSelect = document.getElementById('booking-type');
const bookingsRows = document.getElementById('bookings-rows');
const resourceTypeSelect = document.getElementById('resource-type-select');
const resourceTypeNewInput = document.getElementById('resource-type-new');
const resourceLocationSelect = document.getElementById('resource-location-select');
const resourceLocationNewInput = document.getElementById('resource-location-new');

// keep in sync with the <option> list in index.html — used to turn a state code back into "City, STATE"
const AUSTRALIAN_CITIES = {
  'AU-NSW': 'Sydney, NSW',
  'AU-VIC': 'Melbourne, VIC',
  'AU-QLD': 'Brisbane, QLD',
  'AU-WA': 'Perth, WA',
  'AU-SA': 'Adelaide, SA',
  'AU-TAS': 'Hobart, TAS',
  'AU-NT': 'Darwin, NT',
  'AU-ACT': 'Canberra, ACT',
};

resourceLocationSelect.addEventListener('change', () => {
  const isOther = resourceLocationSelect.value === '__other__';
  resourceLocationNewInput.classList.toggle('hidden', !isOther);
  resourceLocationNewInput.required = isOther;
});

const attributesList = document.getElementById('attributes-list');

function addAttributeRow() {
  const row = document.createElement('div');
  row.className = 'attribute-row';
  row.innerHTML = `
    <input type="text" class="attribute-name" placeholder="Attribute (e.g. capacity)" />
    <input type="text" class="attribute-info" placeholder="Info (e.g. 8)" />
    <button type="button" class="btn-small btn-delete">Remove</button>
  `;
  row.querySelector('button').addEventListener('click', () => row.remove());
  attributesList.appendChild(row);
}

document.getElementById('add-attribute-btn').addEventListener('click', addAttributeRow);

function collectAttributes() {
  const attributes = {};
  attributesList.querySelectorAll('.attribute-row').forEach((row) => {
    const name = row.querySelector('.attribute-name').value.trim();
    const info = row.querySelector('.attribute-info').value.trim();
    if (!name) return;
    const numericInfo = Number(info);
    attributes[name] = info !== '' && !Number.isNaN(numericInfo) ? numericInfo : info;
  });
  return Object.keys(attributes).length ? attributes : null;
}

let resourcesCache = [];
let editingBookingId = null;

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? match[1] : null;
}

// this page requires a logged-in session — bounce back to auth-service if there's no token
if (!getCookie('accessToken')) {
  window.location.href = 'http://localhost:3001';
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
    const res = await fetch('/api/resources', { headers: authHeaders() });
    const resources = await res.json();
    resourcesCache = resources;
    renderTypeOptions(resources);
    renderResourceOptions(typeSelect.value);
  } catch (err) {
    typeSelect.innerHTML = '<option value="">Could not load resources</option>';
    resourceSelect.innerHTML = '';
  }
}

async function loadResourceTypes() {
  try {
    const res = await fetch('/api/resource-types', { headers: authHeaders() });
    const types = await res.json();
    resourceTypeSelect.innerHTML =
      types.map((t) => `<option value="${t.name}">${t.name}</option>`).join('') +
      '<option value="__new__">+ Add new type...</option>';
  } catch (err) {
    resourceTypeSelect.innerHTML = '<option value="__new__">+ Add new type...</option>';
  }
}

resourceTypeSelect.addEventListener('change', () => {
  const isNew = resourceTypeSelect.value === '__new__';
  resourceTypeNewInput.classList.toggle('hidden', !isNew);
  resourceTypeNewInput.required = isNew;
});

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
  typeSelect.innerHTML =
    '<option value="" disabled selected>Select your type</option>' +
    types.map((type) => `<option value="${type}">${type}</option>`).join('');
}

function renderResourceOptions(selectedType) {
  if (!selectedType) {
    resourceSelect.innerHTML = '<option value="" disabled selected>Select your resource</option>';
    return;
  }
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
    renderTypeOptions(resourcesCache);
    renderResourceOptions('');
    loadMyBookings();
  } catch (err) {
    messageEl.textContent = err.message;
    messageEl.className = 'message error';
    alert(err.message);
  }
});

document.getElementById('resource-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageEl = document.getElementById('resource-message');
  const name = document.getElementById('resource-name').value;
  const type =
    resourceTypeSelect.value === '__new__'
      ? resourceTypeNewInput.value.trim()
      : resourceTypeSelect.value;

  const isOtherLocation = resourceLocationSelect.value === '__other__';
  const stateCode = isOtherLocation ? null : resourceLocationSelect.value || null;
  const location = isOtherLocation
    ? resourceLocationNewInput.value.trim()
    : AUSTRALIAN_CITIES[resourceLocationSelect.value] || '';

  if (!location) {
    messageEl.textContent = 'Location is required';
    messageEl.className = 'message error';
    return;
  }

  const attributes = collectAttributes();

  try {
    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name, type, location, stateCode, attributes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Could not create resource');
    messageEl.textContent = 'Resource created successfully';
    messageEl.className = 'message success';
    e.target.reset();
    resourceTypeNewInput.classList.add('hidden');
    resourceLocationNewInput.classList.add('hidden');
    attributesList.innerHTML = '';
    loadResourceTypes();
    loadResources();
  } catch (err) {
    messageEl.textContent = err.message;
    messageEl.className = 'message error';
  }
});

loadResources();
loadResourceTypes();
loadMyBookings();
applyAdminVisibility();

document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await fetch('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      headers: authHeaders(),
    });
  } catch (err) {
    // even if the request fails, clear the local session so the user isn't stuck
  }
  localStorage.removeItem('accessToken');
  document.cookie = 'accessToken=; path=/; max-age=0';
  window.location.href = 'http://localhost:3001';
});
