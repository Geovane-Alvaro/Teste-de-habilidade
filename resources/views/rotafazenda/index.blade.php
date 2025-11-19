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
    <a href="{{ route('kmz.index') }}" name="Botao de envio kmz" class="btn btn-success aling-item-center btn-primary" >
    <i></i> Enviar KMZ</a>

    <a href="{{ route('excel.index') }}" class="btn btn-success aling-item-center btn-primary" >
    <i></i> Enviar excel</a>

    </div>

    <form action="{{ route('rotafazenda.index') }}" method="GET">

    
    <div class="d-flex gap-2 mb-3" name="barraDeBuscaEBotaoFiltro">

        

        <input name="barraDeBusca" type="text" class="form-control input-custom"placeholder="Pesquisar fazenda, setor ou talhão"
            value="{{ request('barraDeBusca') }}"
        >

        <button type="button" name="botaoFiltro" class="btn btn-secondary" id="toggleFilters" title="Filtros avançados">
            <i class="bi bi-funnel-fill"></i>
        </button>

        <button type="submit" name="botaoBuscar" class="btn btn-primary">
            <i class="bi bi-search"></i>
        </button>
    </div>

    <div id="advancedFilters" name="FiltrosAvancados" class="card p-3 mb-3" style="display: none;">
        <div class="row g-3">

            <div class="col-md-3">
                <label class="form-label">Setor</label>
                <input type="text" name="setor" class="form-control input-custom" placeholder="Buscar por setor" value="{{ request('setor') }}">
            </div>

            <div class="col-md-3">
                <label class="form-label">Variedade</label>
                <input type="text" name="variedade" class="form-control input-custom" placeholder="Buscar por variedade" value="{{ request('variedade') }}">
            </div>

            <div class="col-md-3">
                <label class="form-label">Possui insumo?</label>
                <select name="insumo" class="form-control input-custom">
                    <option value="">Todos</option>
                    <option value="1" {{ request('insumo') == "1" ? 'selected' : '' }}>Sim</option>
                    <option value="0" {{ request('insumo') == "0" ? 'selected' : '' }}>Não</option>
                </select>
            </div>

            <div class="col-md-3">
                <label class="form-label">Data Plantio</label>
                <input type="date" name="dataPlantio" class="form-control input-custom" value="{{ request('dataPlantio') }}">
            </div>

        </div>

        <div class="mt-3 d-flex justify-content-end gap-2">

        <a href="{{ route('rotafazenda.index') }}" name="botaoLimparFiltros" class="btn btn-secondary">
            <i class="bi bi-x-circle"></i> Limpar filtros
        </a>

        <button type="submit" name="botaoAplicarFiltros" class="btn btn-primary">
            <i class="bi bi-filter"></i> Aplicar filtros
        </button>

    </div>

    </div>
</form>

    <table class="table table-striped  table-hover align-middle text-uppercase">
        <thead class="table-custom ">
            <tr>
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
                    <td>{{ $f->setor }}</td>
                    <td>{{ $f->fazenda }}</td>
                    <td>{{ str_pad($f->talhao, 3, '0', STR_PAD_LEFT) }}</td>
                    <td>{{ $f->variedade }}</td>
                    <td>{{ $f->corte }}</td>
                    <td>{{ $f->area }}</td>
                    <td>{{ $f->insumo == 1? 'Possui': 'Não possui' }}</td>
                    <td>{{ \Carbon\Carbon::parse($f->dataPlantio)->format('d/m/Y') }}</td>
                    <td>
                        <a href="{{ route('rotafazenda.edit', $f->idFazenda) }}" class="btn btn-warning btn-sm" name="botaoEditar"> <i class="bi bi-pencil"></i></a>

                        <form action="{{ route('rotafazenda.destroy', $f->idFazenda) }}" method="POST" style="display:inline;">
                            @csrf
                            @method('DELETE')
                            <button class="btn btn-danger btn-sm" name="botaoExcluir" onclick="return confirm('Tem certeza que deseja excluir este registro?')"><i 	class=" bi bi-trash	"></i></button>
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
    <div class="mt-3 ">
    {{ $fazendas->links('pagination::bootstrap-5') }}
    </div>

    <script>
    document.getElementById('toggleFilters').addEventListener('click', () => {
        const box = document.getElementById('advancedFilters');
        box.style.display = box.style.display === 'none' ? 'block' : 'none';
    });
</script>
@endsection

