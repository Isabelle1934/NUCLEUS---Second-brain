// ================== VARIÁVEIS ==================
let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
const lista = document.getElementById("lista-tarefas");
const input = document.getElementById("nova-tarefa");
const botao = document.getElementById("adicionar");
let pontos = 0;
let nivel = 1;

// ================== RENDERIZAR CHECKLIST ==================
function renderizar() {
  lista.innerHTML = "";

  tarefas.forEach((tarefa, index) => {
    const li = document.createElement("li");

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = tarefa.concluida;
    checkbox.addEventListener("change", () => {
      tarefas[index].concluida = checkbox.checked;
      salvar();
      renderizar();
      atualizarGrafico();
    });

    // Texto
    const texto = document.createElement("span");
    texto.textContent = tarefa.texto;
    if (tarefa.concluida) {
      texto.style.textDecoration = "line-through";
      texto.style.color = "gray";
    }

    // Botão remover
    const remover = document.createElement("button");
    remover.textContent = "X";
    remover.addEventListener("click", () => {
      tarefas.splice(index, 1);
      salvar();
      renderizar();
      atualizarGrafico();
    });

    li.appendChild(checkbox);
    li.appendChild(texto);
    li.appendChild(remover);

    lista.appendChild(li);
  });
}

// ================== SALVAR NO LOCALSTORAGE ==================
function salvar() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

// ================== ADICIONAR NOVA TAREFA ==================
botao.addEventListener("click", () => {
  if (input.value.trim() !== "") {
    tarefas.push({ texto: input.value, concluida: false });
    salvar();
    renderizar();
    atualizarGrafico();
    input.value = "";
  }
});

// ================== GRÁFICO PIZZA ==================
const ctx = document.getElementById("grafico").getContext("2d");
let grafico = new Chart(ctx, {
  type: "pie",
  data: {
    labels: ["Concluídas", "Pendentes"],
    datasets: [{
      data: [0, 0],
      backgroundColor: ["#4CAF50", "#FF5252"]
    }]
  }
});

// ================== GRÁFICO RADAR CÉREBRO ==================
const ctxCerebro = document.getElementById("cerebro").getContext("2d");
let cerebro = new Chart(ctxCerebro, {
  type: 'radar',
  data: {
    labels: ["Foco", "Disciplina", "Energia", "Produtividade", "Criatividade"],
    datasets: [{
      label: "Seu Cérebro",
      data: [0, 0, 0, 0, 0],
      backgroundColor: "rgba(218, 165, 32, 0.420)", /* área preenchida */
      borderColor: "goldenrod", /* borda da linha */
      pointBackgroundColor: "goldenrod", /* pontos */
      pointBorderColor: "#fff"
    }]
  },
  options: {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: { stepSize: 20 }
      }
    }
  }
});

// ================== PONTUAÇÃO / NÍVEL ==================
function atualizarPontuacao(concluidas) {
  pontos = concluidas * 10;
  nivel = Math.floor(pontos / 50) + 1;
  document.getElementById("pontuacao").textContent = "Pontuação: " + pontos;
  document.getElementById("nivel").textContent = "Nível: " + nivel;
}

// ================== ANIMAÇÃO CÉREBRO ==================
function animarCerebro(targetData) {
  const currentData = cerebro.data.datasets[0].data.slice();
  const frames = 30;
  let count = 0;

  const anim = setInterval(() => {
    count++;
    cerebro.data.datasets[0].data = currentData.map((v, i) => {
      return v + ((targetData[i] - v) * (count / frames));
    });
    cerebro.update();

    if (count >= frames) clearInterval(anim);
  }, 30);
}

function atualizarCerebroAnimado() {
  let concluidas = tarefas.filter(t => t.concluida).length;
  let targetData = [
    Math.min(100, concluidas * 20),
    Math.min(100, concluidas * 20 * 0.9),
    Math.min(100, concluidas * 20 * 0.8),
    Math.min(100, concluidas * 20 * 0.7),
    Math.min(100, concluidas * 20 * 0.6)
  ];
  animarCerebro(targetData);
}

// ================== HISTÓRICO DIÁRIO ==================
function salvarHistorico() {
  const hoje = new Date().toISOString().split('T')[0];
  let historico = JSON.parse(localStorage.getItem("historico")) || {};

  let concluidasHoje = tarefas.filter(t => t.concluida).map(t => t.texto);

  historico[hoje] = {
    quantidade: concluidasHoje.length,
    tarefas: concluidasHoje
  };

  localStorage.setItem("historico", JSON.stringify(historico));
  atualizarHistorico();
}

