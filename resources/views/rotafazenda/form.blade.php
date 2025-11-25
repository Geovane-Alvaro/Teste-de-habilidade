<div class="row mb-3">
    <div class="col">
        <label class="form-label">Setor</label>
        <input type="text" name="setor" value="{{ old('setor', $fazenda->setor ?? '') }}" class="form-control" >
    </div>

    <div class="col">
        <label class="form-label">Fazenda</label>
        <input type="text" name="fazenda" value="{{ old('fazenda', $fazenda->fazenda ?? '') }}" class="form-control input-readonly" readonly>
    </div>
</div>

<div class="row mb-3">
    <div class="col">
        <label class="form-label">Talhão</label>
        <input type="text" name="talhao" value="{{ old('talhao', $fazenda->talhao ?? '') }}" class="form-control">
    </div>

    <div class="col">
        <label class="form-label">Variedade</label>
        <input type="text" name="variedade" value="{{ old('variedade', $fazenda->variedade ?? '') }}" class="form-control input-readonly" readonly>
    </div>
</div>

<div class="row mb-3">
    <div class="col">
        <label class="form-label">Corte</label>
        <input type="text" name="corte" value="{{ old('corte', $fazenda->corte ?? '') }}" class="form-control input-readonly" readonly>
    </div>

    <div class="col">
        <label class="form-label">Área</label>
        <input type="text" name="area" value="{{ old('area', $fazenda->area ?? '') }}" class="form-control input-readonly" readonly>
    </div>
</div>

<div class="mb-3">
    <label class="form-label">Insumo</label>
    <select name="insumo" class="form-select">
        <option value="0" {{ old('insumo', $fazenda->insumo ?? '') == 0 ? 'selected' : '' }}>Não possui</option>
        <option value="1" {{ old('insumo', $fazenda->insumo ?? '') == 1 ? 'selected' : '' }}>Possui</option>
    </select>
</div>

<div class="mb-3">
    <label class="form-label">Data Plantio</label>
    <input type="date" name="dataPlantio"
           value="{{ old('dataPlantio', $fazenda->dataPlantio ?? '') }}"
           class="form-control">
</div>

<script>
document.querySelector('input[name="setor"]').addEventListener('blur', function() {
    const setor = this.value;

    if (setor.length === 0) return;

    fetch(`/rotafazenda/buscar-setor/${setor}`)
        .then(r => r.json())
        .then(data => {
            if (!data) return;
            document.querySelector('input[name="fazenda"]').value = data.fazenda;
        });
});
document.querySelector('input[name="talhao"]').addEventListener('blur', function() {
    const talhao = this.value;
    const setor = document.querySelector('input[name="setor"]').value;

    if (!setor || !talhao) return;

    fetch(`/rotafazenda/buscar/${setor}/${talhao}`)
        .then(response => response.json())
        .then(data => {
            if (!data) return;

            document.querySelector('input[name="fazenda"]').value = data.fazenda;
            document.querySelector('input[name="variedade"]').value = data.variedade;
            document.querySelector('input[name="corte"]').value = data.corte;
            document.querySelector('input[name="area"]').value = data.area;
            document.querySelector('select[name="insumo"]').value = data.insumo;
            document.querySelector('input[name="dataPlantio"]').value = data.dataPlantio;
        });
});

</script>

