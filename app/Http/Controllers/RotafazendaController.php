<?php

namespace App\Http\Controllers;

use App\Models\Rotafazenda;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            $query->where(function ($q) use ($search) {
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

   public function update(Request $request, $id)
{
    $fazenda = Rotafazenda::findOrFail($id);

    $fazenda->setor = $request->setor;
    $fazenda->fazenda = $request->fazenda;
    $fazenda->talhao = $request->talhao;
    $fazenda->area = $request->area;
    $fazenda->corte = $request->corte;
    $fazenda->variedade = $request->variedade;
    $fazenda->insumo = $request->insumo;
    $fazenda->dataPlantio = $request->dataPlantio;

    $fazenda->save();

    return redirect()
        ->route('rotafazenda.index')
        ->with('mensagem.sucesso', 'Fazenda atualizada com sucesso!');
    
}


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $cortes = Rotafazenda::select('corte')
            ->distinct()
            ->orderBy('corte')
            ->get();

        $variedades = Rotafazenda::select('variedade')
            ->distinct()
            ->orderBy('variedade')
            ->get();

        return view('rotafazenda.create', compact('cortes', 'variedades'));
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
   public function edit($id)
{
    $fazenda = Rotafazenda::findOrFail($id);

    // listas completas para os selects
    $cortes = Rotafazenda::select('corte')->distinct()->orderBy('corte')->get();
    $variedades = Rotafazenda::select('variedade')->distinct()->orderBy('variedade')->get();

    // talhões do setor (para preencher o select)
    $talhoes = Rotafazenda::where('setor', $fazenda->setor)
        ->select('talhao')
        ->distinct()
        ->orderBy('talhao')
        ->get();

    return view('rotafazenda.edit', compact(
        'fazenda',
        'cortes',
        'variedades',
        'talhoes'
    ));
}

    // public function buscarPorSetor($setor)
    // {
    //     $dado = Rotafazenda::where('setor', $setor)->first();
    //     if (!$dado) { // return response()->json(null); 
    //     }
    //     return response()->json([
    //         'fazenda' => $dado->fazenda
    //     ]);
    // }

    public function buscarPorTalhao($setor, $talhao)
{
    $query = Rotafazenda::where('setor', $setor);

    if ($talhao !== "0" && $talhao !== "null" && $talhao !== "") {
        $query->where('talhao', $talhao);
    }

    $dado = $query->first();
    if (!$dado) return response()->json(null);

    return response()->json([
        'fazenda' => $dado->fazenda,
        'variedade' => $dado->variedade,
        'corte' => $dado->corte,
        'area' => $dado->area,
        'insumo' => $dado->insumo,
        'dataPlantio' => $dado->dataPlantio,
    ]);
}
    public function mapa($setor, $talhao)
    {
        $path = public_path('storage/uploads/doc.kml');

        $xml = simplexml_load_file($path);

        $lista = [];

        foreach ($xml->Document->Placemark as $p) {

            // Lê dados do SimpleData
            $props = [];
            foreach ($p->ExtendedData->SchemaData->SimpleData as $sd) {
                $props[(string)$sd['name']] = trim((string)$sd);
            }

            // Verifica se o setor bate
            if (!isset($props['SETOR']) || $props['SETOR'] != $setor) {
                continue;
            }

            // Lê o polígono
            $coordsString = trim((string)$p
                ->Polygon
                ->outerBoundaryIs
                ->LinearRing
                ->coordinates);

            $pares = preg_split('/\s+/', $coordsString);
            $coords = [];

            foreach ($pares as $par) {
                if (!$par) continue;

                [$lng, $lat] = explode(",", $par);
                $coords[] = [
                    'lat' => (float)$lat,
                    'lng' => (float)$lng
                ];
            }

            $lista[] = [
                'talhao' => $props['TALHAO'] ?? null,
                'coords' => $coords
            ];
        }

        return response()->json([
            'selecionado' => $talhao,
            'talhoes' => $lista
        ]);
    }

    function shapefile($setor)
    {
        //$setor = $request->setor;
        $fazendaArray = [];
        $coordinatesArray = [];
        $cont = 1;
        $talhao = '';

        $filePath = public_path('uploads/doc.kml');

        // Verifica se o arquivo existe
        if (!file_exists($filePath)) {
            return response()->json([
                'erro' => true,
                'mensagem' => 'Arquivo não encontrado',
                'caminho' => $filePath
            ]);
        }

        // Leia o conteúdo do arquivo
        $content = file_get_contents($filePath);

        // Certifique-se de que o conteúdo está em UTF-8
        $content = mb_convert_encoding($content, 'UTF-8', 'auto');

        $pattern = '/<td>FAZENDA<\/td>\s*<td>' . $setor . '<\/td>(.*?)<\/Placemark>/s';
        Log::info("Padrão Regex: " . $pattern);
        while (preg_match($pattern, $content, $matches)) {
            $intervalContent = $matches[1]; // Conteúdo dentro do intervalo

            // Define o padrão para capturar os valores das tags <td>
            $tdPattern = '/<td>(.*?)<\/td>/s';

            // Busca todos os valores das tags <td>
            preg_match_all($tdPattern, $intervalContent, $tdMatches);

            // Transforma o array plano em um array associativo (chave-valor)
            $tdArray = $tdMatches[1];
            $structuredData = [];

            for ($i = 0; $i < count($tdArray); $i += 2) {

                if (isset($tdArray[$i + 1])) {
                    $structuredData[$tdArray[$i]] = $tdArray[$i + 1];
                }
            }
            Log::info($structuredData);
            // Log::info(isset($structuredData['NOME'], $structuredData['TALHAO'], $structuredData['AREA']));
            // Log::info($structuredData['NOME'], $structuredData['TALHAO'], $structuredData['AREA']);
            if (isset($structuredData['NOME'], $structuredData['TALHAO'], $structuredData['AREA'])) {
                $parts = explode("-", $structuredData['NOME']);
                $descricaoFazenda = trim($parts[1]);
                $talhao = $structuredData['TALHAO'];
                $area = $structuredData['AREA'];
                Log::info("Processando Fazenda: " . $structuredData['NOME'] . ", Talhão: " . $talhao . ", Área: " . $area);
                // Verifica se essa combinação já existe
                $key = $structuredData['NOME'] . $structuredData['TALHAO'] . $structuredData['AREA'];
                if (!isset($uniqueFazendas[$key])) {
                    $uniqueFazendas[$key] = true; // Marca como existente

                    $fazendaArray[] = DB::select('SELECT * FROM rotaFazenda WHERE setor = ? AND talhao IN (' . $talhao . ')', [$setor]);
                    // Log::info("Adicionando Fazenda ao Array: " . print_r($fazendaArray, true));
                }

                // Processa as coordenadas para este intervalo
                $patternCoordenadas = '/<coordinates>(.*?)<\/coordinates>/s';
                preg_match_all($patternCoordenadas, $intervalContent, $coordMatches);

                if (!empty($coordMatches[1])) {
                    foreach ($coordMatches[1] as $coordMatch) {
                        // Remove espaços em excesso e divide os pares de coordenadas
                        $coordinatesPairs = explode(' ', trim($coordMatch));

                        foreach ($coordinatesPairs as $pair) {
                            // Divide longitude, latitude e altitude
                            $coordParts = explode(',', $pair);

                            if (count($coordParts) >= 2) {
                                $longitude = $coordParts[0];
                                $latitude = $coordParts[1];
                                $altitude = isset($coordParts[2]) ? $coordParts[2] : 0;

                                $coordinatesArray[] = [
                                    'codigoFazenda' => $setor,
                                    'talhao' => $talhao,
                                    'descricaoFazenda' => $descricaoFazenda,
                                    'area' => $area,
                                    'latitude' => (float)$latitude,
                                    'longitude' => (float)$longitude,
                                    'altitude' => (float)$altitude,
                                ];
                            }
                        }
                    }
                }
            }

            // Remove a ocorrência processada para continuar com a próxima
            $content = str_replace($matches[0], '', $content);
        }


        if (empty($coordinatesArray)) {
            return response()->json(['erro' => true, 'mensagem' => 'Nenhum dado encontrado para o setor.']);
        }
        $listaTalhoes = array_unique(array_column($coordinatesArray, 'talhao'));

        return response()->json([
            'erro' => false,
            'talhoes' => $listaTalhoes,
            'fazendaArray' => $fazendaArray,
            'coordinatesArray' => $coordinatesArray,
        ]);
    }
}
