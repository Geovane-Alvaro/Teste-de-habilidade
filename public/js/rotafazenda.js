let map = null;

function initMap() {
    const defaultLat = -21.9269;
    const defaultLng = -46.9247;

    map = L.map("map-cadastro").setView([defaultLat, defaultLng], 15);

    const tileLayerClaro = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "© OpenStreetMap contributors",
        }
    );

    const tileLayerEscuro = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
            attribution: "",
            opacity: 0.5,
        }
    );

    tileLayerClaro.addTo(map);

    const baseMaps = {
        Claro: tileLayerClaro,
        Escuro: tileLayerEscuro,
    };

    L.control.layers(baseMaps).addTo(map);
}

document.addEventListener("DOMContentLoaded", function () {
    const setorInput = document.querySelector('input[name="setor"]');
    const talhaoSelect = document.getElementById("talhao");
    const fazendaInput = document.querySelector('input[name="fazenda"]');
    const areaInput = document.querySelector('input[name="area"]');

    let coordinatesData = []; // armazena os dados do shapefile

    initMap();

    // Quando o usuário digitar o setor
    setorInput.addEventListener("blur", function () {
        const setor = setorInput.value.trim();
        if (!setor) return;

        fetch(`/rotafazenda/shape/${setor}`)
            .then((res) => res.json())
            .then((data) => {
                if (
                    data.erro ||
                    !data.coordinatesArray ||
                    data.coordinatesArray.length === 0
                )
                    return;

                coordinatesData = data.coordinatesArray;

                // Atualiza select de talhões
                const talhoes = [
                    ...new Set(coordinatesData.map((r) => r.talhao)),
                ];
                talhaoSelect.innerHTML =
                    '<option value="">Selecione o talhão</option>';
                talhoes.forEach((t) => {
                    const option = document.createElement("option");
                    option.value = t;
                    option.textContent = t;
                    talhaoSelect.appendChild(option);
                });

                // Preenche fazenda com o primeiro registro do setor
                const primeiroRegistro = coordinatesData[0];
                if (primeiroRegistro) {
                    fazendaInput.value =
                        primeiroRegistro.descricaoFazenda ?? "";
                }

                // Limpa área (será preenchida quando escolher talhão)
                areaInput.value = "";
            })
            .catch((err) =>
                console.error("Erro ao carregar dados do KML:", err)
            );
    });
    // Quando o usuário escolher um talhão
    talhaoSelect.addEventListener("change", function () {
        const talhaoSelecionado = talhaoSelect.value;
        if (!talhaoSelecionado) {
            areaInput.value = "";
            return;
        }

        // Busca no array de coordenadas a área do talhão escolhido
        const registro = coordinatesData.find(
            (r) => r.talhao === talhaoSelecionado
        );
        if (registro) {
            const areaNumber = parseFloat(registro.area.replace(",", "."));
            areaInput.value = areaNumber.toFixed(2);
        } else {
            areaInput.value = "";
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Adicionar novo Corte ao select
    document.getElementById("addCorte").addEventListener("click", function () {
        let novoCorte = prompt("Digite o novo corte:");
        if (novoCorte) {
            novoCorte = novoCorte.toUpperCase(); // força letras maiúsculas
            const corteSelect = document.getElementById("corte");
            const option = document.createElement("option");
            option.value = novoCorte;
            option.textContent = novoCorte;
            option.selected = true; //  deixa a opção nova opção já selecionada
            corteSelect.appendChild(option);
        }
    });

    // Adicionar nova Variedade ao select
    document.getElementById("addVariedade").addEventListener("click", function () {
            let novaVariedade = prompt("Digite a nova variedade:");
            if (novaVariedade) {
                novaVariedade = novaVariedade.toUpperCase(); // força letras maiúsculas
                const variedadeSelect = document.getElementById("variedade");
                const option = document.createElement("option");
                option.value = novaVariedade;
                option.textContent = novaVariedade;
                option.selected = true; //  deixa a opção nova opção já selecionada
                variedadeSelect.appendChild(option);
            }
        });
});

// document.querySelector('input[name="setor"]').addEventListener('blur', function() {
//     const talhao = this.value;
//     const setor = document.querySelector('input[name="setor"]').value;

//     if (!setor || !talhao) return;

//     fetch(`/rotafazenda/shape/${setor}`)
//         .then(response => response.json())
//         .then(data => {
//             if (!data) return;

//             document.querySelector('input[name="fazenda"]').value = data.fazenda;
//             document.querySelector('input[name="variedade"]').value = data.variedade;
//             document.querySelector('input[name="corte"]').value = data.corte;
//             document.querySelector('input[name="area"]').value = data.area;
//             document.querySelector('select[name="insumo"]').value = data.insumo;
//             document.querySelector('input[name="dataPlantio"]').value = data.dataPlantio;

//         });
// });

// document.querySelector('select[name="talhao"]').addEventListener('blur', function () {

//     const setor = document.querySelector('input[name="setor"]').value;
//     const talhao = this.value;

//     if (!setor || !talhao) return;

//     fetch(`/rotafazenda/mapa/${setor}/${talhao}`)
//         .then(res => res.json())
//         .then(data => {
//             // limpa o mapa antes
//             map.eachLayer(layer => {
//                 if (layer instanceof L.Polygon) map.removeLayer(layer);
//             } );

//             desenharTalhoes(data, map);
//         });
//     });
