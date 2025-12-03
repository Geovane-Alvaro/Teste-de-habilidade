@extends('layouts.app')

@section('content')
    <h1 class="mb-4">Editar Fazenda</h1>

    <form action="{{ route('rotafazenda.update', $fazenda->idFazenda) }}" method="POST">
        @csrf
        @method('PUT')

        <div class="row mb-3">
            <div class="col">
                <label class="form-label">Setor</label>
                <input type="text" id="setor" name="setor" value="{{ $fazenda->setor }}" class="form-control">
            </div>

            <div class="col">
                <label class="form-label">Fazenda</label>
                <input type="text" name="fazenda" value="{{ $fazenda->fazenda }}" class="form-control input-readonly"
                    readonly>
            </div>
        </div>

        <div class="row mb-3">
            <div class="col">
                <label class="form-label">Talhão</label>
                <select name="talhao" class="form-select" id="talhao">
                    <option value="">Selecione o talhão</option>

                    @foreach ($talhoes as $t)
                        <option value="{{ $t->talhao }}" {{ $fazenda->talhao == $t->talhao ? 'selected' : '' }}>
                            {{ $t->talhao }}
                        </option>
                    @endforeach
                </select>
            </div>

            <div class="col">
                <label class="form-label">Área</label>
                <input type="text" id="area" name="area" value="{{ $fazenda->area }}"
                    class="form-control input-readonly" readonly>
            </div>
        </div>

        <div class="row mb-3">
            <div class="col">
                <label class="form-label">Corte</label>
                <div class="input-group">
                    <select name="corte" class="form-select" id="corte">
                        @foreach ($cortes as $c)
                            <option value="{{ $c->corte }}" {{ $fazenda->corte == $c->corte ? 'selected' : '' }}>
                                {{ $c->corte }}
                            </option>
                        @endforeach
                    </select>
                    <button type="button" class="btn btn-outline-secondary btn-add" id="addCorte"><a
                            class="bi bi-plus"></a></button>
                </div>
            </div>

            <div class="col">
                <label class="form-label">Variedade</label>
                <div class="input-group">
                    <select name="variedade" class="form-select" id="variedade">
                        @foreach ($variedades as $v)
                            <option value="{{ $v->variedade }}"
                                {{ $fazenda->variedade == $v->variedade ? 'selected' : '' }}>
                                {{ $v->variedade }}
                            </option>
                        @endforeach
                    </select>
                    <button type="button" class="btn btn-outline-secondary btn-add" id="addVariedade"><a
                            class="bi bi-plus"></a></button>
                </div>
            </div>
        </div>

        <div class="mb-3">
            <label class="form-label">Insumo</label>
            <select name="insumo" class="form-select">
                <option value="0" {{ $fazenda->insumo == 0 ? 'selected' : '' }}>Não possui</option>
                <option value="1" {{ $fazenda->insumo == 1 ? 'selected' : '' }}>Possui</option>
            </select>
        </div>

        <div class="mb-3">
            <label class="form-label">Data Plantio</label>
            <input type="date" name="dataPlantio" value="{{ $fazenda->dataPlantio }}" class="form-control">
        </div>

        <div class="mb-4">
            <div id="map-cadastro"></div>
        </div>

        <div class="mb-4">
            <button type="submit" class="btn btn-primary">Salvar alterações</button>
            <a href="{{ route('rotafazenda.index') }}" class="btn btn-secondary">Cancelar</a>
        </div>
    </form>
@endsection

@section('scripts')
    <script src="{{ asset('js/rotafazenda-edit.js') }}"></script>
@endsection
