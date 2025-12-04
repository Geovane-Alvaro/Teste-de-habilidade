// =================== GLOBALS ===================
let map = null;
let talhoesLayerGroup = L.layerGroup();
let destaqueLayer = null;
let coordinatesData = []; // dados agrupados por talhão

// =================== NORMALIZAR COORDENADAS ===================
function normalizePoint(lat, lng) {
    lat = typeof lat === "string" ? parseFloat(lat.replace(",", ".")) : lat;
    lng = typeof lng === "string" ? parseFloat(lng.replace(",", ".")) : lng;

    if (isNaN(lat) || isNaN(lng)) return null;

    if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
        const tmp = lat;
        lat = lng;
        lng = tmp;
    }

    return [lat, lng];
}

// =================== DESENHAR TALHÕES ===================
function desenharTalhoes(lista) {
    talhoesLayerGroup.clearLayers();
    const allBounds = [];

    lista.forEach(item => {
        const pts = item.coordinates
            .map(c => normalizePoint(c[0], c[1]))
            .filter(Boolean);

        if (pts.length < 3) return;

        const polygon = L.polygon(pts, {
            color: "orange",
            weight: 2,
            fillColor: "yellow",
            fillOpacity: 0.35
        }).bindPopup(`
            <b>Talhão:</b> ${item.talhao}<br>
            <b>Área:</b> ${item.area ?? "—"}
        `);

        const center = polygon.getBounds().getCenter();
        const label = L.marker(center, {
            icon: L.divIcon({
                className: "talhao-label",
                html: `<b>${item.talhao}</b>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        });

        talhoesLayerGroup.addLayer(label);
        talhoesLayerGroup.addLayer(polygon);
        allBounds.push(polygon.getBounds());
    });

    if (allBounds.length) {
        const totalBounds = allBounds.reduce((acc, b) => acc.extend(b), allBounds[0]);
        map.fitBounds(totalBounds, { maxZoom: 18, padding: [20, 20] });
    }
}

// =================== DESTACAR TALHÃO ===================
function destacarTalhao(item) {
    if (destaqueLayer) {
        map.removeLayer(destaqueLayer);
        destaqueLayer = null;
    }

    const pts = item.coordinates
        .map(c => normalizePoint(c[0], c[1]))
        .filter(Boolean);

    destaqueLayer = L.polygon(pts, {
        color: "#2196F3",
        weight: 3,
        fillColor: "#64B5F6",
        fillOpacity: 0.4
    }).addTo(map);

    map.fitBounds(destaqueLayer.getBounds(), {
        maxZoom: 17,
        padding: [20, 20]
    });
}

// =================== INICIAR MAPA ===================
function iniciarMapaEdicao() {
    map = L.map("map-cadastro").setView([-21.9269, -46.9247], 15);

    const tileLayerClaro = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "© OpenStreetMap contributors" }
    );

    const tileLayerEscuro = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { opacity: 0.5 }
    );

    tileLayerClaro.addTo(map);

    const baseMaps = {
        Claro: tileLayerClaro,
        Escuro: tileLayerEscuro
    };

    L.control.layers(baseMaps).addTo(map);

    talhoesLayerGroup.addTo(map);
}

// =================== MAIN EDIT ===================
document.addEventListener("DOMContentLoaded", async function () {

    const setorInput = document.querySelector('#setor');
    const talhaoSelect = document.querySelector('#talhao');
    const fazendaInput = document.querySelector('input[name="fazenda"]');
    const areaInput = document.querySelector('input[name="area"]');
    const corteSelect = document.querySelector("#corte");
    const variedadeSelect = document.querySelector("#variedade");

    iniciarMapaEdicao();

    const setor = setorInput.value.trim();
    const talhaoAtual = talhaoSelect.value.trim();

    if (setor) {
        // Buscar SHAPE e desenhar no mapa
        fetch(`/rotafazenda/shape/${setor}`)
            .then(res => res.json())
            .then(data => {

                const raw = data.coordinatesArray;

                // AGRUPAR igual ao CREATE
                const agrup = {};
                raw.forEach(p => {
                    if (!agrup[p.talhao]) {
                        agrup[p.talhao] = {
                            talhao: p.talhao,
                            area: p.area ?? null,
                            descricaoFazenda: p.descricaoFazenda ?? null,
                            coordinates: []
                        };
                    }

                    agrup[p.talhao].coordinates.push([p.latitude, p.longitude]);
                });

                coordinatesData = Object.values(agrup);

                // desenhar todos
                desenharTalhoes(coordinatesData);

                // recriar select talhão
                talhaoSelect.innerHTML = '<option value="">Selecione um talhão</option>';
                coordinatesData.forEach(t => {
                    const opt = document.createElement("option");
                    opt.value = t.talhao;
                    opt.textContent = t.talhao;
                    talhaoSelect.appendChild(opt);
                });

                // selecionar automaticamente o talhão atual
                if (talhaoAtual) talhaoSelect.value = talhaoAtual;

                // destacar talhão atual
                const item = coordinatesData.find(t => t.talhao == talhaoAtual);
                if (item) destacarTalhao(item);
            });
    }

    // ==== EVENTOS EXISTENTES DO SEU EDIT MANTIDOS ==== 
// ==== QUANDO TROCAR O SETOR → ATUALIZAR TUDO (MAPA + SELECT + CAMPOS) ====
setorInput.addEventListener("change", function () {
    const setor = setorInput.value.trim();

    // limpar select de talhão
    talhaoSelect.innerHTML = '<option value="">Selecione um talhão</option>';
    areaInput.value = "";

    if (!setor) {
        talhoesLayerGroup.clearLayers();
        if (destaqueLayer) {
            map.removeLayer(destaqueLayer);
            destaqueLayer = null;
        }
        return;
    }

    // ================================
    // 1) Buscar SHAPE do novo setor
    // ================================
    fetch(`/rotafazenda/shape/${setor}`)
        .then(res => res.json())
        .then(data => {

            const raw = data.coordinatesArray;

            // Agrupar por talhão (igual ao create)
            const agrup = {};
            raw.forEach(p => {
                if (!agrup[p.talhao]) {
                    agrup[p.talhao] = {
                        talhao: p.talhao,
                        area: p.area ?? null,
                        descricaoFazenda: p.descricaoFazenda ?? null,
                        coordinates: []
                    };
                }
                agrup[p.talhao].coordinates.push([p.latitude, p.longitude]);
            });

            coordinatesData = Object.values(agrup);

            // desenhar todos os talhões
            desenharTalhoes(coordinatesData);

            // Preencher SELECT de talhões
            talhaoSelect.innerHTML = '<option value="">Selecione um talhão</option>';
            coordinatesData.forEach(t => {
                const opt = document.createElement("option");
                opt.value = t.talhao;
                opt.textContent = t.talhao;
                talhaoSelect.appendChild(opt);
            });

            // Remover destaque anterior
            if (destaqueLayer) {
                map.removeLayer(destaqueLayer);
                destaqueLayer = null;
            }
        });

    // ================================
    // 2) Buscar DADOS gerais (fazenda, área, corte, variedade)
    // ================================
    fetch(`/rotafazenda/buscar/${setor}/0`)
        .then(res => res.json())
        .then(data => {
            fazendaInput.value = data.fazenda ?? "";

            if (!talhaoSelect.value) {
                areaInput.value = data.area ?? "";
            }

            if (data.corte) corteSelect.value = data.corte;
            if (data.variedade) variedadeSelect.value = data.variedade;
        });
});


    talhaoSelect.addEventListener("change", function () {
        const setor = setorInput.value.trim();
        const talhao = talhaoSelect.value.trim();

        if (!setor || !talhao) return;

        // atualizar área
        fetch(`/rotafazenda/buscar/${setor}/${talhao}`)
            .then(res => res.json())
            .then(data => {
                areaInput.value = data.area ?? "";
            });

        // destacar talhão no mapa
        const item = coordinatesData.find(t => t.talhao == talhao);
        if (item) destacarTalhao(item);
    });

    // ==== botões adicionar corte/variedade (mantidos) ====
    document.getElementById("addCorte").addEventListener("click", function () {
        let novoCorte = prompt("Digite o novo corte:");
        if (novoCorte) {
            novoCorte = novoCorte.toUpperCase();
            const option = document.createElement("option");
            option.value = novoCorte;
            option.textContent = novoCorte;
            option.selected = true;
            corteSelect.appendChild(option);
        }
    });

    document.getElementById("addVariedade").addEventListener("click", function () {
        let novaVariedade = prompt("Digite a nova variedade:");
        if (novaVariedade) {
            novaVariedade = novaVariedade.toUpperCase();
            const option = document.createElement("option");
            option.value = novaVariedade;
            option.textContent = novaVariedade;
            option.selected = true;
            variedadeSelect.appendChild(option);
        }
    });
});
