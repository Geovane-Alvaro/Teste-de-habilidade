// Variaveis globais
let map = null;
let talhoesLayerGroup = L.layerGroup();
let destaqueLayer = null;
let coordinatesData = []; // dados agrupados por talhão
let labelsMap = {}; // armazena as labels por talhão

// funcao para iniciar o mapa
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
        Escuro: tileLayerEscuro,
    };

    L.control.layers(baseMaps).addTo(map);

    talhoesLayerGroup.addTo(map);
}

// funcao para normalizar as coordenadas
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

// Desenhar todos os talhoes no mapa
function desenharTalhoes(lista) {
    talhoesLayerGroup.clearLayers(); // limpa polígonos antigos

    const allBounds = []; // armazena limites de cada polígono

    lista.forEach((item) => {
        if (!Array.isArray(item.coordinates) || item.coordinates.length === 0)
            return; // ignora sem coords

        const pts = []; // lista final de pontos normalizados

        // normaliza cada ponto recebido
        for (const c of item.coordinates) {
            let normalized = null;

            if (Array.isArray(c) && c.length >= 2) {
                normalized = normalizePoint(c[0], c[1]);
            } else if (c && "latitude" in c && "longitude" in c) {
                normalized = normalizePoint(c.latitude, c.longitude);
            }
            if (normalized) pts.push(normalized);
        }

        if (pts.length < 3) return; // precisa de pelo menos 3 pontos para formar um polígono

        // cria o polígono do talhão
        const polygon = L.polygon(pts, {
            color: "orange", // cor da borda
            weight: 2, // espessura
            fillColor: "yellow", // cor interna
            fillOpacity: 0.35, // transparência
        }).bindPopup(`
            <b>Talhão:</b> ${item.talhao}<br>
            <b>Área:</b> ${item.area ?? "—"}
        `);

        // 👉 ADICIONE ISTO AQUI
        polygon.on("click", () => {
            const talhaoSelect = document.querySelector("#talhao");

            // altera o select para o talhão clicado
            talhaoSelect.value = item.talhao;

            // destaca o talhão no mapa
            destacarTalhao(item);

            // opcional: preencher área
            const areaInput = document.querySelector('input[name="area"]');

            if (item.area != null && item.area !== "") {
                // transforma vírgula em ponto → converte para número → 2 casas decimais
                const areaFormatada = Number(
                    String(item.area).replace(",", ".")
                ).toFixed(2);

                areaInput.value = areaFormatada;
            } else {
                areaInput.value = "";
            }
        });
        // obtém o centro do polígono para colocar a label
        const center = polygon.getBounds().getCenter();

        // cria a label numerada do talhão
        const label = L.marker(center, {
            icon: L.divIcon({
                className: "talhao-label", // classe CSS personalizada
                html: `<b>${item.talhao}</b>`, // número exibido
                iconSize: [30, 30],
                iconAnchor: [15, 15],
            }),
        });

        labelsMap[item.talhao] = label; // salva label para uso posterior
        // adiciona label e polígono ao grupo de camadas
        talhoesLayerGroup.addLayer(label);
        talhoesLayerGroup.addLayer(polygon);

        allBounds.push(polygon.getBounds()); // guarda limites para ajustar zoom
    });

    // ajusta zoom para mostrar todos
    if (allBounds.length) {
        const totalBounds = allBounds.reduce(
            (acc, b) => acc.extend(b),
            allBounds[0]
        );
        map.fitBounds(totalBounds, { maxZoom: 18, padding: [20, 20] });
    }
}

function limparDestaques() {
    // remover polígono destacado
    if (destaqueLayer) {
        map.removeLayer(destaqueLayer);
        destaqueLayer = null;
    }

    // resetar todas as labels para cor normal
    Object.values(labelsMap).forEach((lbl) => {
        const icon = lbl.getIcon();
        icon.options.className = "talhao-label"; // estilo padrão
        lbl.setIcon(icon);
    });
}

