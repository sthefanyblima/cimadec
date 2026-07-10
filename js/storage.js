let rawDb = JSON.parse(localStorage.getItem('cimadec_db_v13')) || initialMock;

let seenIoTActive = false;
let db = rawDb.filter(item => {
    if (item.id.startsWith('IOT-ANA') && item.status !== 'resolvido') {
        if (seenIoTActive) return false;
        seenIoTActive = true;
    }
    return true;
});

localStorage.setItem('cimadec_db_v13', JSON.stringify(db));

let autoAlertsLog = [];
let currentUserRole = null;
let currentCitizenLocation = { lat: -9.665, lng: -35.735 };

function saveDb() {
    localStorage.setItem('cimadec_db_v13', JSON.stringify(db));
}