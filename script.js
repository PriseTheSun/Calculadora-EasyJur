let primeiraExecucaoToast = 1; // Controla a primeira execução do toast
const nomesPlanos = {
  sta: "Start",
  pre: "Premium",
  std: "Standard",
  grw: "Growth",
  gpl: "Growth Plus",
};

const planos = {
  sta: { preco: 139, usuariosInclusos: 2, horas: 15 },
  pre: { preco: 389, usuariosInclusos: 5, horas: 20 },
  std: { preco: 599, usuariosInclusos: 10, horas: 25 },
  grw: { preco: 1699, usuariosInclusos: 15, horas: 30 },
  gpl: { preco: 2799, usuariosInclusos: 30, horas: 35 },
};

const porcentagensPorFuncionalidade = {
  sta: {
    "Agenda de prazos": 40,
    "Push de andamentos": 20,
    "Publicações e Intimações Eletrônicas": 40,
  },
  pre: {
    "Agenda de prazos": 10,
    "Push de andamentos": 30,
    "Publicações e Intimações Eletrônicas": 30,
    "Controle de contratos": 30,
  },
  std: {
    "Agenda de prazos": 15,
    "Push de andamentos": 15,
    "Publicações e Intimações Eletrônicas": 15,
    "Controle de contratos": 15,
    "Workflow avançado de tarefas ágil": 40,
  },
  grw: {
    "Agenda de prazos": 10,
    "Push de andamentos": 10,
    "Publicações e Intimações Eletrônicas": 10,
    "Controle de contratos": 10,
    "Regras de cobrança automática": 30,
    "Campos personalizados": 30,
  },
  gpl: {
    "Agenda de prazos": 5,
    "Push de andamentos": 5,
    "Publicações e Intimações Eletrônicas": 5,
    "Controle de contratos": 5,
    "Regras de cobrança automática": 5,
    "Campos personalizados": 25,
    "Controladoria Jurídica + IA": 25,
    "Relatórios avançados (envio automático)": 25,
  },
};

// Função para exibir a tag correspondente ao plano selecionado
function exibirTagPlano(planoId) {
  const tags = {
    sta: "start__tag",
    pre: "premium__tag",
    std: "standard__tag",
    grw: "growth__tag",
    gpl: "growthplus__tag",
  };

  // Oculta todas as tags
  Object.values(tags).forEach((tagId) => {
    document.getElementById(tagId).style.display = "none";
  });

  // Exibe apenas a tag do plano selecionado
  document.getElementById(tags[planoId]).style.display = "block";
}

let multiplicadorExtra = 1;
let planoAtual = "sta";
let toastAtual = null;

