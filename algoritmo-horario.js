// Mapear períodos para horários reais
const PERIODOS = {
  'AB': { inicio: 0, fim: 100 },      // Será ajustado por turno
  'CD': { inicio: 100, fim: 200 },
  'EF': { inicio: 200, fim: 300 }
};

// Horários por turno (em minutos desde meia-noite)
const TURNOS = {
  'M': {
    'AB': { inicio: 7*60+30, fim: 9*60+10 },    // 7:30 - 9:10
    'CD': { inicio: 9*60+30, fim: 11*60+10 },   // 9:30 - 11:10
    'EF': { inicio: 11*60+20, fim: 13*60 }      // 11:20 - 13:00
  },
  'T': {
    'AB': { inicio: 13*60+30, fim: 15*60+10 },  // 13:30 - 15:10
    'CD': { inicio: 15*60+30, fim: 17*60+10 },  // 15:30 - 17:10
    'EF': { inicio: 17*60+20, fim: 19*60 }      // 17:20 - 19:00
  },
  'N': {
    'AB': { inicio: 19*60, fim: 20*60+30 },     // 19:00 - 20:30
    'CD': { inicio: 21*60, fim: 22*60+40 }      // 21:00 - 22:40
  }
};

// Dias da semana
const DIAS = {
  '2': 'Segunda',
  '3': 'Terça',
  '4': 'Quarta',
  '5': 'Quinta',
  '6': 'Sexta'
};

// Converter tempo (ex: "M2AB") para objeto com horário
function parseTempo(tempo) {
  // Exemplo: M2EF, T35CD, N4AB
  const match = tempo.match(/([MTN])(\d)([A-Z]{2})/);
  if (!match) return null;
  
  const [, turno, dia, periodo] = match;
  const horario = TURNOS[turno][periodo];
  
  return {
    tempo: tempo,
    turno: turno,
    dia: dia,
    periodo: periodo,
    horario: horario,
    diaTexto: DIAS[dia],
    horaInicio: minutosParaHMS(horario.inicio),
    horaFim: minutosParaHMS(horario.fim)
  };
}

// Converter minutos para HH:MM:SS
function minutosParaHMS(minutos) {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Detectar conflito de horário
function temConflito(tempo1, tempo2) {
  const t1 = parseTempo(tempo1);
  const t2 = parseTempo(tempo2);
  
  if (!t1 || !t2) return false;
  
  // Dias diferentes = sem conflito
  if (t1.dia !== t2.dia) return false;
  
  // Mesmo dia: verificar sobreposição de horários
  const t1Fim = t1.horario.fim;
  const t2Inicio = t2.horario.inicio;
  const t2Fim = t2.horario.fim;
  const t1Inicio = t1.horario.inicio;
  
  // Há sobreposição se: t1 começa antes de t2 terminar AND t2 começa antes de t1 terminar
  return (t1Inicio < t2Fim && t2Inicio < t1Fim);
}

// Gerar combinações válidas de turmas
function gerarCombinacoes(disciplinasObrigatorias) {
  // disciplinasObrigatorias é um array de objetos com propriedade 'turmas'
  
  function combinar(index, combinacaoAtual) {
    if (index === disciplinasObrigatorias.length) {
      return [combinacaoAtual];
    }
    
    const disciplina = disciplinasObrigatorias[index];
    let todasCombinacoes = [];
    
    for (const turma of disciplina.turmas) {
      // Verificar se há conflito com turmas já selecionadas
      let temConflitoBool = false;
      
      for (const turmaAnterior of combinacaoAtual) {
        // Pegar horários - usar dsHorario se tempos não existir
        const horariosAtual = turma.dsHorario ? [turma.dsHorario] : (turma.tempos || []);
        const horariosAnterior = turmaAnterior.dsHorario ? [turmaAnterior.dsHorario] : (turmaAnterior.tempos || []);
        
        for (const horarioAtual of horariosAtual) {
          for (const horarioAnterior of horariosAnterior) {
            // Ignorar EAD e A FIXAR (não têm conflito)
            if (horarioAtual.includes('FIXAR') || horarioAnterior.includes('FIXAR') ||
                !horarioAtual || !horarioAnterior || horarioAtual === '' || horarioAnterior === '') {
              continue;
            }
            
            if (temConflito(horarioAtual, horarioAnterior)) {
              temConflitoBool = true;
              break;
            }
          }
          if (temConflitoBool) break;
        }
        if (temConflitoBool) break;
      }
      
      if (!temConflitoBool) {
        const novasCombinacoes = combinar(index + 1, [...combinacaoAtual, turma]);
        todasCombinacoes = todasCombinacoes.concat(novasCombinacoes);
      }
    }
    
    return todasCombinacoes;
  }
  
  return combinar(0, []);
}

// Calcular score de uma combinação de turmas
function calcularScore(combinacao) {
  let score = 100;
  const temposUnicos = new Set();
  const diasUsados = new Set();
  
  for (const turma of combinacao) {
    // Usar dsHorario se tempos não existir
    const horarios = turma.dsHorario ? [turma.dsHorario] : (turma.tempos || []);
    
    for (const tempo of horarios) {
      // Ignorar EAD e A FIXAR
      if (!tempo || tempo === '' || tempo.includes('FIXAR')) {
        continue;
      }
      
      temposUnicos.add(tempo);
      const parsed = parseTempo(tempo);
      if (parsed) {
        diasUsados.add(parsed.dia);
        
        // Penalidade: aulas muito cedo (antes de 8h)
        if (parsed.horario.inicio < 8*60) {
          score -= 10;
        }
        
        // Penalidade: aulas muito tarde (depois de 20h)
        if (parsed.horario.fim > 20*60) {
          score -= 15;
        }
      }
    }
  }
  
  // Prêmio: menos dias na semana
  score += (5 - diasUsados.size) * 5;
  
  return Math.max(0, score);
}

// Exportar funções
window.HorarioAlgoritmo = {
  parseTempo,
  temConflito,
  gerarCombinacoes,
  calcularScore,
  TURNOS,
  DIAS
};
