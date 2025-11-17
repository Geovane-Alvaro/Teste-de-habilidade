@extends('layouts.app')

@section('content')
    <h1 class="mb-4">Lista de Fazendas</h1>

    {{-- Mensagem de sucesso --}}
    @if($mensagemSucesso)
        <div class="alert alert-success">
            {{ $mensagemSucesso }}
        </div>
    @endif

    <div class="text-end mb-2">
    <a href="{{ route('kmz.index') }}" class="btn btn-success aling-item-">
    <i class="bi bi-upload"></i> Enviar arquivo KMZ</a>

    <a href="{{ route('excel.index') }}" class="btn btn-success aling-item-">
    <i class="bi bi-upload"></i> Enviar arquivo excel</a>

    </div>


    <table class="table table-striped table-hover align-middle">
        <thead class="table-dark">
            <tr>
                <th>ID</th>
                <th>Setor</th>
                <th>Fazenda</th>
                <th>Talhão</th>
                <th>Variedade</th>
                <th>Corte</th>
                <th>Área</th>
                <th>Insumo</th>
                <th>Data Plantio</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($fazendas as $f)
                <tr>
                    <td>{{ $f->idFazenda }}</td>
                    <td>{{ $f->setor }}</td>
                    <td>{{ $f->fazenda }}</td>
                    <td>{{ $f->talhao }}</td>
                    <td>{{ $f->variedade }}</td>
                    <td>{{ $f->corte }}</td>
                    <td>{{ $f->area }}</td>
                    <td>{{ $f->insumo == 1? 'Possui': 'Não possui' }}</td>
                    <td>{{ $f->dataPlantio }}</td>
                    <td>
                        <a href="{{ route('rotafazenda.edit', $f->idFazenda) }}" class="btn btn-warning btn-sm">Editar</a>

                        <form action="{{ route('rotafazenda.destroy', $f->idFazenda) }}" method="POST" style="display:inline;">
                            @csrf
                            @method('DELETE')
                            <button class="btn btn-danger btn-sm" onclick="return confirm('Tem certeza que deseja excluir este registro?')">Excluir</button>
                        </form>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="text-center text-muted">Nenhuma fazenda cadastrada.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
@endsection
