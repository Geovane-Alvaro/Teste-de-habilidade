@extends('layouts.app')

@section('content')
    <h1 class="mb-4">Importar Excel</h1>


    @if ($errors->any())
        <div class="alert alert-danger">
            <ul class="mb-0">
                @foreach ($errors->all() as $erro)
                    <li>{{ $erro }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <a href="{{ route('excel.download') }}" class="btn btn-secondary mb-3">
    Baixar modelo Excel
    </a>


    <form action="{{ route('excel.store') }}" method="POST" enctype="multipart/form-data" id="formExcel">
        @csrf

        <div class="mb-3">
            <label class="form-label">Selecione o arquivo (.xlsx / .xlsm)</label>
            <input type="file" name="arquivo_excel" accept=".xlsx,.xlsm" class="form-control" required>
        </div>

        <button class="btn btn-primary" id="btnEnviar">Enviar</button>
        <a class="btn btn-secondary" href="{{ route('rotafazenda.index') }}">Voltar</a>
    </form>

    <script>
        const form = document.getElementById('formExcel');
        const botao = document.getElementById('btnEnviar');

        form.addEventListener('submit', () => {
            botao.disabled = true;
            botao.innerText = 'Importando...';
        });
    </script>
@endsection
