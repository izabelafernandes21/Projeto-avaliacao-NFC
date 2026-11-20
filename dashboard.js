let chart = null;

const totalElement = document.getElementById("total");
const mediaElement = document.getElementById("media");
const positivasElement = document.getElementById("positivas");

const commentsList = document.getElementById("comments-list");
const errorElement = document.getElementById("dashboard-error");
const refreshButton = document.getElementById("refresh-button");

async function carregarDashboard() {
  refreshButton.disabled = true;
  refreshButton.textContent = "Atualizando...";

  errorElement.classList.add("hidden");

  try {
    const response = await fetch("/api/estatisticas", {
      credentials: "same-origin",
      cache: "no-store"
    });

    if (response.status === 401) {
      window.location.href = "/login";
      return;
    }

    if (!response.ok) {
      throw new Error("Erro ao carregar estatísticas.");
    }

    const data = await response.json();

    atualizarIndicadores(data);
    atualizarGrafico(data.distribuicao);
    atualizarComentarios(data.recentes);

  } catch (error) {
    errorElement.textContent = error.message;
    errorElement.classList.remove("hidden");

  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = "Atualizar dados";
  }
}


function atualizarIndicadores(data) {
  totalElement.textContent = data.total;

  mediaElement.textContent = Number(data.media)
    .toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    });

  const positivas =
    Number(data.distribuicao["4"] || 0) +
    Number(data.distribuicao["5"] || 0);

  const percentual = data.total > 0
    ? (positivas / data.total) * 100
    : 0;

  positivasElement.textContent =
    percentual.toFixed(1).replace(".", ",") + "%";
}


function atualizarGrafico(distribuicao) {
  const valores = [1, 2, 3, 4, 5].map(
    nota => Number(distribuicao[String(nota)] || 0)
  );

  if (typeof Chart === "undefined") {
    throw new Error(
      "A biblioteca do gráfico não foi carregada."
    );
  }

  if (chart) {
    chart.destroy();
  }

  const canvas = document.getElementById("rating-chart");

  chart = new Chart(canvas, {
    type: "bar",

    data: {
      labels: [
        "1 estrela",
        "2 estrelas",
        "3 estrelas",
        "4 estrelas",
        "5 estrelas"
      ],

      datasets: [{
        label: "Quantidade de avaliações",
        data: valores,
        backgroundColor: "#2563eb",
        borderRadius: 7
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      },

      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}


function atualizarComentarios(avaliacoes) {
  commentsList.replaceChildren();

  if (avaliacoes.length === 0) {
    const mensagem = document.createElement("p");
    mensagem.textContent = "Nenhuma avaliação recebida.";
    commentsList.appendChild(mensagem);
    return;
  }

  avaliacoes.forEach(avaliacao => {
    const item = document.createElement("article");
    item.className = "comment-item";

    const stars = document.createElement("div");
    stars.className = "comment-stars";

    stars.textContent =
      "★".repeat(avaliacao.nota) +
      "☆".repeat(5 - avaliacao.nota);

    const texto = document.createElement("p");
    texto.className = "comment-text";

    texto.textContent =
      avaliacao.comentario ||
      "Avaliação sem comentário.";

    const data = document.createElement("p");
    data.className = "comment-date";

    data.textContent =
      "Registrado em: " +
      avaliacao.criado_em + " (UTC)";

    item.appendChild(stars);
    item.appendChild(texto);
    item.appendChild(data);

    commentsList.appendChild(item);
  });
}

refreshButton.addEventListener(
  "click",
  carregarDashboard
);

carregarDashboard();
