let map = null;

function initMap() {
    const defaultLat = -21.9269;
    const defaultLng = -46.9247;

    map = L.map("map-cadastro").setView([defaultLat, defaultLng], 15);

    const tileLayerClaro = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
            attribution: "© OpenStreetMap contributors",
        }
    );

    const tileLayerEscuro = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{
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
    initMap();
});

document.querySelector('input[name="setor"]').addEventListener("blur", function () {

        const setor = this.value;

        if (!setor) return;

        fetch(`/rotafazenda/shape/${setor}`)
            .then((response) => response.json())
            .then((data) => {
                if (
                    data.erro ||
                    !data.fazendaArray ||
                    data.fazendaArray.length === 0
                ) {
                    return;
                }

                //criar lista de talhoes
                let talhoes = data.talhoes;

                if (!talhoes) {
                    console.warn("Nenhum talhão encontrado");
                    return;
                }

                // transforma objeto em array
                talhoes = Object.values(talhoes);

                // cria select
                const talhaoSelect = document.getElementById("talhao");
                talhaoSelect.innerHTML =
                    '<option value="">Selecione o talhão</option>';

                talhoes.forEach((talhao) => {
                    const option = document.createElement("option");
                    option.value = talhao;
                    option.textContent = talhao;
                    talhaoSelect.appendChild(option);
                });
                // pega o primeiro registro do banco:
                const fazenda = data.fazendaArray[0][0];

                if (!fazenda) {
                    console.warn("Formato inesperado em fazendaArray");
                    return;
                }

                document.querySelector('input[name="fazenda"]').value =
                    fazenda.fazenda ?? "";
                document.querySelector('input[name="variedade"]').value =
                    fazenda.variedade ?? "";
                document.querySelector('input[name="corte"]').value =
                    fazenda.corte ?? "";
                document.querySelector('input[name="area"]').value =
                    fazenda.area ?? "";
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

// document.querySelector('input[name="talhao"]').addEventListener('blur', function () {

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
document.addEventListener("DOMContentLoaded", function () {

    fetch("/rotafazenda/opcoes")
        .then(response => response.json())
        .then(data => {

            // VARIEDADES
            const selVar = document.getElementById("variedade");
            selVar.innerHTML = '<option value="">Selecione</option>';
            data.variedades.forEach(v => {
                selVar.innerHTML += `<option value="${v}">${v}</option>`;
            });

            // CORTES
            const selCorte = document.getElementById("corte");
            selCorte.innerHTML = '<option value="">Selecione</option>';
            data.cortes.forEach(c => {
                selCorte.innerHTML += `<option value="${c}">${c}</option>`;
            });

        });
});
