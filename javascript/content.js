// Injetar script externo para contornar CSP
console.log('🔧 Content script carregado!');

function injectScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('javascript/inject.js');
  script.onload = function() {
    this.remove();
    console.log('✅ Script injetado com sucesso!');
  };
  script.onerror = function() {
    console.log('❌ Erro ao carregar script');
  };
  
  (document.head || document.documentElement).appendChild(script);
}

// Injetar assim que possível
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectScript);
} else {
  injectScript();
}

// Ouvir mensagens do script injetado
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  if (event.data.type === 'DISCIPLINAS_CAPTURADAS') {
    console.log('📨 Dados recebidos no content script!');
    console.log('Quantidade:', event.data.data.length, 'itens');
    
    // Salvar no storage LOCAL (SEMPRE)
    chrome.storage.local.set({ 
      'disciplinas': event.data.data,
      'timestamp': new Date().toISOString()
    }, () => {
      console.log('✓ Dados salvos no storage!');
    });
    
    // Tentar enviar para o popup (se estiver aberto)
    chrome.runtime.sendMessage({
      tipo: 'dados_capturados',
      dados: event.data.data,
      url: event.data.url
    }).catch((error) => {
      // Não é erro crítico, apenas significa que popup não está aberto
    });
  }
});