// Função que implementa debounce para evitar execuções excessivas
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    const later = function () {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("calculator-form");
  const inputs = form.querySelectorAll("input, button");
  const resultado = {
    horasTrabalhadas: document.getElementById("hours_worked"),
    valorCobrado: document.getElementById("billed_hour"),
    receitaMensal: document.getElementById("easyjur__revenue_value"),
    receitaAnual: document.getElementById("easyjur__annual_revenue"),
    horasEconomizadas: document.getElementById("easyjur__hours_saved"),
    custoMensal: document.getElementById("easyjur__cost"),
    roi: document.getElementById("easyjur__return"),
  };

  iniciarPlanoInicial();

  const atualizarCalculosDebounced = debounce(atualizarCalculos, 300);

  inputs.forEach((input) =>
    input.addEventListener("input", atualizarCalculosDebounced)
  );

  // Adiciona eventos aos botões de seleção de plano
  document.querySelectorAll(".easyjur-btn-plan").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".easyjur-btn-plan")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      planoAtual = btn.id;
      atualizarCalculos();
      exibirListaPlano(planoAtual);
      exibirTagPlano(planoAtual); // Adiciona a exibição da tag
    });
  });

  // Validação do input de número de pessoas
  document.getElementById("number_of_peoples").addEventListener("input", () => {
    let numeroPessoas = parseInt(
      document.getElementById("number_of_peoples").value,
      10
    );
    if (numeroPessoas < 1)
      document.getElementById("number_of_peoples").value = 1;
    atualizarCalculosDebounced();
  });
  // Inicializa com valores padrão do plano Start
  function iniciarPlanoInicial() {
    document.getElementById("number_of_peoples").value = 1;
    document.getElementById("easyjur__hours_worked").value = 4.0;
    document.getElementById("easyjur__billed_hour").value = 30;
    document.getElementById("sta").classList.add("active");
    atualizarCalculos();
    exibirListaPlano("sta");
    exibirTagPlano("sta"); // Exibe a tag do plano inicial
  }

  // Atualiza todos os cálculos com base nos inputs
  function atualizarCalculos() {
    const numeroPessoas =
      Math.max(
        1,
        parseInt(document.getElementById("number_of_peoples").value, 10)
      ) || 1;
    const horasTrabalhadas = parseFloat(
      document.getElementById("easyjur__hours_worked").value
    );
    const valorCobradoPorHora = parseFloat(
      document.getElementById("easyjur__billed_hour").value
    );

    const horasEconomizadas = numeroPessoas * planos[planoAtual].horas;
    const valorHorasTrabalhadas = horasTrabalhadas * valorCobradoPorHora || 0;

    const receitaMensal =
      horasEconomizadas * valorCobradoPorHora + valorHorasTrabalhadas;
    const custoMensal = calcularCusto(numeroPessoas, planoAtual);
    const roi = calcularROI(receitaMensal, custoMensal);

    // Cálculo do retorno líquido anual
    const receitaAnual = receitaMensal * 12;
    const custoAnual = custoMensal * 12;
    const retornoLiquidoAnual = Math.max(0, receitaAnual - custoAnual); // Garante que não seja negativo

    // Atualizando os elementos existentes
    resultado.horasTrabalhadas.textContent = `${horasTrabalhadas} Horas`;
    resultado.valorCobrado.textContent = `${valorCobradoPorHora} R$`;
    resultado.receitaMensal.textContent = receitaMensal.toLocaleString(
      "pt-BR",
      { style: "currency", currency: "BRL" }
    );
    resultado.receitaAnual.textContent = receitaAnual.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    resultado.horasEconomizadas.textContent = `${horasEconomizadas} Horas`;
    resultado.custoMensal.innerHTML = `<span class="multiplicador-extra">${multiplicadorExtra}x ${
      nomesPlanos[planoAtual]
    }</span> R$ ${custoMensal.toLocaleString("pt-BR", {
      maximumFractionDigits: 0,
    })}`;
    resultado.roi.textContent = `${Math.round(roi)}x`;

    // Atualizando o retorno líquido anual, sem valores negativos
    document.getElementById("value-liquid-return").textContent =
      retornoLiquidoAnual.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

    atualizarHorasPorFuncionalidade(horasEconomizadas);
    recomendarPlano(numeroPessoas, horasTrabalhadas, valorCobradoPorHora);
  }
  // Calcula o custo mensal baseado no número de usuários
  function calcularCusto(totalUsuarios, plano) {
    multiplicadorExtra = 1;
    const { preco, usuariosInclusos } = planos[plano];
    if (totalUsuarios <= usuariosInclusos) return Math.round(preco);
    multiplicadorExtra = Math.ceil(totalUsuarios / usuariosInclusos);
    return multiplicadorExtra * preco;
  }

  // Calcula o Retorno sobre Investimento (ROI)
  function calcularROI(receita, custo) {
    return custo === 0 ? 0 : Math.max(0, (receita - custo) / custo);
  }

  // Atualiza a aparência do slider
  function atualizarSlider(slider, output) {
    output.textContent =
      slider.id === "easyjur__hours_worked"
        ? `${slider.value} Horas`
        : `${slider.value} R$`;
    const percentage =
      ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(to right, #e5293f45 ${percentage}%, #ddd ${percentage}%)`;
  }

  // Exibe a lista de funcionalidades do plano selecionado
  function exibirListaPlano(planoId) {
    const listas = ["start", "premium", "standard", "growth", "growthplus"];
    listas.forEach((lista) => {
      const elemento = document.getElementById(`easyjur__ul__${lista}`);
      elemento.style.display =
        lista ===
        planoId
          .replace("sta", "start")
          .replace("pre", "premium")
          .replace("std", "standard")
          .replace("grw", "growth")
          .replace("gpl", "growthplus")
          ? "block"
          : "none";
    });
  }

  // Distribui horas economizadas entre funcionalidades
  function atualizarHorasPorFuncionalidade(horasEconomizadas) {
    const porcentagens = porcentagensPorFuncionalidade[planoAtual];
    const listaId = planoAtual
      .replace("sta", "start")
      .replace("pre", "premium")
      .replace("std", "standard")
      .replace("grw", "growth")
      .replace("gpl", "growthplus");
    const spans = document.querySelectorAll(
      `#easyjur__ul__${listaId} .hours-per-feature`
    );

    let horasRestantes = horasEconomizadas;
    let somaHorasCalculadas = 0;

    spans.forEach((span, index) => {
      const funcionalidade = span.previousElementSibling.textContent
        .replace(":", "")
        .trim();
      const porcentagem = porcentagens[funcionalidade] / 100;
      let horas = Math.round(horasEconomizadas * porcentagem);

      if (index === spans.length - 1) {
        horas = horasRestantes - somaHorasCalculadas;
      } else {
        somaHorasCalculadas += horas;
      }

      span.textContent = `${horas} Horas`;
    });
  }

  // Recomenda o melhor plano com base no ROI
  function recomendarPlano(
    numeroPessoas,
    horasTrabalhadas,
    valorCobradoPorHora
  ) {
    const rois = {};
    Object.keys(planos).forEach((planoId) => {
      const horasEconomizadas = numeroPessoas * planos[planoId].horas;
      const receitaMensal =
        horasEconomizadas * valorCobradoPorHora +
        horasTrabalhadas * valorCobradoPorHora;
      const custoMensal = calcularCusto(numeroPessoas, planoId);
      const roi = calcularROI(receitaMensal, custoMensal);
      rois[planoId] = roi;
    });

    const planoRecomendadoId = Object.keys(rois).reduce((a, b) =>
      rois[a] > rois[b] ? a : b
    );
    const roiRecomendado = Math.round(rois[planoRecomendadoId]);

    document
      .querySelectorAll(".easyjur-btn-plan")
      .forEach((btn) => btn.classList.remove("recommended-roi"));
    document
      .getElementById(planoRecomendadoId)
      .classList.add("recommended-roi");

    if (toastAtual) {
      toastAtual.hideToast();
    }
    if (primeiraExecucaoToast <= 1) {
      primeiraExecucaoToast += 1;
      return;
    }

    toastAtual = Toastify({
      text: `
                <strong>Plano Recomendado: ${nomesPlanos[planoRecomendadoId]}</strong><br>
                <small>Maximiza seu retorno em ${roiRecomendado}X com ${numeroPessoas} pessoa(s).</small>
            `,
      duration: 15000,
      close: false,
      gravity: "bottom",
      position: "left",
      className: "easyjur-toast",
      stopOnFocus: true,
      escapeMarkup: false,
      onClick: function () {
        toastAtual.hideToast();
      },
    });
    toastAtual.showToast();
  }
  // Configuração dos sliders
  const sliderHorasTrabalhadas = document.getElementById(
    "easyjur__hours_worked"
  );
  const sliderValorHora = document.getElementById("easyjur__billed_hour");
  const outputHorasTrabalhadas = document.getElementById("hours_worked");
  const outputValorHora = document.getElementById("billed_hour");

  sliderHorasTrabalhadas.oninput = () =>
    atualizarSlider(sliderHorasTrabalhadas, outputHorasTrabalhadas);
  sliderValorHora.oninput = () =>
    atualizarSlider(sliderValorHora, outputValorHora);

  atualizarSlider(sliderHorasTrabalhadas, outputHorasTrabalhadas);
  atualizarSlider(sliderValorHora, outputValorHora);
});

