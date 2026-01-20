function mostrarStatus(mensagem, cor = '#28a745') {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = mensagem;
  statusDiv.style.background = cor;
  statusDiv.style.color = 'white';
  statusDiv.style.fontWeight = 'bold';
}

function abrirPaginaDisciplinas() {
  chrome.tabs.create({ url: chrome.runtime.getURL('disciplinas.html') });
}

function exibirDados(dados) {
  if (!dados || dados.length === 0) {
    document.getElementById('dados').innerHTML = '<p style="color: #999;">Nenhum dado capturado ainda.</p>';
    mostrarStatus('Nenhum dado encontrado', '#ffc107');
    return;
  }

  const obrigatorias = dados.filter(d => d.tpDisciplina === 'OBRIGATORIA');
  const optativas = dados.filter(d => d.tpDisciplina === 'OPTATIVA');
  
  console.log('Disciplinas obrigatórias:', obrigatorias);
  console.log('Disciplinas optativas:', optativas);
  
  const html = `
    <div style="text-align: center; padding: 15px;">
      <h2 style="color: #28a745; margin: 0 0 10px 0;"> Dados Capturados!</h2>
      <p style="margin: 5px 0;"><strong>${obrigatorias.length}</strong> disciplinas obrigatorias</p>
      <p style="margin: 5px 0;"><strong>${optativas.length}</strong> disciplinas optativas</p>
      <p style="color: #666; margin: 10px 0; font-size: 0.9em;">Total: ${dados.length} disciplinas</p>
    </div>
  `;
  
  document.getElementById('dados').innerHTML = html;
  mostrarStatus(`✓ ${dados.length} disciplinas capturadas!`, '#28a745');
}

// Ouvir mensagens do content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.tipo === 'dados_capturados') {
    console.log('✓ JSON capturado:', request.dados);
    console.log('URL:', request.url);
    
    // Armazenar os dados com timestamp
    chrome.storage.local.set({ 
      'disciplinas': request.dados,
      'timestamp': new Date().toISOString()
    }, () => {
      console.log('✓ Dados salvos no storage');
    });
    
    exibirDados(request.dados);
  }
});

// Verificar se já tem dados armazenados ao abrir o popup
chrome.storage.local.get(['disciplinas', 'timestamp'], function(result) {
  console.log('Storage result:', result);
  
  if (result.disciplinas) {
    exibirDados(result.disciplinas);
    if (result.timestamp) {
      const data = new Date(result.timestamp);
      mostrarStatus(`Ultima captura: ${data.toLocaleString('pt-BR')}`, '#17a2b8');
    }
  } else {
    mostrarStatus('Aguardando captura de dados...', '#6c757d');
  }
});

// Botão para gerar horários
document.getElementById('btnGerador').addEventListener('click', () => {
  chrome.storage.local.get(['disciplinas'], function(result) {
    if (result.disciplinas && result.disciplinas.length > 0) {
      chrome.tabs.create({ url: chrome.runtime.getURL('gerador-horario.html') });
    } else {
      document.getElementById('dados').innerHTML = '<p style="color: red;">Nenhum dado armazenado. Acesse o site da matrícula primeiro.</p>';
      mostrarStatus('❌ Nenhum dado encontrado', '#dc3545');
    }
  });
});