@extends('layouts.app')

@section('content')
<h1 class="mb-4">Editar Fazenda</h1>

<form action="{{ route('rotafazenda.update', $fazenda->idFazenda) }}" method="POST">
    @csrf
    @method('PUT')

    @include('rotafazenda.form')

    <button type="submit" class="btn btn-primary">Salvar alterações</button>
    <a href="{{ route('rotafazenda.index') }}" class="btn btn-secondary">Cancelar</a>
</form>
@endsection
