const app = document.getElementById("app");

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
  tipo: null, // 'SP' | 'SPA' | 'SPD' | 'SPI'
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
    km: "",
    metros: "",
  });
  render();
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
        <h1 class="hero-title">Iniciar nova transmissão de dados</h1>
        <p class="lead">
          Assistente de registro de ocorrência para transmissão de dados
          do Centro de Operações Rodoviárias.
        </p>
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
          <button class="btn-primary" id="btn-share">Compartilhar localização</button>
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
    app.appendChild(el(`
      <div>
        <span class="step-tag">LOCAL DOS FATOS</span>
        <h2>Unidade</h2>
        <div class="field">
          <label>Batalhão</label>
          <div class="choice-row" id="btl-row">
            <button class="btn-choice" data-v="1º BPRv">1º BPRv</button>
            <button class="btn-choice" data-v="2º BPRv">2º BPRv</button>
            <button class="btn-choice" data-v="3º BPRv">3º BPRv</button>
            <button class="btn-choice" data-v="4º BPRv">4º BPRv</button>
            <button class="btn-choice" data-v="5º BPRv">5º BPRv</button>
            <button class="btn-choice" data-v="6º BPRv">6º BPRv</button>
          </div>
        </div>
        <div class="field">
          <label>Companhia</label>
          <div class="choice-row" id="cia-row">
            <button class="btn-choice" data-v="1ª Cia">1ª Cia</button>
            <button class="btn-choice" data-v="2ª Cia">2ª Cia</button>
            <button class="btn-choice" data-v="3ª Cia">3ª Cia</button>
            <button class="btn-choice" data-v="4ª Cia">4ª Cia</button>
          </div>
        </div>
        <div class="field">
          <label>Pelotão</label>
          <div class="choice-row" id="pel-row">
            <button class="btn-choice" data-v="1º Pel">1º Pel</button>
            <button class="btn-choice" data-v="2º Pel">2º Pel</button>
            <button class="btn-choice" data-v="3º Pel">3º Pel</button>
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
    function validate() {
      nextBtn.disabled = !(state.batalhao && state.companhia && state.pelotao);
    }

    [[btlRow, "batalhao"], [ciaRow, "companhia"], [pelRow, "pelotao"]].forEach(([row, field]) => {
      markSelected(row, field);
      row.querySelectorAll("[data-v]").forEach((b) =>
        b.addEventListener("click", () => {
          state[field] = b.dataset.v;
          markSelected(row, field);
          validate();
        })
      );
    });
    validate();

    document.getElementById("btn-back").addEventListener("click", goBack);
    nextBtn.addEventListener("click", goNext);
    return;
  }

  if (s === "local_fatos") {
    app.innerHTML = "";
    app.appendChild(el(`
      <div>
        <span class="step-tag">LOCAL DOS FATOS</span>
        <h2>Local dos fatos</h2>
        <div class="field">
          <label>Tipo</label>
          <div class="choice-row" id="tipo-row">
            <button class="btn-choice" data-v="SP">SP</button>
            <button class="btn-choice" data-v="SPA">SPA</button>
            <button class="btn-choice" data-v="SPD">SPD</button>
            <button class="btn-choice" data-v="SPI">SPI</button>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Quilômetro</label>
            <input type="number" id="input-km" min="0" max="999" step="1" value="${state.km}" placeholder="0-999" />
          </div>
          <div class="field">
            <label>Metros</label>
            <input type="number" id="input-metros" min="0" max="999" step="1" value="${state.metros}" placeholder="0-999" />
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

    function markSelectedTipo() {
      tipoRow.querySelectorAll("[data-v]").forEach((b) => {
        b.classList.toggle("selected", b.dataset.v === state.tipo);
      });
    }
    markSelectedTipo();

    function validate() {
      nextBtn.disabled = !(state.tipo && kmInput.value.trim() !== "" && metrosInput.value.trim() !== "");
    }
    validate();

    tipoRow.querySelectorAll("[data-v]").forEach((b) =>
      b.addEventListener("click", () => {
        state.tipo = b.dataset.v;
        markSelectedTipo();
        validate();
      })
    );

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
      `TIPO: ${state.tipo}`,
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
