// variaveis globais
let map = null; // instância principal do Leaflet
let talhoesLayerGroup = L.layerGroup(); // grupo onde ficam todos os polígonos e labels
let destaqueLayer = null; // camada usada para destacar apenas 1 talhão

// funcao de iniciar o mapa
function initMap() {
    map = L.map("map-cadastro").setView([-21.9269, -46.9247], 15); // cria o mapa e centraliza

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

    talhoesLayerGroup.addTo(map); // adiciona o grupo de camadas ao mapa
}

//  funcao para normalizar as coordenadas
// Garante que cada coordenada fique no formato correto [lat, lng]
function normalizePoint(lat, lng) {
    lat = typeof lat === "string" ? parseFloat(lat.replace(",", ".")) : lat; // converte string → número
    lng = typeof lng === "string" ? parseFloat(lng.replace(",", ".")) : lng;

    if (isNaN(lat) || isNaN(lng)) return null; // se valores inválidos, descarta

    // Se a latitude estiver fora do intervalo, provavelmente está invertida com a longitude
    if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
        const tmp = lat;
        lat = lng;
        lng = tmp;
    }
    return [lat, lng];
}

// funcao para desenhar todos os talhoes
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

// funcao para destacar o talhao que foi selecionado
function destacarTalhao(item) {
    if (destaqueLayer) {
        // remove destaque anterior
        map.removeLayer(destaqueLayer);
        destaqueLayer = null;
    }

    if (!item) return; // se nada selecionado, sai

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
        fillColor: "#64B5F6", // cor interna
        fillOpacity: 0.4, //transparencia
    }).addTo(map);

    // ajusta zoom para caber o talhão selecionado
    map.fitBounds(destaqueLayer.getBounds(), {
        maxZoom: 15,
        padding: [20, 20],
    });
}

// funcao main do create ao carregar a pagina
document.addEventListener("DOMContentLoaded", function () {
    const setorInput = document.querySelector('input[name="setor"]'); // campo do setor
    const talhaoSelect = document.getElementById("talhao"); // select de talhão
    const fazendaInput = document.querySelector('input[name="fazenda"]'); // campo de fazenda
    const areaInput = document.querySelector('input[name="area"]'); // campo da área

    initMap(); // inicia o mapa

    let coordinatesData = []; // lista final com talhões agrupados

    //  quando digitar o setor pega a rota e busca a função no controller shapedile 
    setorInput.addEventListener("blur", function () {
        const setor = setorInput.value.trim(); // pega o setor digitado
        if (!setor) return; // se vazio, não faz nada

        fetch(`/rotafazenda/shape/${encodeURIComponent(setor)}`) // busca dados no backend
            .then((res) => res.json()) // converte resposta em JSON
            .then((data) => {
                if (!data || data.erro) return; // ignora erro

                const raw = data.coordinatesArray; // lista original do backend
                if (!Array.isArray(raw) || raw.length === 0) return;

                const agrup = {}; // objeto para agrupar por talhão

                raw.forEach((p) => {
                    if (!p.talhao) return; // ignora sem talhão
                    if (!("latitude" in p) || !("longitude" in p)) return; // ignora sem coords

                    const tal = String(p.talhao); // usa talhão como chave

                    if (!agrup[tal]) {
                        agrup[tal] = {
                            talhao: tal,
                            area: p.area ?? null,
                            descricaoFazenda: p.descricaoFazenda ?? null,
                            coordinates: [],
                        };
                    }

                    agrup[tal].coordinates.push([p.latitude, p.longitude]); // adiciona ponto
                });

                coordinatesData = Object.values(agrup); // transforma agrupado em array

                desenharTalhoes(coordinatesData); // desenha no mapa

                talhaoSelect.innerHTML =
                    '<option value="">Selecione o talhão</option>'; // zera o select

                coordinatesData.forEach((t) => {
                    // adiciona talhões no select
                    const opt = document.createElement("option");
                    opt.value = t.talhao;
                    opt.textContent = t.talhao;
                    talhaoSelect.appendChild(opt);
                });

                fazendaInput.value = coordinatesData[0]?.descricaoFazenda ?? ""; // preenche fazenda
                areaInput.value = ""; // limpa área
            });
    });

    // quando selecionar um talhoa
    talhaoSelect.addEventListener("change", function () {
        const escolhido = talhaoSelect.value; // talhão escolhido

        if (!escolhido) {
            // se nada selecionado
            areaInput.value = "";
            destacarTalhao(null);
            return;
        }

        const item = coordinatesData.find(
            (t) => String(t.talhao) === String(escolhido)
        ); // busca talhão nos dados
        if (!item) return;

        let area = item.area ?? ""; // pega área salva

        if (area) {
            area = parseFloat(area.toString().replace(",", ".")); // converte
            if (!isNaN(area)) area = area.toFixed(2); // formata
        }

        areaInput.value = area; // preenche área
        destacarTalhao(item); // destaca o talhão no mapa
    });

    // botao para adicionar corte
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
// botao para adicionar variedades
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