// Configuração do modal de impressão
document
  .getElementById("easyjur__print")
  .addEventListener("click", function () {
    const numPessoas = document.getElementById("number_of_peoples").value;
    const horasTrabalhadas = document.getElementById(
      "easyjur__hours_worked"
    ).value;
    const valorHora = document.getElementById("easyjur__billed_hour").value;
    const planoSelecionado =
      document.querySelector(".easyjur-btn-plan.active")?.textContent ||
      "Nenhum";
    const receitaAnual = document.getElementById(
      "easyjur__annual_revenue"
    ).textContent;
    const receitaMensal = document.getElementById(
      "easyjur__revenue_value"
    ).textContent;
    const horasEconomizadas = document.getElementById(
      "easyjur__hours_saved"
    ).textContent;
    const custoMensal = document.getElementById("easyjur__cost").textContent;
    const retornoInvestimento =
      document.getElementById("easyjur__return").textContent;
    // Capturando o retorno líquido anual
    const retornoLiquidoAnual = document.getElementById(
      "value-liquid-return"
    ).textContent;

    // Obter as funcionalidades e horas economizadas do plano atual
    const listaId = planoAtual
      .replace("sta", "start")
      .replace("pre", "premium")
      .replace("std", "standard")
      .replace("grw", "growth")
      .replace("gpl", "growthplus");
    const funcionalidades = document.querySelectorAll(
      `#easyjur__ul__${listaId} li:not(.easyjur__li__plan_name)`
    );
    let funcionalidadesHTML = "";
    funcionalidades.forEach((li) => {
      const funcionalidade = li
        .querySelector(".easyjur__span__func")
        .textContent.replace(":", "")
        .trim();
      const horas = li.querySelector(".hours-per-feature").textContent;
      funcionalidadesHTML += `<tr><td><strong>${funcionalidade}:</strong></td><td>${horas}</td></tr>`;
    });

    // Construir o conteúdo do modal com as funcionalidades e o retorno líquido anual
    document.getElementById("easyjur__modal_body").innerHTML = `
        <table>
            <thead class="easyjur-table-head--to-print">
                <tr>
                    <th>Descrição</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                <tr><td><strong>Número de Pessoas no Escritório:</strong></td><td>${numPessoas}</td></tr>
                <tr><td><strong>Horas Trabalhadas por Dia:</strong></td><td>${horasTrabalhadas} Horas</td></tr>
                <tr><td><strong>Valor Cobrado por Hora:</strong></td><td>R$ ${valorHora},00</td></tr>
                <tr><td><strong>Plano Selecionado:</strong></td><td>${planoSelecionado}</td></tr>
                <tr><td><strong>Estimativa de Receita Anual:</strong></td><td>${receitaAnual}</td></tr>
                <tr><td><strong>Estimativa de Receita Mensal:</strong></td><td>${receitaMensal}</td></tr>
                <tr><td><strong>Horas Mensais Economizadas:</strong></td><td>${horasEconomizadas}</td></tr>
                ${funcionalidadesHTML}
                <tr><td><strong>Custo Mensal do EasyJur:</strong></td><td>${custoMensal}</td></tr>
                <tr><td><strong>Retorno sobre o Investimento:</strong></td><td>${retornoInvestimento}</td></tr>
                <tr><td><strong>Estimativa de receita liquida anual:</strong></td><td>${retornoLiquidoAnual}</td></tr>
            </tbody>
        </table>
    `;

    // Exibir o modal
    document.getElementById("easyjur__modal").style.display = "flex";

    // Fechar o modal ao clicar no "X"
    document
      .querySelector(".easyjur-modal-close")
      .addEventListener("click", function () {
        document.getElementById("easyjur__modal").style.display = "none";
      });

    // Fechar o modal ao clicar fora dele
    window.addEventListener("click", function (event) {
      if (event.target === document.getElementById("easyjur__modal")) {
        document.getElementById("easyjur__modal").style.display = "none";
      }
    });

    // Imprimir e fechar o modal após a impressão
    document
      .getElementById("easyjur__modal_print")
      .addEventListener("click", function () {
        window.print();
        window.addEventListener(
          "afterprint",
          function () {
            document.getElementById("easyjur__modal").style.display = "none";
          },
          { once: true }
        );
      });
  });
