@extends('layouts.app')

@section('content')
    <h1 class="mb-4">Editar Fazenda</h1>

    <form action="{{ route('rotafazenda.update', $fazenda->idFazenda) }}" method="POST">
        @csrf
        @method('PUT')

        <div class="row mb-3">
            <div class="col">
                <label class="form-label">Setor</label>
                <input type="text" name="setor" value="{{ $fazenda->setor }}" class="form-control">
            </div>
            <div class="col">
                <label class="form-label">Fazenda</label>
                <input type="text" name="fazenda" value="{{ $fazenda->fazenda }}" class="form-control">
            </div>
        </div>

        <div class="row mb-3">
            <div class="col">
                <label class="form-label">Talhão</label>
                <input type="text" name="talhao" value="{{ $fazenda->talhao }}" class="form-control">
            </div>
            <div class="col">
                <label class="form-label">Variedade</label>
                <input type="text" name="variedade" value="{{ $fazenda->variedade }}" class="form-control">
            </div>
        </div>

        <div class="row mb-3">
            <div class="col">
                <label class="form-label">Corte</label>
                <input type="text" name="corte" value="{{ $fazenda->corte }}" class="form-control">
            </div>
            <div class="col">
                <label class="form-label">Área</label>
                <input type="text" name="area" value="{{ $fazenda->area }}" class="form-control">
            </div>
        </div>

        <div class="mb-3">
            <label class="form-label">Insumo</label>
            <select name="insumo" class="form-select">
            <option value="0" {{ $fazenda->insumo == 0 ? 'selected' : '' }}>Não possui </option>
            <option value="1" {{ $fazenda->insumo == 1 ? 'selected' : '' }}>Possui </option>
            </select>
        </div>

        <div class="mb-3">
            <label class="form-label">Data Plantio</label>
            <input type="date" name="dataPlantio" value="{{ $fazenda->dataPlantio }}" class="form-control">
        </div>

        <button type="submit" class="btn btn-primary" name="botaoSalvar"> Editar</button>
        <a href="{{ route('rotafazenda.index') }}" name="botaoCancelar" class="btn btn-secondary">Cancelar</a>
    </form>
@endsection
