const app = document.getElementById("app");

const TIPO_LABELS = { SP: "SP", A: "SPA", D: "SPD", I: "SPI", M: "Marginal" };
const TIPO_ORDER = ["SP", "A", "D", "I", "M"];

const state = {
  step: "welcome",
  history: [],
  vulto: null,
  locationStatus: "idle", // idle | requesting | ok | denied | unsupported | insecure
  latitude: null,
  longitude: null,
  batalhao: null,
  companhia: null,
  pelotao: null,
  tipo: null, // 'SP' | 'A' | 'D' | 'I' | 'M' (código bruto da malha)
  rodovia: null,
  km: "",
  metros: "",
};

function resetState() {
  Object.assign(state, {
    step: "welcome",
    history: [],
    vulto: null,
    locationStatus: "idle",
    latitude: null,
    longitude: null,
    batalhao: null,
    companhia: null,
    pelotao: null,
    tipo: null,
    rodovia: null,
    km: "",
    metros: "",
  });
  render();
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
}

function getBatalhoes() {
  return uniqueSorted(RODOVIAS_DATA.map((r) => r[0]));
}
function getCompanhias(batalhao) {
  return uniqueSorted(RODOVIAS_DATA.filter((r) => r[0] === batalhao).map((r) => r[1]));
}
function getPelotoes(batalhao, companhia) {
  return uniqueSorted(
    RODOVIAS_DATA.filter((r) => r[0] === batalhao && r[1] === companhia).map((r) => r[2])
  );
}
function getTiposFor(batalhao, companhia, pelotao) {
  const present = new Set(
    RODOVIAS_DATA.filter((r) => r[0] === batalhao && r[1] === companhia && r[2] === pelotao).map(
      (r) => r[3]
    )
  );
  return TIPO_ORDER.filter((t) => present.has(t));
}
function getRodoviasFor(batalhao, companhia, pelotao, tipo) {
  return uniqueSorted(
    RODOVIAS_DATA.filter(
      (r) => r[0] === batalhao && r[1] === companhia && r[2] === pelotao && r[3] === tipo
    ).map((r) => r[4])
  );
}

function nextStepId(id) {
  switch (id) {
    case "welcome": return "q_vulto";
    case "q_vulto": return state.vulto === "sim" ? "share_location" : "welcome";
    case "share_location": return "unidade";
    case "unidade": return "local_fatos";
    case "local_fatos": return "result";
    default: return null;
  }
}

function goNext() {
  const next = nextStepId(state.step);
  if (!next) return;
  if (state.step === "q_vulto" && state.vulto === "nao") {
    resetState();
    return;
  }
  state.history.push(state.step);
  state.step = next;
  render();
}

