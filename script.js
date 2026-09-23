// Senha atualizada para acesso ao painel
const SENHA_CORRETA = "P@nda654321";

// Estado Local da Aplicação (Zerado se a página for fechada ou atualizada)
let estadoFiltros = {
    setor: 'SUPORTE', // Foco inicial no Suporte Técnico
    cidades: ['SA', 'DIADEMA'],
    subtiposSuporte: [
        'Sem conexão', 
        'Sinal de fibra fora do padrão', 
        'Lentidão / Quedas', 
        'Retorno Adiz', 
        'Troca de local'
    ],
    apenasUrgentes: false
};

// Base de dados de exemplo com O.S.
let listaOrdensServico = [
    { id: 1, numero: '427186', cidade: 'SA', setor: 'SUPORTE', tipo: 'Sem conexão', turno: 'MANHA', bairro: 'Centro (SA)', urgente: true },
    { id: 2, numero: '425514', cidade: 'SA', setor: 'SUPORTE', tipo: 'Retorno Adiz', turno: 'MANHA', bairro: 'Bangu', urgente: false },
    { id: 3, numero: '426920', cidade: 'DIADEMA', setor: 'SUPORTE', tipo: 'Sinal de fibra fora do padrão', turno: 'MANHA', bairro: 'Piraporinha', urgente: false },
    { id: 4, numero: '427009', cidade: 'DIADEMA', setor: 'SUPORTE', tipo: 'Lentidão / Quedas', turno: 'MANHA', bairro: 'Campanário', urgente: false },
    { id: 5, numero: '426604', cidade: 'DIADEMA', setor: 'FINANCEIRO', tipo: 'Troca de Endereço', turno: 'MANHA', bairro: 'Taboão', urgente: false },
    { id: 6, numero: '427306', cidade: 'SA', setor: 'COMERCIAL', tipo: 'Instalação de Rotina', turno: 'TARDE', bairro: 'Jardim', urgente: false },
    { id: 7, numero: '427433', cidade: 'SA', setor: 'SUPORTE', tipo: 'Sem conexão', turno: 'TARDE', bairro: 'Utinga', urgente: false },
    { id: 8, numero: '427000', cidade: 'DIADEMA', setor: 'SUPORTE', tipo: 'Troca de local', turno: 'TARDE', bairro: 'Centro (Diadema)', urgente: false },
    { id: 9, numero: '427387', cidade: 'DIADEMA', setor: 'SUPORTE', tipo: 'Sinal de fibra fora do padrão', turno: 'MANHA', bairro: 'Eldorado', urgente: true }
];

const tiposPorSetor = {
    SUPORTE: ['Sem conexão', 'Sinal de fibra fora do padrão', 'Lentidão / Quedas', 'Retorno Adiz', 'Troca de local'],
    FINANCEIRO: ['Troca de Endereço', 'Melhoria de Plano (Upgrade)'],
    COMERCIAL: ['Instalação de Rotina', 'Instalação B2B / Comercial']
};

// Lógica de Autenticação Exclusiva por Senha
function autenticar(event) {
    event.preventDefault();
    
    const senhaDigitada = document.getElementById('system-password').value;
    const erroDiv = document.getElementById('login-error');

    // Validação estrita
    if (senhaDigitada === SENHA_CORRETA) {
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        
        // Limpa o campo de senha por segurança
        document.getElementById('system-password').value = '';
        erroDiv.style.display = 'none';
        
        // Renderiza as ordens de serviço
        renderizarAgenda();
    } else {
        // Senha incorreta: impede o acesso e exibe a mensagem de erro
        erroDiv.style.display = 'flex';
        document.getElementById('system-password').value = '';
        document.getElementById('system-password').focus();
    }
}

function logout() {
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('login-overlay').classList.remove('hidden');
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('system-password').value = '';
}

