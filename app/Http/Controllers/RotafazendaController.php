<?php

namespace App\Http\Controllers;

use App\Models\Rotafazenda;
use Illuminate\Http\Request;

class RotafazendaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
{
    $query = Rotafazenda::query();

    // 🔎 Busca geral
    if ($request->filled('barraDeBusca')) {
        $search = mb_strtoupper($request->barraDeBusca);
        $query->where(function($q) use ($search) {
            $q->where('fazenda', 'like', "%{$search}%")
              ->orWhere('setor', 'like', "%{$search}%")
              ->orWhere('talhao', 'like', "%{$search}%");
        });
    }

    // 🧩 Filtros avançados
    if ($request->filled('setor')) {
        $query->where('setor', 'like', "%{$request->setor}%");
    }

    if ($request->filled('variedade')) {
        $query->where('variedade', 'like', "%{$request->variedade}%");
    }

    if ($request->filled('insumo')) {
        $query->where('insumo', $request->insumo);
    }

    if ($request->filled('dataPlantio')) {
        $query->whereDate('dataPlantio', $request->dataPlantio);
    }

    // 🔁 Paginação preservando filtros
    $fazendas = $query->paginate(15)->withQueryString();

    $mensagemSucesso = session('mensagem.sucesso');

    return view('rotafazenda.index', compact('fazendas', 'mensagemSucesso'));
}
    
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Rotafazenda $rotafazenda)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Rotafazenda $rotafazenda)
    {
        return view('rotafazenda.edit')->with('fazenda', $rotafazenda);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Rotafazenda $rotafazenda)
    {
        $dados = $request->all();

        $rotafazenda->update($dados);

        return to_route('rotafazenda.index')
        ->with('mensagem.sucesso', "Fazenda '{$rotafazenda->fazenda}' atualizada com sucesso!");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Rotafazenda $rotafazenda)
    {
         $rotafazenda->delete();

        return to_route('rotafazenda.index')->with('mensagem.sucesso', "Fazenda '{$rotafazenda->fazenda}' deletada com sucesso!");
    }
}
