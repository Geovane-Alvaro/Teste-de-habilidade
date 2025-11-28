document.addEventListener("DOMContentLoaded", function () {
    const setorInput = document.querySelector('input[name="setor"]');
    const talhaoSelect = document.querySelector('select[name="talhao"]');
    const fazendaInput = document.querySelector('input[name="fazenda"]');
    const areaInput = document.querySelector('input[name="area"]');
    const corteSelect = document.querySelector("#corte");
    const variedadeSelect = document.querySelector("#variedade");

    // QUANDO ALTERA O SETOR
    setorInput.addEventListener("blur", function () {
        const setor = setorInput.value.trim();
        if (!setor) return;

        fetch(`/rotafazenda/buscar/${setor}/0`)
            .then(res => res.json())
            .then(data => {
                if (!data) return;

                fazendaInput.value = data.fazenda ?? "";
                areaInput.value = data.area ?? "";

                if (data.corte) corteSelect.value = data.corte;
                if (data.variedade) variedadeSelect.value = data.variedade;
            })
            .catch(err => console.error(err));
    });

    // -------------- CORREÇÃO: EVENTO PARA SELECT DE TALHÃO ----------------
    talhaoSelect.addEventListener("change", function () {
        const setor = setorInput.value.trim();
        const talhao = talhaoSelect.value.trim();
        if (!setor || !talhao) return;

        fetch(`/rotafazenda/buscar/${setor}/${talhao}`)
            .then(res => res.json())
            .then(data => {
                if (!data) return;

                areaInput.value = data.area ?? "";
            })
            .catch(err => console.error(err));
    });
});


function iniciarMapaEdicao() {
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
    iniciarMapaEdicao();
});

