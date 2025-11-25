@extends('layouts.app')

@section('content')
<h1 class="mb-4">Cadastrar Fazenda</h1>

<form action="{{ route('rotafazenda.store') }}" method="POST">
    @csrf

    @include('rotafazenda.form')

    <button type="submit" class="btn btn-primary">Cadastrar</button>
    <a href="{{ route('rotafazenda.index') }}" class="btn btn-secondary">Cancelar</a>
</form>

@endsection
