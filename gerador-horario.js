let disciplinasGlobais = [];

// Carregar dados do storage
function atualizarDados() {
  chrome.storage.local.get(['disciplinas'], function(result) {
    if (!result.disciplinas || result.disciplinas.length === 0) {
      document.getElementById('disciplinas-list').innerHTML = 
        '<div class="status">❌ Nenhum dado de disciplinas encontrado. Acesse o site de matrícula primeiro.</div>';
      return;
    }
    
    disciplinasGlobais = result.disciplinas;
    exibirDisciplinas();
  });
}

// Exibir disciplinas obrigatórias
function exibirDisciplinas() {
  const obrigatorias = disciplinasGlobais.filter(d => d.tpDisciplina === 'OBRIGATORIA');
  
  if (obrigatorias.length === 0) {
    document.getElementById('disciplinas-list').innerHTML = 
      '<div class="status">❌ Nenhuma disciplina obrigatória encontrada.</div>';
    return;
  }
  
  let html = '';
  obrigatorias.forEach(d => {
    html += `
      <div class="disciplina-item">
        <strong>${d.codigo} - ${d.nome}</strong>
        <div class="horario-display">
          <strong>Turmas disponíveis:</strong> ${d.turmas ? d.turmas.length : 0}
        </div>
        <ul class="turma-list">
          ${d.turmas ? d.turmas.map(t => `
            <li>
              ${t.dsHorario} - ${t.dsSala}
              ${t.professor && t.professor.nome ? ` (${t.professor.nome})` : ''}
            </li>
          `).join('') : '<li>Sem turmas</li>'}
        </ul>
      </div>
    `;
  });
  
  document.getElementById('disciplinas-list').innerHTML = html;
}

// Gerar melhores horários
function gerarMelhoresHorarios() {
  const obrigatorias = disciplinasGlobais.filter(d => d.tpDisciplina === 'OBRIGATORIA');
  
  if (obrigatorias.length === 0) {
    alert('❌ Nenhuma disciplina obrigatória encontrada!');
    return;
  }
  
  // Filtrar apenas disciplinas com turmas
  const comTurmas = obrigatorias.filter(d => d.turmas && d.turmas.length > 0);
  
  if (comTurmas.length === 0) {
    alert('❌ Nenhuma disciplina tem turmas disponíveis!');
    return;
  }
  
  console.log(`Gerando combinações para ${comTurmas.length} disciplinas...`);
  
  const inicio = performance.now();
  
  // Gerar combinações
  const combinacoes = window.HorarioAlgoritmo.gerarCombinacoes(comTurmas);
  
  const fim = performance.now();
  const tempo = (fim - inicio).toFixed(2);
  
  console.log(`✅ ${combinacoes.length} combinações geradas em ${tempo}ms`);
  
  // Calcular scores
  const combinacoesComScore = combinacoes.map(comb => ({
    turmas: comb,
    score: window.HorarioAlgoritmo.calcularScore(comb)
  }));
  
  // Ordenar por score (maior primeiro)
  combinacoesComScore.sort((a, b) => b.score - a.score);
  
  // Pegar top 5
  const top5 = combinacoesComScore.slice(0, 5);
  
  // Atualizar stats
  document.getElementById('total-combinacoes').textContent = combinacoes.length;
  document.getElementById('tempo-processamento').textContent = tempo;
  
  // Exibir resultados
  exibirResultados(top5);
}

// Exibir resultados
function exibirResultados(resultados) {
  if (resultados.length === 0) {
    document.getElementById('resultados').innerHTML = 
      '<div class="status">❌ Nenhuma combinação de horário válida encontrada.</div>';
    return;
  }
  
  let html = '';
  
  resultados.forEach((resultado, index) => {
    const ranking = index === 0 ? 'primeiro' : index === 1 ? 'segundo' : 'terceiro';
    const medalhas = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    
    html += `
      <div class="resultado-card ${ranking}">
        <div class="score">
          ${medalhas[index]} Score: ${resultado.score}/100
        </div>
        <div class="score-bar">
          <div class="score-bar-fill" style="width: ${resultado.score}%"></div>
        </div>
        
        <h3>📖 Disciplinas</h3>
        ${resultado.turmas.map(turma => `
          <div style="margin-bottom: 12px; padding: 10px; background: #f9f9f9; border-left: 3px solid #6366f1; border-radius: 4px;">
            <strong>${turma.cdDisciplina}</strong><br>
            <em>${turma.nmDisciplina || turma.cdDisciplina}</em><br>
            <span style="font-size: 0.8rem; color: #6b7280;">👨‍🏫 ${turma.professor && turma.professor.nome ? turma.professor.nome : 'N/A'}</span>
          </div>
        `).join('')}
        
        <h3 style="margin-top: 20px;">⏰ Horários</h3>
        <table class="tabela-horario">
          <tr>
            <th>Turma</th>
            <th>Horário</th>
            <th>Sala</th>
            <th>Vagas</th>
          </tr>
          ${resultado.turmas.map(turma => `
            <tr>
              <td>${turma.cdTurma}</td>
              <td>${turma.dsHorario}</td>
              <td>${turma.dsSala}</td>
              <td>${turma.nrVagas || '--'}</td>
            </tr>
          `).join('')}
        </table>
        
        <p style="margin-top: 15px; padding: 12px; background: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 4px; font-size: 0.85rem; color: #92400e;">
          💡 Este é um dos ${resultados.length} melhores horários encontrados. Acesse o site de matrícula e selecione estas turmas.
        </p>
      </div>
    `;
  });
  
  document.getElementById('resultados').innerHTML = html;
}

// Carregar dados ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
  atualizarDados();
  document.getElementById('btnGerar').addEventListener('click', gerarMelhoresHorarios);
  document.getElementById('btnAtualizar').addEventListener('click', atualizarDados);
});
