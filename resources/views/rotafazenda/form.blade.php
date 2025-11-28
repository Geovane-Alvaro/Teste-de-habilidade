<div class="row mb-3">
    <div class="col">
        <label class="form-label">Setor</label>
        <input type="text" name="setor" value="{{ old('setor', $fazenda->setor ?? '') }}" class="form-control">
    </div>

    <div class="col">
        <label class="form-label">Fazenda</label>
        <input type="text" name="fazenda" value="{{ old('fazenda', $fazenda->fazenda ?? '') }}"
            class="form-control input-readonly" readonly>
    </div>
</div>

<div class="row mb-3">
    <div class="col">
        <label class="form-label">Talhão</label>
        <select name="talhao" class="form-select" id="talhao">
            <option value="">Selecione o talhão</option>
        </select>
    </div>

    <div class="col">
        <label class="form-label">Área</label>
        <input type="text" name="area" value="" class="form-control input-readonly" readonly>
    </div>
</div>

<div class="row mb-3">
    <div class="col">
        <label class="form-label">Corte</label>
        <select name="corte" class="form-select" id="corte">
            <option value="">Selecione o corte</option>
            @foreach ($cortes as $c)
                <option value="{{ $c->corte }}"
                    {{ old('corte', $fazenda->corte ?? '') == $c->corte ? 'selected' : '' }}>
                    {{ $c->corte }}
                </option>
            @endforeach
        </select>
    </div>

    <div class="col">
        <label class="form-label">Variedade</label>
        <select id="variedade" name="variedade" class="form-select">
            <option value="">Selecione a variedade</option>

            @foreach ($variedades as $v)
                <option value="{{ $v->variedade }}"
                    {{ old('variedade', $fazenda->variedade ?? '') == $v->variedade ? 'selected' : '' }}>
                    {{ $v->variedade}}
                </option>
            @endforeach
        </select>
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
    <input type="date" name="dataPlantio" value="{{ old('dataPlantio', $fazenda->dataPlantio ?? '') }}"
        class="form-control">
</div>

<div class="mb-4">
    <div id="map-cadastro"></div>
</div>

@section('scripts')
    <script src="{{ asset('js/rotafazenda.js') }}"></script>
@endsection
