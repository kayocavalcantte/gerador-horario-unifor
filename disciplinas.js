function exibirDados() {
  chrome.storage.local.get(['disciplinas', 'timestamp'], function(result) {
    const statusDiv = document.getElementById('status');
    const dadosDiv = document.getElementById('dados');
    
    if (!result.disciplinas || result.disciplinas.length === 0) {
      statusDiv.innerHTML = '❌ Nenhum dado capturado. Acesse <a href="https://uol.unifor.br/matricula/app" target="_blank">https://uol.unifor.br/matricula/app</a> primeiro.';
      statusDiv.style.background = '#fff3cd';
      dadosDiv.innerHTML = '';
      return;
    }

    const obrigatorias = result.disciplinas.filter(d => d.tpDisciplina === 'OBRIGATORIA');
    const optativas = result.disciplinas.filter(d => d.tpDisciplina === 'OPTATIVA');
    
    let statusMsg = `✅ ${result.disciplinas.length} disciplinas capturadas`;
    if (result.timestamp) {
      const data = new Date(result.timestamp);
      statusMsg += ` - Última atualização: ${data.toLocaleString('pt-BR')}`;
    }
    statusDiv.textContent = statusMsg;
    statusDiv.style.background = '#d4edda';
    
    let html = `
      <h2>✅ Disciplinas Obrigatórias (${obrigatorias.length})</h2>
      <ul>
        ${obrigatorias.map(d => `
          <li class="obrigatoria">
            <strong>${d.codigo}</strong> - ${d.nome}
            <div class="info">
              Semestre: ${d.nrSemestre} | 
              Créditos: ${d.creditoTeorico}T + ${d.creditoPratico}P | 
              Carga: ${d.nrCargaHoraria}h
              ${d.turmas && d.turmas.length > 0 ? ` | Turmas: ${d.turmas.length}` : ''}
            </div>
            ${d.turmas && d.turmas.length > 0 ? `
              <div class="turma">
                ${d.turmas.map(t => `
                  ${t.dsHorario ? `📅 ${t.dsHorario}` : ''} 
                  ${t.dsSala ? `📍 ${t.dsSala}` : ''} 
                  ${t.professor && t.professor.nome ? `👤 ${t.professor.nome}` : ''}
                  ${t.nrVagas ? `(${t.nrVagas} vagas)` : ''}
                `).join('<br>')}
              </div>
            ` : ''}
          </li>
        `).join('')}
      </ul>
      
      <h2>📚 Disciplinas Optativas (${optativas.length})</h2>
      <ul>
        ${optativas.map(d => `
          <li class="optativa">
            <strong>${d.codigo}</strong> - ${d.nome}
            <div class="info">
              Semestre: ${d.nrSemestre} | 
              Créditos: ${d.creditoTeorico}T + ${d.creditoPratico}P | 
              Carga: ${d.nrCargaHoraria}h
              ${d.turmas && d.turmas.length > 0 ? ` | Turmas: ${d.turmas.length}` : ''}
            </div>
            ${d.turmas && d.turmas.length > 0 ? `
              <div class="turma">
                ${d.turmas.slice(0, 3).map(t => `
                  ${t.dsHorario ? `📅 ${t.dsHorario}` : ''} 
                  ${t.dsSala ? `📍 ${t.dsSala}` : ''} 
                  ${t.professor && t.professor.nome ? `👤 ${t.professor.nome}` : ''}
                  ${t.nrVagas ? `(${t.nrVagas} vagas)` : ''}
                `).join('<br>')}
                ${d.turmas.length > 3 ? `<br><em>...e mais ${d.turmas.length - 3} turmas</em>` : ''}
              </div>
            ` : ''}
          </li>
        `).join('')}
      </ul>
    `;
    
    dadosDiv.innerHTML = html;
  });
}

function atualizarDados() {
  exibirDados();
}

function limparDados() {
  if (confirm('Deseja realmente limpar todos os dados?')) {
    chrome.storage.local.clear(() => {
      document.getElementById('status').textContent = 'Dados removidos com sucesso!';
      document.getElementById('status').style.background = '#f8d7da';
      document.getElementById('dados').innerHTML = '';
    });
  }
}

// Carregar dados ao abrir a página
exibirDados();

// Atualizar automaticamente quando houver novos dados
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.disciplinas) {
    exibirDados();
  }
});
