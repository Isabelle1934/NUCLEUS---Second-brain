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
      backgroundColor: "rgba(63, 81, 181, 0.3)",
      borderColor: "#3f51b5",
      pointBackgroundColor: "#3f51b5",
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
  let concluidasHoje = tarefas.filter(t => t.concluida).length;
  historico[hoje] = concluidasHoje;
  localStorage.setItem("historico", JSON.stringify(historico));
  atualizarHistorico();
}

function atualizarHistorico() {
  const container = document.getElementById("historico-container");
  container.innerHTML = "";

  let historico = JSON.parse(localStorage.getItem("historico")) || {};
  Object.keys(historico).sort().forEach(data => {
    const div = document.createElement("div");
    div.classList.add("dia");

    let val = historico[data];
    div.style.backgroundColor = val === 0 ? "#eee" : `rgba(76, 175, 80, ${Math.min(val / 5, 1)})`;

    div.title = `${data}: ${val} tarefas concluídas`;
    container.appendChild(div);
  });
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