function goBack() {
  const prev = state.history.pop();
  if (!prev) return;
  state.step = prev;
  render();
}

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function requestLocation() {
  state.locationStatus = "requesting";
  render();

  if (!("geolocation" in navigator)) {
    state.locationStatus = "unsupported";
    render();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.latitude = pos.coords.latitude;
      state.longitude = pos.coords.longitude;
      state.locationStatus = "ok";
      render();
    },
    (err) => {
      state.locationStatus = err.code === err.PERMISSION_DENIED ? "denied" : "unsupported";
      render();
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function clampKm(value) {
  let n = parseInt(value, 10);
  if (isNaN(n)) return "";
  if (n < 0) n = 0;
  if (n > 999) n = 999;
  return String(n);
}

function render() {
  const s = state.step;

  if (s === "welcome") {
    app.innerHTML = "";
    app.appendChild(el(`
      <div>
        <div class="nav-row">
          <button class="btn-primary btn-hero" id="btn-start">Iniciar nova transmissão de dados</button>
        </div>
      </div>
    `));
    document.getElementById("btn-start").addEventListener("click", goNext);
    return;
  }

  if (s === "q_vulto") {
    app.innerHTML = "";
    app.appendChild(el(`
      <div>
        <span class="step-tag">ETAPA 1</span>
        <h2>Patrulheiro, você está em uma ocorrência de vulto?</h2>
        <div class="choice-row">
          <button class="btn-sim" id="btn-sim">Sim</button>
          <button class="btn-nao" id="btn-nao">Não</button>
        </div>
      </div>
    `));
    document.getElementById("btn-sim").addEventListener("click", () => {
      state.vulto = "sim";
      goNext();
    });
    document.getElementById("btn-nao").addEventListener("click", () => {
      state.vulto = "nao";
      goNext();
    });
    return;
  }

  if (s === "share_location") {
    app.innerHTML = "";

    let statusHtml = "";
    if (state.locationStatus === "requesting") {
      statusHtml = `<p class="location-status">Solicitando localização...</p>`;
    } else if (state.locationStatus === "ok") {
      statusHtml = `<div class="info-box">Localização compartilhada: <strong>${state.latitude.toFixed(6)}, ${state.longitude.toFixed(6)}</strong></div>`;
    } else if (state.locationStatus === "denied") {
      statusHtml = `<div class="info-box error">Permissão de localização negada. Você pode tentar novamente ou continuar sem localização.</div>`;
    } else if (state.locationStatus === "unsupported") {
      statusHtml = `<div class="info-box error">Não foi possível obter a localização neste navegador/contexto (é necessário HTTPS ou servidor local). Você pode continuar sem localização.</div>`;
    }

    app.appendChild(el(`
      <div>
        <span class="step-tag">LOCALIZAÇÃO</span>
        <h2>Compartilhe sua localização</h2>
        <p class="lead">Isso ajuda o COp Rv a localizar o patrulheiro na ocorrência.</p>
        ${statusHtml}
        <div class="nav-row">
          <button class="btn-secondary" id="btn-back">Voltar</button>
          <span class="spacer"></span>
          <button class="btn-primary" id="btn-share">Compartilhar localização atual</button>
        </div>
        <div class="nav-row">
          <span class="spacer"></span>
          <button class="btn-secondary" id="btn-next">${state.locationStatus === "ok" ? "Próximo" : "Continuar sem localização"}</button>
        </div>
      </div>
    `));

    document.getElementById("btn-back").addEventListener("click", goBack);
    document.getElementById("btn-share").addEventListener("click", requestLocation);
    document.getElementById("btn-next").addEventListener("click", goNext);
    return;
  }

  if (s === "unidade") {
    app.innerHTML = "";

    const batalhoes = getBatalhoes();
    const companhias = state.batalhao ? getCompanhias(state.batalhao) : [];
    const pelotoes = state.batalhao && state.companhia ? getPelotoes(state.batalhao, state.companhia) : [];

    app.appendChild(el(`
      <div>
        <span class="step-tag">LOCAL DOS FATOS</span>
        <h2>Local dos fatos</h2>
        <div class="field">
          <label>Batalhão</label>
          <div class="choice-row" id="btl-row">
            ${batalhoes.map((b) => `<button class="btn-choice" data-v="${b}">${b}</button>`).join("")}
          </div>
        </div>
        <div class="field">
          <label>Companhia</label>
          <div class="choice-row" id="cia-row">
            ${companhias.map((c) => `<button class="btn-choice" data-v="${c}">${c}</button>`).join("")
              || `<p class="hint">Selecione o batalhão primeiro</p>`}
          </div>
        </div>
        <div class="field">
          <label>Pelotão</label>
          <div class="choice-row" id="pel-row">
            ${pelotoes.map((p) => `<button class="btn-choice" data-v="${p}">${p}</button>`).join("")
              || `<p class="hint">Selecione a companhia primeiro</p>`}
          </div>
        </div>
        <div class="nav-row">
          <button class="btn-secondary" id="btn-back">Voltar</button>
          <span class="spacer"></span>
          <button class="btn-primary" id="btn-next" disabled>Próximo</button>
        </div>
      </div>
    `));

    const btlRow = document.getElementById("btl-row");
    const ciaRow = document.getElementById("cia-row");
    const pelRow = document.getElementById("pel-row");
    const nextBtn = document.getElementById("btn-next");

    function markSelected(row, field) {
      row.querySelectorAll("[data-v]").forEach((b) => {
        b.classList.toggle("selected", b.dataset.v === state[field]);
      });
    }
    markSelected(btlRow, "batalhao");
    markSelected(ciaRow, "companhia");
    markSelected(pelRow, "pelotao");

    function validate() {
      nextBtn.disabled = !(state.batalhao && state.companhia && state.pelotao);
    }
    validate();

    btlRow.querySelectorAll("[data-v]").forEach((b) =>
      b.addEventListener("click", () => {
        if (state.batalhao === b.dataset.v) return;
        state.batalhao = b.dataset.v;
        state.companhia = null;
        state.pelotao = null;
        render();
      })
    );
    ciaRow.querySelectorAll("[data-v]").forEach((b) =>
      b.addEventListener("click", () => {
        if (state.companhia === b.dataset.v) return;
        state.companhia = b.dataset.v;
        state.pelotao = null;
        render();
      })
    );
    pelRow.querySelectorAll("[data-v]").forEach((b) =>
      b.addEventListener("click", () => {
        state.pelotao = b.dataset.v;
        markSelected(pelRow, "pelotao");
        validate();
      })
    );

    document.getElementById("btn-back").addEventListener("click", goBack);
    nextBtn.addEventListener("click", goNext);
    return;
  }

  if (s === "local_fatos") {
    app.innerHTML = "";

    const tipos = getTiposFor(state.batalhao, state.companhia, state.pelotao);
    const rodovias = state.tipo
      ? getRodoviasFor(state.batalhao, state.companhia, state.pelotao, state.tipo)
      : [];

    app.appendChild(el(`
      <div>
        <span class="step-tag">LOCAL DOS FATOS</span>
        <h2>Rodovia</h2>
        <div class="field">
          <label>Tipo</label>
          <div class="choice-row" id="tipo-row">
            ${tipos.map((t) => `<button class="btn-choice" data-v="${t}">${TIPO_LABELS[t]}</button>`).join("")}
          </div>
          <p class="hint">Formatação das rodovias: SP: 3 números — SPA, SPI e SPD: 3 números/3 números</p>
        </div>
        <div class="field">
          <label>Rodovia</label>
          <input
            type="text"
            id="rodovia-search"
            autocomplete="off"
            placeholder="${state.tipo ? "Buscar rodovia..." : "Selecione o tipo primeiro"}"
            ${state.tipo ? "" : "disabled"}
          />
          <div class="choice-row rodovia-list" id="rodovia-row">
            ${rodovias.map((r) => `<button class="btn-choice" data-v="${r}">${r}</button>`).join("")}
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Quilômetros</label>
            <input type="number" id="input-km" min="0" max="999" step="1" value="${state.km}" placeholder="000" />
            <p class="hint">(3 números inteiros)</p>
          </div>
          <div class="field">
            <label>Metros</label>
            <input type="number" id="input-metros" min="0" max="999" step="1" value="${state.metros}" placeholder="000" />
            <p class="hint">(3 números inteiros)</p>
          </div>
        </div>
        <div class="nav-row">
          <button class="btn-secondary" id="btn-back">Voltar</button>
          <span class="spacer"></span>
          <button class="btn-primary" id="btn-next" disabled>Concluir</button>
        </div>
      </div>
    `));

    const kmInput = document.getElementById("input-km");
    const metrosInput = document.getElementById("input-metros");
    const nextBtn = document.getElementById("btn-next");
    const tipoRow = document.getElementById("tipo-row");
    const rodoviaRow = document.getElementById("rodovia-row");
    const rodoviaSearch = document.getElementById("rodovia-search");

    function markSelectedTipo() {
      tipoRow.querySelectorAll("[data-v]").forEach((b) => {
        b.classList.toggle("selected", b.dataset.v === state.tipo);
      });
    }
    function markSelectedRodovia() {
      rodoviaRow.querySelectorAll("[data-v]").forEach((b) => {
        b.classList.toggle("selected", b.dataset.v === state.rodovia);
      });
    }
    markSelectedTipo();
    markSelectedRodovia();

    function validate() {
      nextBtn.disabled = !(
        state.tipo &&
        state.rodovia &&
        kmInput.value.trim() !== "" &&
        metrosInput.value.trim() !== ""
      );
    }
    validate();

    tipoRow.querySelectorAll("[data-v]").forEach((b) =>
      b.addEventListener("click", () => {
        if (state.tipo === b.dataset.v) return;
        state.tipo = b.dataset.v;
        state.rodovia = null;
        render();
      })
    );

    rodoviaRow.querySelectorAll("[data-v]").forEach((b) =>
      b.addEventListener("click", () => {
        state.rodovia = b.dataset.v;
        markSelectedRodovia();
        validate();
      })
    );

    if (rodoviaSearch) {
      rodoviaSearch.addEventListener("input", () => {
        const q = rodoviaSearch.value.trim().toLowerCase();
        rodoviaRow.querySelectorAll("[data-v]").forEach((b) => {
          b.classList.toggle("hidden", q !== "" && !b.dataset.v.toLowerCase().includes(q));
        });
      });
    }

    kmInput.addEventListener("input", () => { validate(); });
    kmInput.addEventListener("blur", () => { kmInput.value = clampKm(kmInput.value); validate(); });
    metrosInput.addEventListener("input", () => { validate(); });
    metrosInput.addEventListener("blur", () => { metrosInput.value = clampKm(metrosInput.value); validate(); });

    document.getElementById("btn-back").addEventListener("click", goBack);
    nextBtn.addEventListener("click", () => {
      state.km = clampKm(kmInput.value);
      state.metros = clampKm(metrosInput.value);
      goNext();
    });
    return;
  }

  if (s === "result") {
    const locationLine = state.locationStatus === "ok"
      ? `${state.latitude.toFixed(6)}, ${state.longitude.toFixed(6)}`
      : "não compartilhada";

    const summary = [
      `OCORRÊNCIA DE VULTO`,
      `LOCALIZAÇÃO: ${locationLine}`,
      `BATALHÃO: ${state.batalhao}`,
      `COMPANHIA: ${state.companhia}`,
      `PELOTÃO: ${state.pelotao}`,
      `TIPO: ${TIPO_LABELS[state.tipo]}`,
      `RODOVIA: ${state.rodovia}`,
      `QUILÔMETRO: ${state.km}`,
      `METROS: ${state.metros}`,
    ].join("\n");

    app.innerHTML = "";
    app.appendChild(el(`
      <div>
        <span class="step-tag">RESUMO</span>
        <h2>Dados registrados</h2>
        <div class="summary-output" id="summary-output"></div>
        <div class="nav-row">
          <button class="btn-secondary" id="btn-back">Voltar</button>
          <span class="spacer"></span>
          <button class="btn-primary" id="btn-restart">Nova transmissão</button>
        </div>
      </div>
    `));
    document.getElementById("summary-output").textContent = summary;
    document.getElementById("btn-back").addEventListener("click", goBack);
    document.getElementById("btn-restart").addEventListener("click", resetState);
    return;
  }
}

render();
