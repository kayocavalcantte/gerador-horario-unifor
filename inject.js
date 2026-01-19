console.log('✅ Script externo carregado!');

// Interceptar fetch
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = typeof args[0] === 'string' ? args[0] : args[0].url;
  console.log('📡 FETCH:', url);
  
  return originalFetch.apply(this, args).then(response => {
    const responseClone = response.clone();
    
    if (url.includes('disciplinas') || url.includes('api')) {
      responseClone.json().then(data => {
        console.log('✅ RESPOSTA API:', url);
        console.log('📦 Dados:', data.slice ? `${data.length} itens` : data);
        window.postMessage({
          type: 'DISCIPLINAS_CAPTURADAS',
          data: data,
          url: url
        }, '*');
      }).catch(() => {});
    }
    
    return response;
  });
};

// Interceptar XMLHttpRequest
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
  console.log('📡 XHR:', method, url);
  
  this.addEventListener('readystatechange', function() {
    if (this.readyState === 4 && (url.includes('disciplinas') || url.includes('api'))) {
      console.log('✅ XHR RESPOSTA:', url, 'Status:', this.status);
      try {
        const data = JSON.parse(this.responseText);
        console.log('📦 Dados:', data.slice ? `${data.length} itens` : data);
        window.postMessage({
          type: 'DISCIPLINAS_CAPTURADAS',
          data: data,
          url: url
        }, '*');
      } catch (e) {}
    }
  });
  
  return originalOpen.apply(this, arguments);
};

console.log('✅ Interceptadores instalados!');
