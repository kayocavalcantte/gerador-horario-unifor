let disciplinasGlobais = [];

// Carregar dados do storage
function atualizarDados() {
  console.log('📥 Tentando carregar dados do storage...');
  chrome.storage.local.get(['disciplinas'], function(result) {
    console.log('📦 Resultado do storage:', result);
    
    if (!result.disciplinas || result.disciplinas.length === 0) {
      console.log('❌ Nenhum dado encontrado');
      const disciplinasEl = document.getElementById('disciplinas-list');
      if (disciplinasEl) {
        disciplinasEl.innerHTML = '<div class="status">❌ Nenhum dado de disciplinas encontrado. Acesse o site de matrícula primeiro.</div>';
      }
      const optativasEl = document.getElementById('optativas-list');
      if (optativasEl) {
        optativasEl.innerHTML = '<div class="status">Sem dados</div>';
      }
      return;
    }
    
    console.log(`✅ ${result.disciplinas.length} disciplinas carregadas!`);
    disciplinasGlobais = result.disciplinas;
    exibirDisciplinas();
    exibirOpcionais();
  });
}

// Exibir disciplinas obrigatórias
function exibirDisciplinas() {
  console.log('📚 Exibindo disciplinas obrigatórias...');
  const obrigatorias = disciplinasGlobais.filter(d => d.tpDisciplina === 'OBRIGATORIA');
  console.log(`Encontradas ${obrigatorias.length} disciplinas obrigatórias`);
  
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
  console.log('✅ Disciplinas obrigatórias exibidas!');
}

// Exibir disciplinas opcionais com checkboxes
function exibirOpcionais() {
  console.log('⭐ Exibindo disciplinas opcionais...');
  const optativasEl = document.getElementById('optativas-list');
  if (!optativasEl) {
    console.log('❌ Elemento optativas-list não encontrado!');
    return;
  }
  
  const opcionais = disciplinasGlobais.filter(d => d.tpDisciplina === 'OPTATIVA');
  console.log(`Encontradas ${opcionais.length} disciplinas opcionais`);
  
  if (opcionais.length === 0) {
    optativasEl.innerHTML = '<div class="status">Nenhuma disciplina opcional disponível</div>';
    return;
  }
  
  let html = '';
  opcionais.forEach((d, idx) => {
    const turmasCount = d.turmas ? d.turmas.length : 0;
    html += `
      <div class="optativa-item">
        <label class="checkbox-wrapper">
          <div>
            <strong>${d.codigo}</strong>
            <span>${d.nome}</span>
            <span style="font-size: 0.7rem; color: #9ca3af;">📌 ${turmasCount} turma(s)</span>
          </div>
        <input type="checkbox" class="optativa-checkbox" data-index="${idx}" data-codigo="${d.codigo}">
        </label>
      </div>
    `;
  });
  
  optativasEl.innerHTML = html;
  console.log('✅ Disciplinas opcionais exibidas!');
}


// Gerar melhores horários
function gerarMelhoresHorarios() {
  const obrigatorias = disciplinasGlobais.filter(d => d.tpDisciplina === 'OBRIGATORIA');
  
  if (obrigatorias.length === 0) {
    alert('❌ Nenhuma disciplina obrigatória encontrada!');
    return;
  }
  
  // Filtrar obrigatórias com turmas
  let disciplinaSelecionadas = obrigatorias.filter(d => d.turmas && d.turmas.length > 0);
  
  if (disciplinaSelecionadas.length === 0) {
    alert('❌ Nenhuma disciplina obrigatória tem turmas disponíveis!');
    return;
  }
  
  // Capturar disciplinas opcionais selecionadas
  const checkboxesSelecionados = Array.from(document.querySelectorAll('.optativa-checkbox:checked'));
  const indicesOpcionaisSelecionadas = checkboxesSelecionados.map(cb => parseInt(cb.dataset.index));
  
  if (indicesOpcionaisSelecionadas.length > 0) {
    const opcionais = disciplinasGlobais.filter(d => d.tpDisciplina === 'OPTATIVA');
    const opcionaisSelecionadas = opcionais
      .filter((d, idx) => indicesOpcionaisSelecionadas.includes(idx))
      .filter(d => d.turmas && d.turmas.length > 0);
    
    disciplinaSelecionadas = [...disciplinaSelecionadas, ...opcionaisSelecionadas];
  }
  
  console.log(`Gerando combinações para ${disciplinaSelecionadas.length} disciplinas...`);
  
  const inicio = performance.now();
  
  // Gerar combinações
  const combinacoes = window.HorarioAlgoritmo.gerarCombinacoes(disciplinaSelecionadas);
  
  const fim = performance.now();
  const tempo = (fim - inicio).toFixed(2);
  
  console.log(`✅ ${combinacoes.length} combinações geradas em ${tempo}ms`);
  
  if (combinacoes.length === 0) {
    alert('❌ Nenhuma combinação válida encontrada com as disciplinas selecionadas!');
    return;
  }
  
  // Calcular scores
  const combinacoesComScore = combinacoes.map(comb => ({
    turmas: comb,
    score: window.HorarioAlgoritmo.calcularScore(comb)
  }));
  
  // Ordenar por score (maior primeiro)
  combinacoesComScore.sort((a, b) => b.score - a.score);
  
  // Pegar top 5
  const top5 = combinacoesComScore.slice(0, 5);
  
  // Exibir resultados
  exibirResultados(top5);
}

// Exibir resultados
function exibirResultados(resultados) {
  const resultadosEl = document.getElementById('resultados');
  if (!resultadosEl) {
    console.log('❌ Elemento resultados não encontrado!');
    return;
  }
  
  if (resultados.length === 0) {
    resultadosEl.innerHTML = 
      '<div class="status">❌ Nenhuma combinação de horário válida encontrada.</div>';
    return;
  }
  
  let html = '';
  
  resultados.forEach((resultado, index) => {
    const ranking = index === 0 ? 'primeiro' : index === 1 ? 'segundo' : 'terceiro';
    const medalhas = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    const posicoes = ['1º Lugar', '2º Lugar', '3º Lugar', '4º Lugar', '5º Lugar'];
    
    html += `
      <div class="resultado-card ${ranking}">
        <div class="score">
          ${medalhas[index]} ${posicoes[index]}
        </div>
        <div class="score-bar">
          <div class="score-bar-fill" style="width: 100%"></div>
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
  
  if (resultadosEl) {
    resultadosEl.innerHTML = html;
  }
}

// Carregar dados ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Página carregada! Iniciando gerador de horários...');
  atualizarDados();
  
  const btnGerar = document.getElementById('btnGerar');
  const btnAtualizar = document.getElementById('btnAtualizar');
  
  if (btnGerar) {
    btnGerar.addEventListener('click', gerarMelhoresHorarios);
    console.log('✅ Botão Gerar conectado');
  }
  
  if (btnAtualizar) {
    btnAtualizar.addEventListener('click', atualizarDados);
    console.log('✅ Botão Atualizar conectado');
  }
});
