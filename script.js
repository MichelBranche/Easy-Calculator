"use strict";

/*
  script.js
  Qui ho due parti:
  1) Toggle tema (cambio file CSS tema + salvataggio in localStorage)
  2) Logica calcolatrice (stato, display, click e tastiera)
*/

/* =========================
   PARTE 1: TOGGLE TEMA
   ========================= */

/*
  STEP T1: PRENDO I RIFERIMENTI
  - themeLink: <link id="theme"> che punta al file del tema
  - themeBtn: bottone che cambia tema
*/
const themeLink = document.getElementById("theme");
const themeBtn = document.getElementById("themeToggle");

/*
  STEP T2: FUNZIONE PER LEGGERE IL TEMA DI SISTEMA
  Se l'utente non ha scelto nulla, parto in base a prefers-color-scheme.
*/
function getSystemTheme() {
  const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
  return mq && mq.matches ? "dark" : "light";
}

/*
  STEP T3: FUNZIONE PER APPLICARE IL TEMA
  - cambio href del link tema
  - aggiorno testo del bottone
  - aggiorno aria-pressed
  - salvo in localStorage
  - salvo anche in data-theme per avere uno stato chiaro nel DOM
*/
function applyTheme(mode) {
  const isDark = mode === "dark";

  themeLink.href = isDark ? "theme-dark.css" : "theme-light.css";

  themeBtn.textContent = isDark ? "Scuro" : "Chiaro";
  themeBtn.setAttribute("aria-pressed", String(isDark));

  document.documentElement.dataset.theme = mode;
  localStorage.setItem("theme", mode);
}

/*
  STEP T4: INIZIALIZZAZIONE TEMA
  - se c'è un tema salvato lo uso
  - altrimenti uso il tema del sistema
*/
const savedTheme = localStorage.getItem("theme");
applyTheme(savedTheme || getSystemTheme());

/*
  STEP T5: CLICK SUL BOTTONE
  - leggo il tema attuale da data-theme
  - alterno
*/
themeBtn.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme || "light";
  applyTheme(currentTheme === "dark" ? "light" : "dark");
});

/* =========================
   PARTE 2: CALCOLATRICE
   ========================= */

/*
  STEP 1: PRENDO GLI ELEMENTI DOM DELLA CALCOLATRICE
*/
const prevEl = document.getElementById("prev");
const currEl = document.getElementById("curr");
const keys = document.getElementById("keys");

/*
  STEP 2: STATO
  - current: numero che sto digitando (stringa)
  - previous: numero salvato prima dell'operazione (stringa)
  - operation: operatore scelto oppure null
*/
let current = "0";
let previous = "";
let operation = null;

/*
  STEP 3: UPDATE DISPLAY
*/
function updateDisplay() {
  currEl.textContent = current || "0";

  if (operation && previous !== "") {
    prevEl.textContent = `${previous} ${operation}`;
  } else {
    prevEl.textContent = "";
  }
}

/*
  STEP 4: CLEAR TOTALE
*/
function clearAll() {
  current = "0";
  previous = "";
  operation = null;
  updateDisplay();
}

/*
  STEP 5: BACKSPACE
*/
function deleteLast() {
  if (current === "Errore") {
    clearAll();
    return;
  }

  if (current.length <= 1) {
    current = "0";
  } else {
    current = current.slice(0, -1);
  }

  updateDisplay();
}

/*
  STEP 6: AGGIUNGO NUMERO
*/
function appendNumber(n) {
  if (current === "Errore") clearAll();

  if (current === "0") {
    current = n;
  } else {
    current += n;
  }

  updateDisplay();
}

/*
  STEP 7: DECIMALE
*/
function appendDecimal() {
  if (current === "Errore") clearAll();

  if (!current.includes(".")) {
    current += ".";
    updateDisplay();
  }
}

/*
  STEP 8: SCELTA OPERAZIONE
*/
function chooseOperation(op) {
  if (current === "Errore") return;

  if (operation && previous !== "") {
    compute();
  }

  previous = current;
  current = "0";
  operation = op;

  updateDisplay();
}

/*
  STEP 9: CALCOLO
*/
function compute() {
  if (!operation || previous === "") return;

  const a = Number(previous);
  const b = Number(current);

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    current = "Errore";
    previous = "";
    operation = null;
    updateDisplay();
    return;
  }

  let result;

  switch (operation) {
    case "+":
      result = a + b;
      break;

    case "-":
      result = a - b;
      break;

    case "*":
      result = a * b;
      break;

    case "/":
      if (b === 0) {
        current = "Errore";
        previous = "";
        operation = null;
        updateDisplay();
        return;
      }
      result = a / b;
      break;

    default:
      return;
  }

  const fixed = Number.isInteger(result)
    ? String(result)
    : String(Number(result.toFixed(10)));

  current = fixed;
  previous = "";
  operation = null;

  updateDisplay();
}

/*
  STEP 10: CLICK SUI TASTI (EVENT DELEGATION)
*/
keys.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.hasAttribute("data-clear")) {
    clearAll();
    return;
  }

  if (btn.hasAttribute("data-backspace")) {
    deleteLast();
    return;
  }

  if (btn.hasAttribute("data-equals")) {
    compute();
    return;
  }

  if (btn.hasAttribute("data-decimal")) {
    appendDecimal();
    return;
  }

  const num = btn.getAttribute("data-number");
  if (num !== null) {
    appendNumber(num);
    return;
  }

  const op = btn.getAttribute("data-operator");
  if (op) {
    chooseOperation(op);
  }
});

/*
  STEP 11: TASTIERA
*/
window.addEventListener("keydown", (e) => {
  const k = e.key;

  if (k >= "0" && k <= "9") {
    appendNumber(k);
    return;
  }

  if (k === ".") {
    appendDecimal();
    return;
  }

  if (k === "+" || k === "-" || k === "*" || k === "/") {
    e.preventDefault();
    chooseOperation(k);
    return;
  }

  if (k === "Enter" || k === "=") {
    e.preventDefault();
    compute();
    return;
  }

  if (k === "Backspace") {
    deleteLast();
    return;
  }

  if (k === "Escape") {
    clearAll();
  }
});

/* STEP 12: PRIMO RENDER */
updateDisplay();
