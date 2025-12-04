// ====== globals ======
let map = null;
let talhoesLayerGroup = L.layerGroup();
let destaqueLayer = null; // camada para destacar talhão selecionado

// ====== init map ======
function initMap() {
    map = L.map("map-cadastro").setView([-21.9269, -46.9247], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    talhoesLayerGroup.addTo(map);
    console.log("Mapa inicializado");
}

// ====== util helper ======
// garante que cada coordinate esteja no formato [lat, lng] e faz correção se necessário
function normalizePoint(lat, lng) {
    // se algum valor for string, tenta parseFloat
    lat = typeof lat === "string" ? parseFloat(lat.replace(",", ".")) : lat;
    lng = typeof lng === "string" ? parseFloat(lng.replace(",", ".")) : lng;

    if (isNaN(lat) || isNaN(lng)) {
        return null;
    }

    // Se latitude estiver fora do intervalo válido, provavelmente os valores estão invertidos (lon, lat)
    // lat válido = -90..90, lng válido = -180..180
    if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
        // troca
        const tmp = lat;
        lat = lng;
        lng = tmp;
    }

    return [lat, lng];
}

// ====== desenhar talhões ======
function desenharTalhoes(lista) {
    talhoesLayerGroup.clearLayers();
    console.log("Desenhando", lista.length, "talhões");

    const allBounds = [];

    lista.forEach((item) => {
        // verifica formato
        if (!Array.isArray(item.coordinates) || item.coordinates.length === 0) {
            console.warn("Talhão sem coordinates:", item.talhao);
            return;
        }

        // normaliza pontos
        const pts = [];
        for (const c of item.coordinates) {
            // aceita [lat,lng] ou {latitude,longitude} ou {lat,lng}
            if (Array.isArray(c) && c.length >= 2) {
                const normalized = normalizePoint(c[0], c[1]);
                if (normalized) pts.push(normalized);
            } else if (c && "latitude" in c && "longitude" in c) {
                const normalized = normalizePoint(c.latitude, c.longitude);
                if (normalized) pts.push(normalized);
            } else if (c && "lat" in c && "lng" in c) {
                const normalized = normalizePoint(c.lat, c.lng);
                if (normalized) pts.push(normalized);
            } else {
                console.warn("Formato de coordenada desconhecido:", c);
            }
        }

        if (pts.length < 3) {
            console.warn(
                "Talhão tem menos de 3 pontos (não formará polígono):",
                item.talhao,
                pts
            );
            return;
        }

        const polygon = L.polygon(pts, {
            color: "orange",
            weight: 2,
            fillColor: "yellow",
            fillOpacity: 0.35,
        }).bindPopup(`
            <b>Talhão:</b> ${item.talhao}<br>
            <b>Área:</b> ${item.area ?? "—"}
        `);

        // ===== NUMERAR TALHÕES =====
        // calcula o centro do polígono
        const center = polygon.getBounds().getCenter();

        // cria um marcador com o número do talhão
        const label = L.marker(center, {
            icon: L.divIcon({
                className: "talhao-label",
                html: `<b>${item.talhao}</b>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
            }),
        });

        // adiciona o número no mapa
        talhoesLayerGroup.addLayer(label);

        talhoesLayerGroup.addLayer(polygon);
        allBounds.push(polygon.getBounds());
    });

    // ajustar zoom se houver bounds
    if (allBounds.length) {
        const totalBounds = allBounds.reduce(
            (acc, b) => acc.extend(b),
            allBounds[0]
        );
        map.fitBounds(totalBounds, { maxZoom: 18, padding: [20, 20] });
        console.log("Mapa ajustado para exibir todos os talhões");
    } else {
        console.warn("Nenhum polígono válido para desenhar.");
    }
}

// ====== destacar talhão ======
function destacarTalhao(item) {
    if (destaqueLayer) {
        map.removeLayer(destaqueLayer);
        destaqueLayer = null;
    }
    if (!item) return;

    // cria um polygon com estilo diferente
    const pts = item.coordinates
        .map((c) => {
            if (Array.isArray(c)) return normalizePoint(c[0], c[1]);
            if (c && "latitude" in c && "longitude" in c)
                return normalizePoint(c.latitude, c.longitude);
            if (c && "lat" in c && "lng" in c)
                return normalizePoint(c.lat, c.lng);
            return null;
        })
        .filter(Boolean);

    if (pts.length < 1) return;

    destaqueLayer = L.polygon(pts, {
        color: "#2196F3", // verde escuro
        weight: 3,
        fillColor: "#64B5F6",
        fillOpacity: 0.4,
    }).addTo(map);

    try {
        map.fitBounds(destaqueLayer.getBounds(), {
            maxZoom: 17,
            padding: [20, 20],
        });
    } catch (e) {
        console.warn("Não foi possível ajustar bounds do destaque:", e);
    }
}

// ====== main ======
document.addEventListener("DOMContentLoaded", function () {
    // valida elementos
    const setorInput = document.querySelector('input[name="setor"]');
    const talhaoSelect = document.getElementById("talhao");
    const fazendaInput = document.querySelector('input[name="fazenda"]');
    const areaInput = document.querySelector('input[name="area"]');

    if (!setorInput) console.error('input[name="setor"] não encontrado no DOM');
    if (!talhaoSelect) console.error("elemento #talhao não encontrado no DOM");
    if (!fazendaInput)
        console.error('input[name="fazenda"] não encontrado no DOM');
    if (!areaInput) console.error('input[name="area"] não encontrado no DOM');

    initMap();

    let coordinatesData = []; // array agrupado por talhão (com coordinates = [[lat,lng],...])

    setorInput.addEventListener("blur", function () {
        const setor = setorInput.value.trim();
        if (!setor) {
            console.log("Setor vazio — nada a fazer.");
            return;
        }

        console.log("Buscando shapefile para setor:", setor);

        fetch(`/rotafazenda/shape/${encodeURIComponent(setor)}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Resposta HTTP não OK: " + res.status);
                }
                return res.json();
            })
            .then((data) => {
                console.log("RETORNO DO BACKEND:", data);

                if (!data || data.erro) {
                    console.warn("Backend retornou erro ou dados vazios");
                    return;
                }

                const raw = data.coordinatesArray;
                if (!Array.isArray(raw) || raw.length === 0) {
                    console.warn("coordinatesArray vazio ou inválido");
                    return;
                }

                // Agrupa por talhao e monta coordinates como array de pontos
                const agrup = {};
                raw.forEach((p, idx) => {
                    // checagens básicas
                    if (!p.talhao) {
                        console.warn(
                            "Registro sem talhao (índice " + idx + "):",
                            p
                        );
                        return;
                    }
                    if (!("latitude" in p) || !("longitude" in p)) {
                        console.warn("Registro sem latitude/longitude:", p);
                        return;
                    }

                    const tal = String(p.talhao);

                    if (!agrup[tal]) {
                        agrup[tal] = {
                            talhao: tal,
                            area: p.area ?? null,
                            descricaoFazenda: p.descricaoFazenda ?? null,
                            coordinates: [],
                        };
                    }

                    agrup[tal].coordinates.push([p.latitude, p.longitude]);
                });

                coordinatesData = Object.values(agrup);
                console.log("TALHÕES AGRUPADOS:", coordinatesData);

                // desenha
                desenharTalhoes(coordinatesData);

                // popula select
                talhaoSelect.innerHTML =
                    '<option value="">Selecione o talhão</option>';
                coordinatesData.forEach((t) => {
                    const opt = document.createElement("option");
                    opt.value = t.talhao;
                    opt.textContent = t.talhao;
                    talhaoSelect.appendChild(opt);
                });

                // preenche fazenda (do primeiro talhão)
                fazendaInput.value = coordinatesData[0]?.descricaoFazenda ?? "";

                areaInput.value = "";
            })
            .catch((err) => {
                console.error("Erro ao buscar shapefile:", err);
            });
    });

    // quando selecionar talhão, preenche area e destaca no mapa
    talhaoSelect.addEventListener("change", function () {
        const escolhido = talhaoSelect.value;
        if (!escolhido) {
            areaInput.value = "";
            destacarTalhao(null);
            return;
        }

        const item = coordinatesData.find(
            (t) => String(t.talhao) === String(escolhido)
        );
        if (!item) {
            console.warn(
                "Talhão selecionado não encontrado nos dados agrupados:",
                escolhido
            );
            areaInput.value = "";
            return;
        }

        let area = item.area ?? "";
        if (area) {
            area = parseFloat(area.toString().replace(",", "."));
            if (!isNaN(area)) {
                area = area.toFixed(2);
            }
        }
        areaInput.value = area;
        destacarTalhao(item);
    });

    // botões de adicionar (mantive os seus handlers)
    const btnCorte = document.getElementById("addCorte");
    if (btnCorte) {
        btnCorte.addEventListener("click", function () {
            let novoCorte = prompt("Digite o novo corte:");
            if (novoCorte) {
                novoCorte = novoCorte.toUpperCase();
                const corteSelect = document.getElementById("corte");
                const option = document.createElement("option");
                option.value = novoCorte;
                option.textContent = novoCorte;
                option.selected = true;
                corteSelect.appendChild(option);
            }
        });
    }

    const btnVar = document.getElementById("addVariedade");
    if (btnVar) {
        btnVar.addEventListener("click", function () {
            let novaVariedade = prompt("Digite a nova variedade:");
            if (novaVariedade) {
                novaVariedade = novaVariedade.toUpperCase();
                const variedadeSelect = document.getElementById("variedade");
                const option = document.createElement("option");
                option.value = novaVariedade;
                option.textContent = novaVariedade;
                option.selected = true;
                variedadeSelect.appendChild(option);
            }
        });
    }
});
