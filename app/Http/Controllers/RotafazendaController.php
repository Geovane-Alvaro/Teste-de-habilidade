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

    
    if ($request->filled('barraDeBusca')) {
        $search = mb_strtoupper($request->barraDeBusca);
        $query->where(function($q) use ($search) {
            $q->where('fazenda', 'like', "%{$search}%")
              ->orWhere('setor', 'like', "%{$search}%")
              ->orWhere('talhao', 'like', "%{$search}%");
        });
    }

   
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

    
    $fazendas = $query->paginate(15)->withQueryString();

    $mensagemSucesso = session('mensagem.sucesso');

    return view('rotafazenda.index', compact('fazendas', 'mensagemSucesso'));
}
    
    /**
     * Show the form for creating a new resource.
     */
    public function create()
{
    return view('rotafazenda.create');
}

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
{
    // Validação opcional (mas recomendada)
    $request->validate([
        'setor' => 'required|string',
        'fazenda' => 'required|string',
        'talhao' => 'required|string',
        'variedade' => 'required|string',
        'corte' => 'required|string',
        'area' => 'required|string',
        'insumo' => 'required|in:0,1',
        'dataPlantio' => 'required|date',
    ]);

    // Cria o registro no banco
    Rotafazenda::create([
        'setor'        => mb_strtoupper($request->setor),
        'fazenda'      => mb_strtoupper($request->fazenda),
        'talhao'       => mb_strtoupper($request->talhao),
        'variedade'    => mb_strtoupper($request->variedade),
        'corte'        => mb_strtoupper($request->corte),
        'area'         => mb_strtoupper($request->area),
        'insumo'       => $request->insumo,
        'dataPlantio'  => $request->dataPlantio,
    ]);

    return redirect()
        ->route('rotafazenda.index')
        ->with('mensagem.sucesso', 'Fazenda cadastrada com sucesso!');
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
    public function destroy(Request $request, Rotafazenda $rotafazenda)
    {
         $rotafazenda->delete();
        $paginaAtual = $request->input('page', 1);

        return to_route('rotafazenda.index', ['page' => $paginaAtual])
        ->with('mensagem.sucesso', "Fazenda '{$rotafazenda->fazenda}' deletada com sucesso!");
    }
   
    public function buscarPorSetor($setor)
    {
        $dado = Rotafazenda::where('setor', $setor)->first();

        if (!$dado) {
            return response()->json(null);
        }

        return response()->json([
            'fazenda' => $dado->fazenda
        ]);

    }
    public function buscarPorTalhao($setor, $talhao)
{
    $dado = Rotafazenda::where('setor', $setor)
        ->where('talhao', $talhao)
        ->first();

    if (!$dado) return response()->json(null);

    return response()->json([
        'fazenda'     => $dado->fazenda,
        'variedade'   => $dado->variedade,
        'corte'       => $dado->corte,
        'area'        => $dado->area,
        'insumo'      => $dado->insumo,
        'dataPlantio' => $dado->dataPlantio,
    ]);
    }
}