// ================== HISTÓRICO DIÁRIO EM CALENDÁRIO ==================
function atualizarHistorico() {
  const container = document.getElementById("historico-container");
  container.innerHTML = "";

  let historico = JSON.parse(localStorage.getItem("historico")) || {};

  // Pegar o mês atual
  let hoje = new Date();
  let ano = hoje.getFullYear();
  let mes = hoje.getMonth();

  // Quantos dias tem esse mês
  let primeiroDia = new Date(ano, mes, 1);
  let ultimoDia = new Date(ano, mes + 1, 0);
  let totalDias = ultimoDia.getDate();

  // Criar tabela de calendário
  let tabela = document.createElement("table");
  tabela.classList.add("calendario");

  // Cabeçalho com dias da semana
  let cabecalho = document.createElement("tr");
  ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].forEach(dia => {
    let th = document.createElement("th");
    th.textContent = dia;
    cabecalho.appendChild(th);
  });
  tabela.appendChild(cabecalho);

  // Preencher calendário
  let linha = document.createElement("tr");
  // Espaços antes do 1º dia
  for (let i = 0; i < primeiroDia.getDay(); i++) {
    linha.appendChild(document.createElement("td"));
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    let td = document.createElement("td");
    let dataStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    
    let info = historico[dataStr] || { quantidade: 0, tarefas: [] };
    td.textContent = dia;

    // Cor de fundo conforme tarefas concluídas
    if (info.quantidade > 0) {
      td.style.backgroundColor = `rgba(76, 175, 80, ${Math.min(info.quantidade / 5, 1)})`;
      td.style.color = "white";
      td.style.fontWeight = "bold";
      td.style.cursor = "pointer";

      td.addEventListener("click", () => mostrarDetalhesDia(dataStr, info));
    }

    linha.appendChild(td);

    // Nova linha a cada sábado
    if ((primeiroDia.getDay() + dia) % 7 === 0) {
      tabela.appendChild(linha);
      linha = document.createElement("tr");
    }
  }

  // Preencher células vazias no final
  if (linha.children.length > 0) {
    while (linha.children.length < 7) {
      linha.appendChild(document.createElement("td"));
    }
    tabela.appendChild(linha);
  }

  // Título do mês
  let titulo = document.createElement("h3");
  titulo.textContent = hoje.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  container.appendChild(titulo);
  container.appendChild(tabela);
}


// ================== MODAL DETALHES DO DIA ==================
function mostrarDetalhesDia(data, info) {
  let modal = document.createElement("div");
  modal.classList.add("modal");

  let conteudo = `
    <div class="modal-content">
      <span class="fechar">&times;</span>
      <h3>Dia ${data}</h3>
      <p><b>${info.quantidade}</b> tarefas concluídas:</p>
      <ul>
        ${info.tarefas.map(t => `<li>${t}</li>`).join("")}
      </ul>
    </div>
  `;
  modal.innerHTML = conteudo;

  document.body.appendChild(modal);

  // Fechar modal
  modal.querySelector(".fechar").onclick = () => modal.remove();
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
}


// ================== FUNÇÃO ATUALIZAR GRÁFICOS ==================
function atualizarGrafico() {
  let concluidas = tarefas.filter(t => t.concluida).length;
  let pendentes = tarefas.length - concluidas;

  // Gráfico pizza
  grafico.data.datasets[0].data = [concluidas, pendentes];
  grafico.update();

  // Barra de progresso
  let percentual = tarefas.length > 0 ? Math.round((concluidas / tarefas.length) * 100) : 0;
  let barra = document.getElementById("progresso-barra");
  let texto = document.getElementById("progresso-texto");
  barra.style.width = percentual + "%";
  texto.textContent = percentual + "% concluído";

  // Cor dinâmica barra
  if (percentual < 30) barra.style.background = "linear-gradient(90deg, #e53935, #ef5350)";
  else if (percentual < 70) barra.style.background = "linear-gradient(90deg, #fbc02d, #fdd835)";
  else barra.style.background = "linear-gradient(90deg, #43a047, #66bb6a)";

  // Pontuação e nível
  atualizarPontuacao(concluidas);

  // Cérebro animado
  atualizarCerebroAnimado();

  // Histórico diário
  salvarHistorico();
}

// ================== INICIALIZAÇÃO ==================
renderizar();
atualizarGrafico();
