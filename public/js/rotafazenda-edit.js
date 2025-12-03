document.addEventListener("DOMContentLoaded", function () {

    // --------------------- PEGAR ELEMENTOS ---------------------
    const setorInput = document.querySelector('input[name="setor"]');
    const talhaoSelect = document.querySelector('select[name="talhao"]');
    const fazendaInput = document.querySelector('input[name="fazenda"]');
    const areaInput = document.querySelector('input[name="area"]');
    const corteSelect = document.querySelector("#corte");
    const variedadeSelect = document.querySelector("#variedade");

    // --------------------- ATUALIZAR LISTA DE TALHÕES ---------------------
    function atualizarListaTalhoes(lista) {
        talhaoSelect.innerHTML = '<option value="">Selecione um talhão</option>';

        lista.forEach(t => {
            talhaoSelect.innerHTML += `
                <option value="${t.talhao}">${t.talhao}</option>
            `;
        });
    }

    // --------------------- QUANDO ALTERA O SETOR ---------------------
    setorInput.addEventListener("change", function () {
        const setor = setorInput.value.trim();

        if (!setor) {
            talhaoSelect.innerHTML = '<option value="">Selecione um talhão</option>';
            return;
        }

        // Buscar TALHÕES do setor
        fetch(`/rotafazenda/setor/${setor}`)
            .then(res => res.json())
            .then(talhoes => {
                atualizarListaTalhoes(talhoes);
                areaInput.value = "";
            })
            .catch(err => console.error("Erro ao atualizar talhões:", err));

        // Buscar DADOS do setor (fazenda, variedade, corte etc)
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

    // --------------------- QUANDO ALTERA O TALHÃO ---------------------
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

    // --------------------- MAPA ---------------------
    iniciarMapaEdicao();
});


// ------------------------- MAPA -------------------------
function iniciarMapaEdicao() {

    const defaultLat = -21.9269;
    const defaultLng = -46.9247;

    map = L.map("map-cadastro").setView([defaultLat, defaultLng], 15);

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
}
document.addEventListener("DOMContentLoaded", function () {
    // Adicionar novo Corte
    document.getElementById("addCorte").addEventListener("click", function () {
        let novoCorte = prompt("Digite o novo corte:");
        if (novoCorte) {
            novoCorte = novoCorte.toUpperCase(); // força maiúsculas
            const corteSelect = document.getElementById("corte");
            const option = document.createElement("option");
            option.value = novoCorte;
            option.textContent = novoCorte;
            option.selected = true; // já seleciona a nova opção
            corteSelect.appendChild(option);
        }
    });

    // Adicionar nova Variedade
    document.getElementById("addVariedade").addEventListener("click", function () {
        let novaVariedade = prompt("Digite a nova variedade:");
        if (novaVariedade) {
            novaVariedade = novaVariedade.toUpperCase(); // força maiúsculas
            const variedadeSelect = document.getElementById("variedade");
            const option = document.createElement("option");
            option.value = novaVariedade;
            option.textContent = novaVariedade;
            option.selected = true; // já seleciona a nova opção
            variedadeSelect.appendChild(option);
        }
    });
});