// Controle de Filtros
function setSetor(setor, btn) {
    estadoFiltros.setor = setor;
    
    document.querySelectorAll('.segmented-control .segment-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const subfilterContainer = document.getElementById('support-subfilters');
    if (setor === 'SUPORTE' || setor === 'TODOS') {
        subfilterContainer.style.display = 'flex';
    } else {
        subfilterContainer.style.display = 'none';
    }

    renderizarAgenda();
}

function toggleCidade(cidade) {
    const index = estadoFiltros.cidades.indexOf(cidade);
    const btnSA = document.getElementById('btn-city-sa');
    const btnDiadema = document.getElementById('btn-city-diadema');

    if (index > -1) {
        if (estadoFiltros.cidades.length > 1) {
            estadoFiltros.cidades.splice(index, 1);
        }
    } else {
        estadoFiltros.cidades.push(cidade);
    }

    btnSA.className = estadoFiltros.cidades.includes('SA') ? 'pill-btn active-sa' : 'pill-btn';
    btnDiadema.className = estadoFiltros.cidades.includes('DIADEMA') ? 'pill-btn active-diadema' : 'pill-btn';

    renderizarAgenda();
}

function toggleTagFilter(subtipo, btn) {
    const index = estadoFiltros.subtiposSuporte.indexOf(subtipo);
    if (index > -1) {
        estadoFiltros.subtiposSuporte.splice(index, 1);
        btn.classList.remove('active');
    } else {
        estadoFiltros.subtiposSuporte.push(subtipo);
        btn.classList.add('active');
    }
    renderizarAgenda();
}

// Renderização dos Cards
function renderizarAgenda() {
    const gridManha = document.getElementById('grid-manha');
    const gridTarde = document.getElementById('grid-tarde');
    
    gridManha.innerHTML = '';
    gridTarde.innerHTML = '';

    const apenasUrgentes = document.getElementById('chk-urgente').checked;

    let countManha = 0;
    let countTarde = 0;

    listaOrdensServico.forEach(os => {
        const atendeSetor = (estadoFiltros.setor === 'TODOS') || (os.setor === estadoFiltros.setor);
        const atendeCidade = estadoFiltros.cidades.includes(os.cidade);
        const atendeUrgente = !apenasUrgentes || os.urgente;
        
        let atendeSubtipo = true;
        if (os.setor === 'SUPORTE' && (estadoFiltros.setor === 'SUPORTE' || estadoFiltros.setor === 'TODOS')) {
            atendeSubtipo = estadoFiltros.subtiposSuporte.includes(os.tipo);
        }

        if (atendeSetor && atendeCidade && atendeUrgente && atendeSubtipo) {
            const cardHTML = criarCardHTML(os);
            
            if (os.turno === 'MANHA') {
                gridManha.innerHTML += cardHTML;
                countManha++;
            } else {
                gridTarde.innerHTML += cardHTML;
                countTarde++;
            }
        }
    });

    document.getElementById('counter-manha').innerText = `${countManha} Ordens`;
    document.getElementById('counter-tarde').innerText = `${countTarde} Ordens`;
}

function criarCardHTML(os) {
    const classeCidade = os.cidade.toLowerCase();
    const nomeCidade = os.cidade === 'SA' ? 'Santo André' : 'Diadema';
    
    return `
        <div class="os-card ${classeCidade} ${os.urgente ? 'urgente' : ''}">
            <div class="os-card-header">
                <span class="os-number">O.S. #${os.numero}</span>
                ${os.urgente ? '<span class="os-tag-urgente"><i class="fa-solid fa-triangle-exclamation"></i> URGENTE</span>' : ''}
            </div>
            <div class="os-type">${os.tipo}</div>
            <div class="os-details">
                <span><i class="fa-solid fa-location-dot"></i> ${os.bairro} (${nomeCidade})</span>
            </div>
            <span class="os-badge-setor">${os.setor}</span>
        </div>
    `;
}

// Modal de Agendamento
function abrirModalNovaOS() {
    atualizarOpcoesTipos();
    document.getElementById('modal-os').classList.remove('hidden');
}

function fecharModalNovaOS() {
    document.getElementById('modal-os').classList.add('hidden');
}

function atualizarOpcoesTipos() {
    const setorSelecionado = document.getElementById('os-setor').value;
    const selectTipo = document.getElementById('os-tipo');
    selectTipo.innerHTML = '';

    tiposPorSetor[setorSelecionado].forEach(tipo => {
        selectTipo.innerHTML += `<option value="${tipo}">${tipo}</option>`;
    });
}

function salvarNovaOS(event) {
    event.preventDefault();
    
    const novaOS = {
        id: Date.now(),
        numero: document.getElementById('os-numero').value,
        cidade: document.getElementById('os-cidade').value,
        setor: document.getElementById('os-setor').value,
        tipo: document.getElementById('os-tipo').value,
        turno: document.getElementById('os-turno').value,
        bairro: document.getElementById('os-bairro').value,
        urgente: document.getElementById('os-urgente').checked
    };

    listaOrdensServico.push(novaOS);
    renderizarAgenda();
    fecharModalNovaOS();
    document.getElementById('form-nova-os').reset();
}