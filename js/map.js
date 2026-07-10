let reportMap, reportMarker, reportCircle, cDashMap, oMap, rainLayer;

async function fetchAddress(lat, lng) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&_t=${Date.now()}`);
        const data = await res.json();
        if (!data || !data.address) return "Logradouro não mapeado.";

        const a = data.address;
        const logradouro = a.road || a.pedestrian || a.path || a.footway || a.square || "";
        const numero = a.house_number || "";
        const bairro = a.suburb || a.neighbourhood || a.village || a.city_district || "";
        const cidade = a.city || a.town || a.municipality || "Maceió";

        let enderecoCompleto = "";
        if (logradouro) enderecoCompleto += numero ? `${logradouro}, ${numero}` : logradouro;
        if (bairro) enderecoCompleto += enderecoCompleto ? ` - ${bairro}` : bairro;
        if (cidade) enderecoCompleto += enderecoCompleto ? ` - ${cidade}` : cidade;

        return enderecoCompleto || "Coordenada sem endereço oficial associado";
    } catch (error) { return "Erro na busca via satélite."; }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI/180);
    const dLon = (lon2 - lon1) * (Math.PI/180); 
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
}

function initReportMap() {
    if(reportMap) { reportMap.invalidateSize(); return; }
    reportMap = L.map('map-report').setView([-9.665, -35.735], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(reportMap);
    reportMap.on('click', async (e) => setMapPin(e.latlng.lat, e.latlng.lng));
}

async function setMapPin(lat, lng) {
    document.getElementById('form-lat').value = lat.toFixed(5);
    document.getElementById('form-lng').value = lng.toFixed(5);
    document.getElementById('address-display').innerHTML = "<span class='text-gray-500'>Sincronizando...</span>";
    
    if(reportMarker) reportMap.removeLayer(reportMarker);
    if(reportCircle) reportMap.removeLayer(reportCircle);
    
    reportCircle = L.circle([lat, lng], { radius: 150, color: '#9B1B30', fillColor: '#9B1B30', fillOpacity: 0.2, weight: 1 }).addTo(reportMap);
    reportMarker = L.marker([lat, lng], { draggable: true }).addTo(reportMap);
    reportMap.setView([lat, lng], 16); 

    reportMarker.on('drag', function(event) {
        reportCircle.setLatLng(event.target.getLatLng());
    });

    reportMarker.on('dragend', async function(event) {
        const position = event.target.getLatLng();
        document.getElementById('form-lat').value = position.lat.toFixed(5);
        document.getElementById('form-lng').value = position.lng.toFixed(5);
        document.getElementById('address-display').innerHTML = "<span class='text-gray-500'>Recalculando logradouro...</span>";
        
        const address = await fetchAddress(position.lat, position.lng);
        document.getElementById('address-display').textContent = address;
        document.getElementById('form-address').value = address;
    });

    const address = await fetchAddress(lat, lng);
    document.getElementById('address-display').textContent = address;
    document.getElementById('form-address').value = address;
}

function getLocation() {
    if (navigator.geolocation) {
        const geoOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
        document.getElementById('address-display').innerHTML = "<span class='text-gray-500'>Buscando sinal preciso...</span>";

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                let lat = pos.coords.latitude;
                let lng = pos.coords.longitude;
                const inMaceioLat = lat > -9.8 && lat < -9.4;
                const inMaceioLng = lng > -35.9 && lng < -35.5;
                if(!inMaceioLat || !inMaceioLng) {
                    showToast("Localização imprecisa. O pino foi posto no centro — arraste-o para o local.", 'warning');
                    lat = -9.664448; lng = -35.735075;
                }
                setMapPin(lat, lng);
            },
            (err) => {
                showToast("Sinal GPS indisponível. Clique diretamente no mapa.", 'error');
                document.getElementById('address-display').textContent = "Defina o local no mapa.";
            },
            geoOptions
        );
    }
}

window.toggleRadar = async function(isOn) {
    if(!oMap) return;
    if(rainLayer) oMap.removeLayer(rainLayer);
    if(isOn) {
        try {
            const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
            const data = await res.json();
            const latestFrame = data.radar.past[data.radar.past.length - 1].path;
            rainLayer = L.tileLayer(`https://tilecache.rainviewer.com${latestFrame}/256/{z}/{x}/{y}/2/1_1.png`, { opacity: 0.6, zIndex: 20 }).addTo(oMap);
        } catch (e) {
            showToast("Radar meteorológico indisponível no momento.", 'error');
            document.getElementById('toggle-radar').checked = false;
        }
    }
}