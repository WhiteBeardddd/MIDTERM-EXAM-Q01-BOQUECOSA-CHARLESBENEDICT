
const API = '/api/announcements';
const $ = (id) => document.getElementById(id);

function showMsg(el, text, type) {
    el.textContent = text || '';
    el.className = 'msg' + (text ? ' ' + type : '');
}

function buildCard(a) {
    const card = document.createElement('article');
    card.className = 'announcement ' + a.status;

    const top = document.createElement('div');
    top.className = 'top';

    const h3 = document.createElement('h3');
    h3.textContent = `#${a.id} — ${a.title}`;

    const badge = document.createElement('span');
    badge.className = 'badge ' + a.status;
    badge.textContent = a.status;

    top.append(h3, badge);

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${a.category} | Posted ${a.date_posted} | Expires ${a.expiry_date}`;

    const body = document.createElement('div');
    body.textContent = a.message;

    const actions = document.createElement('div');
    actions.className = 'actions';
    const del = document.createElement('button');
    del.className = 'danger';
    del.textContent = 'Delete';
    del.addEventListener('click', () => deleteAnnouncement(a.id));
    actions.append(del);

    card.append(top, meta, body, actions);
    return card;
}

async function loadAll() {
    const list = $('list');
    try {
    const res = await fetch(API);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load announcements.');
    list.replaceChildren();
    if (!data.length) {
        const p = document.createElement('p');
        p.className = 'empty';
        p.textContent = 'No announcements yet. Add one above.';
        list.append(p);
    } else {
        data.forEach((a) => list.append(buildCard(a)));
    }
    showMsg($('listMsg'), '');
    } catch (err) {
    showMsg($('listMsg'), err.message, 'err');
    }
}

async function findById() {
    const id = $('searchId').value.trim();
    const out = $('findResult');
    out.replaceChildren();
    if (!id) return showMsg($('findMsg'), 'Enter an ID to search.', 'err');
    try {
    const res = await fetch(`${API}/${encodeURIComponent(id)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Search failed.');
    out.append(buildCard(data));
    showMsg($('findMsg'), '');
    } catch (err) {
    showMsg($('findMsg'), err.message, 'err');
    }
}

async function addAnnouncement() {
    const payload = {
    title: $('title').value,
    message: $('message').value,
    date_posted: $('date_posted').value,
    expiry_date: $('expiry_date').value,
    category: $('category').value,
    };
    try {
    const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not add announcement.');
    showMsg($('addMsg'), `Announcement #${data.id} posted (${data.status}).`, 'ok');
    $('title').value = '';
    $('message').value = '';
    $('expiry_date').value = '';
    loadAll();
    } catch (err) {
    showMsg($('addMsg'), err.message, 'err');
    }
}

async function deleteAnnouncement(id) {
    if (!confirm(`Delete announcement #${id}?`)) return;
    try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not delete.');
    showMsg($('listMsg'), data.message, 'ok');
    $('findResult').replaceChildren();
    loadAll();
    } catch (err) {
    showMsg($('listMsg'), err.message, 'err');
    }
}

(function setToday() {
    const n = new Date();
    $('date_posted').value =
    `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
})();

$('addBtn').addEventListener('click', addAnnouncement);
$('findBtn').addEventListener('click', findById);
$('searchId').addEventListener('keydown', (e) => { if (e.key === 'Enter') findById(); });
$('clearBtn').addEventListener('click', () => {
    $('searchId').value = '';
    $('findResult').replaceChildren();
    showMsg($('findMsg'), '');
});
$('refreshBtn').addEventListener('click', loadAll);

loadAll();