
export class ArquivoXML {
    // Classe que cria um ARRAY que representa uma Nota Fiscal Eletronica com objetos que representa seções.
    constructor(input) {

        this.input = input;
        this.iniciar();
        this.nfe = [];

    }

    iniciar() {

        // Insere LESTENER no input para capturar os arquivos enviados.
        this.input.addEventListener('change', this.leitor.bind(this));

    }

    leitor() {

        const arquivos = this.input.files; // Adiciona os arquivos do input em uma variavel.
        return this.buscaArquivos(arquivos) // Function que analisa os arquivos enviados em lote.
            .then(nfe => {
                this.nfe = nfe; // Adciona o resultado em uma variavel que pode capturar com "getNFE".
                console.log(this.nfe); // Loga o resultado na tela.
            })
            .catch();

    }

    buscaArquivos(arquivos) {

        // Cria uma promise para o evento de "load" para retornar o valor.
        return new Promise((resolve, reject) => {

            const resultados = [];

            for (let i = 0; i < arquivos.length; i++) { // Corre por todos os arquivos enviados.

                const arquivo = arquivos[i];

                const fileReader = new FileReader();

                // Adiciona um listener em cada arquivo corrido.
                fileReader.addEventListener('load', (evento) => {
                    const nfe = this.documento(evento);

                    resultados.push(nfe); // adiciona o resultado do retorno do FileReader na variavel fora do escopo.

                    if (resultados.length === arquivos.length) {
                        resolve(resultados); // Se o tamanho do resultado for igual o tamanho do arquivo, resolve o Promise.
                    }
                });

                fileReader.readAsText(arquivo);

            }

        });

    }

    documento(evento) {

        //Captura o resultado do FileReader em uma variavel.
        const xmlText = evento.target.result; // variavel em formato de texto.

        const parser = new DOMParser(); //Transforma o texto em arquivo xml.
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        // Captura os caminhos para capturar os valores dentro do parse.
        const caminhoInfo = xmlDoc.getElementsByTagName('ide');


        const caminhoEmit = xmlDoc.getElementsByTagName('emit');


        const caminhoDest = xmlDoc.getElementsByTagName('dest');


        const caminhoProd = xmlDoc.getElementsByTagName('prod');


        const nfe = [this.buscaInfo(caminhoInfo), this.buscaEmit(caminhoEmit), this.buscaDest(caminhoDest), this.buscaProd(caminhoProd)];

        const caminhoImp = xmlDoc.getElementsByTagName('imposto');
        if (caminhoImp[0].getElementsByTagName('ICMS')[0].getElementsByTagName('ICMSSN102').length > 0) {
            nfe.push(this.buscaCSOSN(caminhoImp));
        } else if (caminhoImp[0].getElementsByTagName('ICMS')[0].getElementsByTagName('ICMS60').length > 0) {
            nfe.push(this.buscaCST(caminhoImp));
        };

        return nfe; // Retorna o array com o resultado dos objetos.

    }

    buscaInfo(caminho) {

        let resultadoInfo = {};

        for (let i = 0; i < caminho.length; i++) {
            const operacao = caminho[i].getElementsByTagName('natOp')[0].textContent;
            const numero = caminho[i].getElementsByTagName('nNF')[0].textContent;
            const serie = caminho[i].getElementsByTagName('serie')[0].textContent;

            resultadoInfo.operacao = operacao;
            resultadoInfo.numero = numero;
            resultadoInfo.serie = serie;
        }
        return resultadoInfo;
    }

    buscaEmit(caminho) {

        let resultadoEmit = {};

        for (let i = 0; i < caminho.length; i++) {
            const nomeEmit = caminho[i].getElementsByTagName('xNome')[0].textContent;
            const cnpjEmit = caminho[i].getElementsByTagName('CNPJ')[0].textContent;
            const ufEmit = caminho[i].getElementsByTagName('enderEmit')[0].getElementsByTagName('UF')[0].textContent;
            const ieEmit = caminho[i].getElementsByTagName('IE')[0].textContent;

            resultadoEmit.nomeEmit = nomeEmit;
            resultadoEmit.cnpjEmit = cnpjEmit;
            resultadoEmit.ufEmit = ufEmit;
            resultadoEmit.ieEmit = ieEmit;
        }

        return resultadoEmit;

    }

    buscaDest(caminho) {

        let resultadoDest = {};

        for (let i = 0; i < caminho.length; i++) {
            const nomeDest = caminho[i].getElementsByTagName('xNome')[0].textContent;
            const cpfDest = caminho[i].getElementsByTagName('CPF')[0].textContent;
            const ufDest = caminho[i].getElementsByTagName('enderDest')[0].getElementsByTagName('UF')[0].textContent;

            resultadoDest.nomeDest = nomeDest;
            resultadoDest.cpfDest = cpfDest;
            resultadoDest.ufDest = ufDest;
        }

        return resultadoDest;

    }

    buscaProd(caminho) {

        let resultadoProd = {};

        for (let i = 0; i < caminho.length; i++) {
            const nome = caminho[i].getElementsByTagName('xProd')[0].textContent;
            const preco = caminho[i].getElementsByTagName('vProd')[0].textContent;
            const ncm = caminho[i].getElementsByTagName('NCM')[0].textContent;
            const cfop = caminho[i].getElementsByTagName('CFOP')[0].textContent;
            const qtd = caminho[i].getElementsByTagName('indTot')[0].textContent;
            const unidade = caminho[i].getElementsByTagName('uCom')[0].textContent;

            resultadoProd.nome = nome;
            resultadoProd.preco = preco;
            resultadoProd.ncm = ncm;
            resultadoProd.cfop = cfop;
            resultadoProd.qtd = qtd;
            resultadoProd.unidade = unidade;

        }

        return resultadoProd;

    }

    buscaCSOSN(caminho) {

        let resultadoCSOSN;

        for (let i = 0; i < caminho.length; i++) {
            const orig = caminho[i].getElementsByTagName('ICMS')[0].getElementsByTagName('ICMSSN102')[0].getElementsByTagName('orig')[0].textContent;
            const csosnOrig = caminho[i].getElementsByTagName('ICMS')[0].getElementsByTagName('ICMSSN102')[0].getElementsByTagName('CSOSN')[0].textContent;
            const csosn = orig + csosnOrig;

            resultadoCSOSN = csosn;
        }

        return resultadoCSOSN;

    }

    buscaCST(caminho) {

        let resultadoCST;

        for (let i = 0; i < caminho.length; i++) {
            const orig = caminho[i].getElementsByTagName('ICMS')[0].getElementsByTagName('ICMS60')[0].getElementsByTagName('orig')[0].textContent;
            const cstOrig = caminho[i].getElementsByTagName('ICMS')[0].getElementsByTagName('ICMS60')[0].getElementsByTagName('CST')[0].textContent;
            const cst = orig + cstOrig;

            resultadoCST = cst;
        }

        return resultadoCST;

    }

    getNFE() {

        return this.nfe;

    }

}