//  Funçao para destar os talhoes
function destacarTalhao(item) {
    //chama função para limpar o destaque do talhao antigo
    limparDestaques();

    // 🔵 APLICAR COR ESPECIAL À LABEL DO TALHÃO SELECIONADO
    const lbl = labelsMap[item.talhao];
    if (lbl) {
        const icon = lbl.getIcon();
        icon.options.className = "talhao-label destaque-label";
        lbl.setIcon(icon);
    }

    // normaliza pontos do talhão selecionado
    const pts = item.coordinates
        .map((c) => {
            if (Array.isArray(c)) return normalizePoint(c[0], c[1]);
            if (c && "latitude" in c && "longitude" in c)
                return normalizePoint(c.latitude, c.longitude);
            return null;
        })
        .filter(Boolean); // remove nulls

    if (pts.length < 1) return;

    // cria polígono destacado
    destaqueLayer = L.polygon(pts, {
        color: "#2196F3", // cor azul da borda
        weight: 3, // espessura
        fillColor: "#96cbf7ff", // cor interna
        fillOpacity: 1.0, //transparencia
    }).addTo(map);

    // ajusta zoom para caber o talhão selecionado
    setTimeout(() => {
        map.fitBounds(destaqueLayer.getBounds(), {
            maxZoom: 15,
            padding: [20, 20],
        });
    }, 50);
}

// main do edit ao carregar a pagina
document.addEventListener("DOMContentLoaded", async function () {
    const setorInput = document.querySelector("#setor");
    const talhaoSelect = document.querySelector("#talhao");
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
            .then((res) => res.json())
            .then((data) => {
                const raw = data.coordinatesArray;
                const agrup = {};
                raw.forEach((p) => {
                    if (!agrup[p.talhao]) {
                        agrup[p.talhao] = {
                            talhao: p.talhao,
                            area: p.area ?? null,
                            descricaoFazenda: p.descricaoFazenda ?? null,
                            coordinates: [],
                        };
                    }

                    agrup[p.talhao].coordinates.push([p.latitude, p.longitude]);
                });

                coordinatesData = Object.values(agrup);

                // desenhar todos
                desenharTalhoes(coordinatesData);

                // recriar select talhão
                talhaoSelect.innerHTML =
                    '<option value="">Selecione um talhão</option>';
                coordinatesData.forEach((t) => {
                    const opt = document.createElement("option");
                    opt.value = t.talhao;
                    opt.textContent = t.talhao;
                    talhaoSelect.appendChild(opt);
                });

                // selecionar automaticamente o talhão atual
                if (talhaoAtual) talhaoSelect.value = talhaoAtual;

                // destacar talhão atual
                const item = coordinatesData.find(
                    (t) => t.talhao == talhaoAtual
                );
                if (item) destacarTalhao(item);
            });
    }

    // Quando trocar de setor atualiza o mapa, talhao e os campos
    setorInput.addEventListener("change", function () {
        const setor = setorInput.value.trim();

        // limpar select de talhão
        talhaoSelect.innerHTML =
            '<option value="">Selecione um talhão</option>';
        areaInput.value = "";

        if (!setor) {
            talhoesLayerGroup.clearLayers();
            if (destaqueLayer) {
                map.removeLayer(destaqueLayer);
                destaqueLayer = null;
            }
            return;
        }

        // Buscar SHAPE do novo setor
        fetch(`/rotafazenda/shape/${setor}`)
            .then((res) => res.json())
            .then((data) => {
                const raw = data.coordinatesArray;

                // Agrupar por talhão (igual ao create)
                const agrup = {};
                raw.forEach((p) => {
                    if (!agrup[p.talhao]) {
                        agrup[p.talhao] = {
                            talhao: p.talhao,
                            area: p.area ?? null,
                            descricaoFazenda: p.descricaoFazenda ?? null,
                            coordinates: [],
                        };
                    }
                    agrup[p.talhao].coordinates.push([p.latitude, p.longitude]);
                });

                coordinatesData = Object.values(agrup);

                // desenhar todos os talhões
                desenharTalhoes(coordinatesData);

                // Preencher SELECT de talhões
                talhaoSelect.innerHTML =
                    '<option value="">Selecione um talhão</option>';
                coordinatesData.forEach((t) => {
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

        // Buscar dados gerais (fazenda, área, corte, variedade)
        fetch(`/rotafazenda/buscar/${setor}/0`)
            .then((res) => res.json())
            .then((data) => {
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

        // atualizar a área do talhao
        fetch(`/rotafazenda/buscar/${setor}/${talhao}`)
            .then((res) => res.json())
            .then((data) => {
                areaInput.value = data.area ?? "";
            });

        // destacar talhao no mapa
        const item = coordinatesData.find((t) => t.talhao == talhao);
        if (item) destacarTalhao(item);
    });

    // botoes adicionar corte
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
    //botoes adicionar variedade
    document
        .getElementById("addVariedade")
        .addEventListener("click", function () {
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
