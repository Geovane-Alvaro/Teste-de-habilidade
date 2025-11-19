@extends('layouts.app')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="card shadow-sm">
            <div class="card-header bg-success text-white navbar-custom-header">
                <h5 class="mb-0">Upload de Arquivo KMZ</h5>
            </div>

            <div class="card-body">

                {{-- Mensagem de sucesso --}}
                @if ($mensagemSucesso)
                    <div class="alert alert-success">
                        {{ $mensagemSucesso }}
                    </div>
                @endif

                {{-- Erros de validação --}}
                @if ($errors->any())
                    <div class="alert alert-danger">
                        <ul class="mb-0">
                            @foreach ($errors->all() as $erro)
                                <li>{{ $erro }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                {{-- Formulário de upload --}}
                <form action="{{ route('kmz.store') }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    <div class="mb-3">
                        <label for="arquivo_kmz" class="form-label">Selecione o arquivo KMZ:</label>
                        <input type="file" name="arquivo_kmz" id="arquivo_kmz" class="form-control" accept=".kmz" required>
                    </div>

                    <button type="submit" class="btn btn-success btn-primary">
                        <i class="bi bi-upload"></i> Enviar Arquivo
                    </button>
                </form>

                {{-- Se já houver um arquivo salvo, mostra opção pra baixar --}}
                @if (Storage::disk('public')->exists('uploads/arquivo.kmz'))
                    <hr>
                    <p>Um arquivo KMZ já foi enviado anteriormente.</p>
                    <a href="{{ asset('storage/uploads/arquivo.kmz') }}" class="btn btn-secondary" download>
                        <i class="bi bi-download"></i> Baixar KMZ Atual
                    </a>
                @endif

            </div>
        </div>
    </div>
</div>
@endsection
