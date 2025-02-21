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

  // Porcentagens de economia por funcionalidade para cada plano (somam 100%)
  const porcentagensPorFuncionalidade = {
    sta: {
      "Gestão de Processos": 40,    // 40%
      "Controle de Tarefas": 30,    // 30%
      "Relatórios Básicos": 30,     // 30%
    },
    pre: {
      "Gestão de Processos": 30,    // 30%
      "Controle de Tarefas": 25,    // 25%
      "Relatórios Avançados": 20,   // 20%
      "Automação de Documentos": 25,// 25%
    },
    std: {
      "Gestão de Processos": 25,    // 25%
      "Controle de Tarefas": 20,    // 20%
      "Relatórios Avançados": 20,   // 20%
      "Automação de Documentos": 20,// 20%
      "Integração com APIs": 15,    // 15%
    },
    grw: {
      "Gestão de Processos": 20,    // 20%
      "Controle de Tarefas": 15,    // 15%
      "Relatórios Avançados": 15,   // 15%
      "Automação de Documentos": 20,// 20%
      "Integração com APIs": 15,    // 15%
      "Suporte Prioritário": 15,    // 15%
    },
    gpl: {
      "Gestão de Processos": 20,    // 20%
      "Controle de Tarefas": 15,    // 15%
      "Relatórios Avançados": 15,   // 15%
      "Automação de Documentos": 15,// 15%
      "Integração com APIs": 15,    // 15%
      "Suporte Prioritário": 10,    // 10%
      "Treinamento Personalizado": 10,// 10%
    },
  };

  let multipladorExtra = 1;
  let planoAtual = "sta";

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

    // Inicializa os valores e destaca o plano "Start"
    iniciarPlanoStart();

    // Adiciona listeners
    inputs.forEach((input) => input.addEventListener("input", atualizarCalculos));

    document.querySelectorAll(".easyjur-btn-plan").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".easyjur-btn-plan").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        planoAtual = btn.id;
        atualizarCalculos();
        mostrarListaPlano(planoAtual);
      });
    });

    document.getElementById("number_of_peoples").addEventListener("input", () => {
      let numeroPessoas = parseInt(document.getElementById("number_of_peoples").value, 10);
      if (numeroPessoas < 1) document.getElementById("number_of_peoples").value = 1;
      atualizarCalculos();
    });

    // Funções
    function iniciarPlanoStart() {
      document.getElementById("number_of_peoples").value = 1;
      document.getElementById("easyjur__hours_worked").value = 4.0;
      document.getElementById("easyjur__billed_hour").value = 30;
      document.getElementById("sta").classList.add("active");
      atualizarCalculos();
      mostrarListaPlano("sta");
    }

    function atualizarCalculos() {
      const numeroPessoas = Math.max(1, parseInt(document.getElementById("number_of_peoples").value, 10)) || 1;
      const horasTrabalhadas = parseFloat(document.getElementById("easyjur__hours_worked").value);
      const valorCobradoPorHora = parseFloat(document.getElementById("easyjur__billed_hour").value);

      const horasEconomizadas = numeroPessoas * planos[planoAtual].horas;
      const valorHorasTrabalhadas = horasTrabalhadas * valorCobradoPorHora || 0;

      const receitaMensal = horasEconomizadas * valorCobradoPorHora + valorHorasTrabalhadas;
      const custoMensal = calcularCusto(numeroPessoas, planoAtual);
      const roi = calcularROI(receitaMensal, custoMensal);

      resultado.horasTrabalhadas.textContent = `${horasTrabalhadas} Horas`;
      resultado.valorCobrado.textContent = `${valorCobradoPorHora} R$`;
      resultado.receitaMensal.textContent = receitaMensal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      resultado.receitaAnual.textContent = (receitaMensal * 12).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      resultado.horasEconomizadas.textContent = `${horasEconomizadas} Horas`;
      resultado.custoMensal.innerHTML = `<span class="multiplicador-extra">${multipladorExtra}x ${nomesPlanos[planoAtual]}</span> R$ ${custoMensal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
      resultado.roi.textContent = `${Math.round(roi)}x`;

      atualizarHorasPorFuncionalidade(horasEconomizadas);
    }

    function calcularCusto(totalUsuarios, plano) {
      multipladorExtra = 1;
      const { preco, usuariosInclusos } = planos[plano];
      if (totalUsuarios <= usuariosInclusos) return Math.round(preco);
      multipladorExtra = Math.ceil(totalUsuarios / usuariosInclusos);
      return multipladorExtra * preco;
    }

    function calcularROI(receita, custo) {
      return custo === 0 ? 0 : Math.max(0, (receita - custo) / custo);
    }

    function updateSlider(slider, output) {
      output.textContent = slider.id === "easyjur__hours_worked" ? `${slider.value} Horas` : `${slider.value} R$`;
      const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
      slider.style.background = `linear-gradient(to right, #e5293f45 ${percentage}%, #ddd ${percentage}%)`;
    }

    function mostrarListaPlano(planoId) {
      const listas = ["start", "premium", "standard", "growth", "growthplus"];
      listas.forEach((lista) => {
        const elemento = document.getElementById(`easyjur__ul__${lista}`);
        elemento.style.display = lista === planoId.replace("sta", "start").replace("pre", "premium").replace("std", "standard").replace("grw", "growth").replace("gpl", "growthplus") ? "block" : "none";
      });
    }

    function atualizarHorasPorFuncionalidade(horasEconomizadas) {
      const porcentagens = porcentagensPorFuncionalidade[planoAtual];
      const listaId = planoAtual.replace("sta", "start").replace("pre", "premium").replace("std", "standard").replace("grw", "growth").replace("gpl", "growthplus");
      const spans = document.querySelectorAll(`#easyjur__ul__${listaId} .hours-per-feature`);

      let horasRestantes = horasEconomizadas;
      let somaHorasCalculadas = 0;

      spans.forEach((span, index) => {
        const funcionalidade = span.previousElementSibling.textContent.replace(":", "").trim();
        const porcentagem = porcentagens[funcionalidade] / 100;
        let horas = Math.round(horasEconomizadas * porcentagem);

        // Se for a última funcionalidade, ajusta para garantir que a soma seja igual às horas totais
        if (index === spans.length - 1) {
          horas = horasRestantes - somaHorasCalculadas;
        } else {
          somaHorasCalculadas += horas;
        }

        span.textContent = `${horas} Horas`;
      });
    }

    // Sliders
    const hourWorkedSlider = document.getElementById("easyjur__hours_worked");
    const billedHourSlider = document.getElementById("easyjur__billed_hour");
    const hourWorkedOutput = document.getElementById("hours_worked");
    const billedHourOutput = document.getElementById("billed_hour");

    hourWorkedSlider.oninput = () => updateSlider(hourWorkedSlider, hourWorkedOutput);
    billedHourSlider.oninput = () => updateSlider(billedHourSlider, billedHourOutput);

    updateSlider(hourWorkedSlider, hourWorkedOutput);
    updateSlider(billedHourSlider, billedHourOutput);
  });

  // Modal
  document.getElementById("easyjur__print").addEventListener("click", function () {
    const numPessoas = document.getElementById("number_of_peoples").value;
    const horasTrabalhadas = document.getElementById("easyjur__hours_worked").value;
    const valorHora = document.getElementById("easyjur__billed_hour").value;
    const planoSelecionado = document.querySelector(".easyjur-btn-plan.active")?.textContent || "Nenhum";
    const receitaAnual = document.getElementById("easyjur__annual_revenue").textContent;
    const receitaMensal = document.getElementById("easyjur__revenue_value").textContent;
    const horasEconomizadas = document.getElementById("easyjur__hours_saved").textContent;
    const custoMensal = document.getElementById("easyjur__cost").textContent;
    const retornoInvestimento = document.getElementById("easyjur__return").textContent;

    document.getElementById("easyjur__modal_body").innerHTML = `
      <table>
        <thead>
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
          <tr><td><strong>Custo Mensal do EasyJur:</strong></td><td>${custoMensal}</td></tr>
          <tr><td><strong>Retorno sobre o Investimento:</strong></td><td>${retornoInvestimento}</td></tr>
        </tbody>
      </table>
    `;

    document.getElementById("easyjur__modal").style.display = "flex";

    document.querySelector(".easyjur-modal-close").addEventListener("click", function () {
      document.getElementById("easyjur__modal").style.display = "none";
    });

    window.addEventListener("click", function (event) {
      if (event.target === document.getElementById("easyjur__modal")) {
        document.getElementById("easyjur__modal").style.display = "none";
      }
    });

    document.getElementById("easyjur__modal_print").addEventListener("click", function () {
      window.print();
      window.addEventListener("afterprint", function () {
        document.getElementById("easyjur__modal").style.display = "none";
      }, { once: true });
    });
  });