# 🎓 Gerador de Horário Ideal

Extensão para Chrome que ajuda estudantes a encontrar as melhores combinações de horários de aulas, evitando conflitos e otimizando a grade horária.

## ✨ Funcionalidades

- 📚 **Captura automática** de disciplinas do sistema de matrícula
- ⏰ **Seleção de turnos** disponíveis (Matutino, Vespertino, Noturno)
- 🎯 **Detecção inteligente** de conflitos de horário
- 🏆 **Ranking automático** dos 5 melhores horários
- ⭐ **Suporte para disciplinas optativas**
- 🚀 **Interface moderna** e intuitiva
- 📊 **Análise de compatibilidade** entre turmas

## 🚀 Instalação

### Pré-requisitos
- Google Chrome ou navegador baseado em Chromium
- Acesso ao sistema de matrícula da Unifor

### Passo a passo

1. **Clone ou baixe o repositório**
   ```bash
   git clone https://github.com/seu-usuario/horario-aula-chrome.git
   ```

2. **Abra o Chrome e acesse as extensões**
   - Digite `chrome://extensions/` na barra de endereços
   - Ou vá em Menu → Mais ferramentas → Extensões

3. **Ative o Modo do desenvolvedor**
   - No canto superior direito, ative a opção "Modo do desenvolvedor"

4. **Carregue a extensão**
   - Clique em "Carregar sem compactação"
   - Selecione a pasta do projeto `horario-aula-chrome`

5. **Pronto!** A extensão será instalada e o ícone aparecerá na barra de ferramentas

## 📖 Como Usar

### 1️⃣ Capturar Dados das Disciplinas

1. Acesse o site de matrícula: [https://uol.unifor.br/matricula/app](https://uol.unifor.br/matricula/app)
2. Navegue até a página de disciplinas disponíveis
3. A extensão **capturará automaticamente** os dados
4. Você verá uma confirmação no popup da extensão

### 2️⃣ Gerar Horários

1. Clique no **ícone da extensão** na barra de ferramentas
2. Clique em **"Gerar Melhores Horários"**
3. Uma nova aba será aberta com o gerador

### 3️⃣ Configurar Preferências

No Gerador de Horário, você pode:

- **Selecionar turnos disponíveis:**
  - 🌅 Matutino (7h30 - 13h)
  - ☀️ Vespertino (13h30 - 19h)
  - 🌙 Noturno (19h - 22h40)

- **Escolher disciplinas opcionais:**
  - Marque as disciplinas optativas que deseja cursar
  - Apenas as selecionadas serão incluídas no cálculo

### 4️⃣ Visualizar Resultados

1. Clique em **"🚀 Gerar Melhores Horários"**
2. Aguarde o processamento (alguns segundos)
3. Visualize os **Top 5 melhores horários**:
   - 🥇 1º Lugar
   - 🥈 2º Lugar
   - 🥉 3º Lugar
   - 4️⃣ 4º Lugar
   - 5️⃣ 5º Lugar

Cada horário mostra:
- 📖 Lista de disciplinas e professores
- ⏰ Tabela completa de horários
- 🏢 Salas de aula
- 👥 Vagas disponíveis

### 5️⃣ Realizar a Matrícula

1. Escolha um dos horários sugeridos
2. Acesse o site de matrícula
3. Selecione manualmente as turmas indicadas
4. Finalize sua matrícula sem conflitos! ✅

## 🎯 Exemplos de Uso

### Cenário 1: Apenas Disciplinas Obrigatórias
- Marque todos os turnos disponíveis
- Não selecione nenhuma optativa
- Clique em "Gerar Melhores Horários"

### Cenário 2: Com Disciplinas Optativas
- Marque os turnos desejados
- Selecione as optativas de interesse
- Clique em "Gerar Melhores Horários"

### Cenário 3: Apenas um Turno Específico
- Desmarque os turnos que não pode frequentar
- Exemplo: Marcar apenas "Noturno" se trabalha durante o dia
- Clique em "Gerar Melhores Horários"

## 📁 Estrutura do Projeto

```
horario-aula-chrome/
├── css/
│   ├── gerador-horario.css    # Estilos do gerador
│   ├── disciplinas.css         # Estilos da lista de disciplinas
│   └── popup.css               # Estilos do popup
├── javascript/
│   ├── algoritmo-horario.js    # Lógica de geração de horários
│   ├── gerador-horario.js      # Interface do gerador
│   ├── disciplinas.js          # Visualização de disciplinas
│   ├── popup.js                # Popup da extensão
│   ├── content.js              # Script de conteúdo
│   └── inject.js               # Script injetado na página
├── assets/
│   └── hello_extensions.png    # Ícone da extensão
├── gerador-horario.html        # Página principal do gerador
├── disciplinas.html            # Página de visualização
├── hello.html                  # Popup da extensão
├── manifest.json               # Configuração da extensão
└── README.md                   # Este arquivo
```

## 🔧 Tecnologias Utilizadas

- **JavaScript ES6+** - Lógica da aplicação
- **HTML5** - Estrutura das páginas
- **CSS3** - Estilização moderna
- **Chrome Extension API** - Integração com o navegador
- **Local Storage API** - Armazenamento de dados

## 🧮 Como Funciona o Algoritmo

1. **Captura de Dados**: Intercepta requisições da API do sistema de matrícula
2. **Filtragem**: Remove turmas dos turnos não selecionados
3. **Expansão de Horários**: Converte horários compostos (ex: "N24AB" → ["N2AB", "N4AB"])
4. **Detecção de Conflitos**: Verifica sobreposição de horários entre turmas
5. **Geração de Combinações**: Cria todas as combinações válidas sem conflito
6. **Pontuação**: Calcula score baseado em:
   - Menos dias na semana (melhor)
   - Horários mais convenientes (evita muito cedo/muito tarde)
7. **Ranking**: Ordena e exibe os 5 melhores resultados

## ⚠️ Observações Importantes

- **Aulas EAD e "A FIXAR"** não são consideradas no cálculo de conflitos
- **Vagas limitadas**: Confira a disponibilidade no momento da matrícula
- **Dados em tempo real**: Sempre atualize os dados antes de gerar horários
- **Compatibilidade**: Testado no Google Chrome versão 120+

## 🐛 Solução de Problemas

### A extensão não captura os dados
- Certifique-se de estar no site correto: `https://uol.unifor.br/matricula/app`
- Recarregue a página e aguarde carregar completamente
- Verifique o console (F12) para mensagens de erro

### Nenhum horário disponível
- Verifique se selecionou pelo menos um turno
- Confirme se há turmas disponíveis para todas as disciplinas obrigatórias
- Tente selecionar mais turnos ou menos optativas

### Extensão não aparece
- Verifique se o "Modo do desenvolvedor" está ativado
- Recarregue a extensão em `chrome://extensions/`
- Reinicie o navegador

## Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request


## 👨‍💻 Autor

Desenvolvido para facilitar a vida dos estudantes da Unifor

---
