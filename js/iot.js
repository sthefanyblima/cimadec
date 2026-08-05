let iotInterval = null;
let sensor1Level = 45;
let sensor2Level = 12;
let alertaHidricoAtivo = false;

function startIoTSimulation() {
    if(iotInterval) clearInterval(iotInterval);

    iotInterval = setInterval(() => {
        sensor1Level += Math.floor(Math.random() * 15) - 3;
        sensor2Level += Math.floor(Math.random() * 10) - 2;

        if(sensor1Level < 10) sensor1Level = 10;
        if(sensor2Level < 0) sensor2Level = 0;

        updateSensorUI('c-iot-bar-1', 'c-iot-val-1', sensor1Level, true);
        updateSensorUI('c-iot-bar-2', 'c-iot-val-2', sensor2Level, false);
        updateSensorUI('o-iot-bar-1', 'o-iot-val-1', sensor1Level, true);
        updateSensorUI('o-iot-bar-2', 'o-iot-val-2', sensor2Level, false);

        // Anomalia hídrica: alerta visual (simulação de telemetria), sem gravar ocorrência.
        if(sensor1Level > 95 && !alertaHidricoAtivo) {
            alertaHidricoAtivo = true;
            sensor1Level = 30;

            const msgAlerta = 'ALERTA AUTOMÁTICO: Sensor registrou nível hídrico acima da cota de segurança.';
            autoAlertsLog.unshift({ hora: new Date().toLocaleTimeString('pt-BR'), msg: msgAlerta });

            const banner = document.getElementById('global-alert-banner');
            const msg = document.getElementById('global-alert-msg');
            if(banner && msg) {
                msg.textContent = msgAlerta;
                banner.classList.remove('hidden');
            }

            if(currentUserRole === 'operador') {
                const log = document.getElementById('iot-log');
                if(log) { log.innerHTML += `<span class="text-red-400">> [ALERTA] Risco Inundação</span>`; log.scrollTop = log.scrollHeight; }
            } else if (currentUserRole === 'cidadao') {
                if(!document.getElementById('view-c-alertas').classList.contains('hidden')) renderCitizenAlertas();
            }

            // Libera novo alerta depois de um tempo (evita spam do banner).
            setTimeout(() => { alertaHidricoAtivo = false; }, 30000);
        }
    }, 4000);
}

function updateSensorUI(barId, valId, value, isPercentage) {
    const bar = document.getElementById(barId);
    const val = document.getElementById(valId);
    if(bar && val) {
        bar.style.width = `${value > 100 ? 100 : value}%`;
        val.textContent = isPercentage ? `${value}%` : `${value}mm/h`;

        let colorClass = "bg-green-400";
        let textClass = "text-green-400";
        if(isPercentage) {
            if(value > 85) { colorClass = "bg-red-500 animate-pulse"; textClass = "text-red-500 animate-pulse"; }
            else if(value > 60) { colorClass = "bg-yellow-400"; textClass = "text-yellow-400"; }
            else { colorClass = "bg-blue-400"; textClass = "text-blue-400"; }
        } else {
            if(value > 50) { colorClass = "bg-red-500 animate-pulse"; textClass = "text-red-500 animate-pulse"; }
        }
        bar.className = `${colorClass} h-1.5 md:h-2 rounded-full transition-all duration-1000`;
        val.className = `font-mono font-bold ${textClass}`;
    }
}
