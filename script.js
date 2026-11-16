/* =========================================================
   Semnal — logică
   Datele sunt păstrate local, în browser (localStorage).
   Harta folosește biblioteca Leaflet și hărți publice Esri,
   care nu au nevoie de cheie API. Dacă un furnizor nu răspunde,
   harta trece automat la OpenStreetMap.
   ========================================================= */

"use strict";

/* ---------- Constante ---------- */
const ORA = 3600e3;
const ZI = 24 * ORA;
const CENTRU = [44.4325, 26.0939];
const PUNCTE = { raport: 20, confirmare: 5, comentariu: 2 };

const ICON = {
  drumuri: '<path d="M9.5 3h5l4.5 16h-14z"/><path d="M7.6 10h8.8M6.4 14.5h11.2M3 21h18"/>',
  iluminat: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
  curatenie: '<path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13M10 11v5.5M14 11v5.5"/>',
  accesibilitate: '<circle cx="12" cy="4.5" r="1.8"/><path d="M12 7.5v6h4.5l2 5.5M12 10.5h4"/><path d="M9 10a5.5 5.5 0 1 0 6.5 8"/>',
  mobilier: '<path d="M4 11h16M5.5 11V7.5h13V11M6.5 11v7M17.5 11v7M4 15h16"/>',
  altele: '<path d="M12 4 21 20H3z"/><path d="M12 10v4.5M12 17.2v.1"/>',
  loc: '<path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  confirm: '<path d="M7 11v9H4v-9zM7 11l4-7c1.5 0 2.5 1 2.2 2.6L12.5 10H19a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.8 20H7"/>',
  comentariu: '<path d="M4 5h16v11H8l-4 4z"/>',
  ochi: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  bifa: '<path d="m5 12 5 5 9-10"/>',
  camera: '<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>',
  tinta: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
};

const svg = (nume) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[nume]}</svg>`;

const CATEGORII = {
  drumuri: "Drumuri",
  iluminat: "Iluminat",
  curatenie: "Curățenie",
  accesibilitate: "Accesibilitate",
  mobilier: "Mobilier urban",
  altele: "Altele",
};

const STATUS = { nou: "Nouă", lucru: "În lucru", rezolvat: "Rezolvată" };
const GRAVITATE = { 1: "Scăzută", 2: "Medie", 3: "Ridicată" };

const NIVELURI = [
  { prag: 0, nume: "Începător" },
  { prag: 20, nume: "Observator" },
  { prag: 60, nume: "Cetățean activ" },
  { prag: 120, nume: "Vocea cartierului" },
  { prag: 200, nume: "Gardian al orașului" },
];

const CETATENI = [
  { nume: "Ana Pavel", cartier: "Drumul Taberei", puncte: 245 },
  { nume: "Mihai Ionescu", cartier: "Titan", puncte: 190 },
  { nume: "Cristina Stan", cartier: "Militari", puncte: 150 },
  { nume: "Radu Vasile", cartier: "Floreasca", puncte: 105 },
  { nume: "Elena Dinu", cartier: "Berceni", puncte: 70 },
  { nume: "Victor Matei", cartier: "Unirii", puncte: 40 },
  { nume: "Ioana Rusu", cartier: "Dristor", puncte: 25 },
];

/* ---------- Date inițiale ---------- */
const acum = Date.now();
const raport = (o) => ({ comentarii: [], foto: null, autor: "Cetățean", ...o });

const rapoarteInitiale = [
  raport({ id: 1, categorie: "drumuri", titlu: "Groapă adâncă pe banda 1", descriere: "Groapă de aproximativ 40 cm, chiar înainte de semafor. Mașinile o ocolesc brusc pe banda a doua, iar noaptea nu se vede deloc.", adresa: "Bd. Unirii nr. 45", cartier: "Unirii", lat: 44.4268, lng: 26.1100, gravitate: 3, confirmari: 34, autor: "Victor Matei",
    istoric: [{ status: "nou", ts: acum - 6 * ZI }, { status: "lucru", ts: acum - 2 * ZI }],
    comentarii: [{ autor: "Ioana Rusu", text: "Am trecut azi pe acolo, au pus deja un con de semnalizare.", ts: acum - 20 * ORA }, { autor: "Dan Popa", text: "Mi-a stricat o jantă săptămâna trecută. Sper să se rezolve repede.", ts: acum - 4 * ZI }] }),
  raport({ id: 2, categorie: "iluminat", titlu: "Trei stâlpi fără lumină", descriere: "Pe toată porțiunea dintre bloc și stația de autobuz nu funcționează iluminatul de aproape o săptămână.", adresa: "Str. Popa Nan nr. 80", cartier: "Dristor", lat: 44.4290, lng: 26.1340, gravitate: 2, confirmari: 12, autor: "Elena Dinu",
    istoric: [{ status: "nou", ts: acum - 3 * ZI }] }),
  raport({ id: 3, categorie: "curatenie", titlu: "Moloz abandonat lângă parc", descriere: "Cineva a lăsat saci cu moloz și resturi de la o renovare lângă intrarea în parc.", adresa: "Parcul Titan, intrarea dinspre metrou", cartier: "Titan", lat: 44.4185, lng: 26.1690, gravitate: 2, confirmari: 41, autor: "Mihai Ionescu",
    istoric: [{ status: "nou", ts: acum - 14 * ZI }, { status: "lucru", ts: acum - 10 * ZI }, { status: "rezolvat", ts: acum - 5 * ZI }],
    comentarii: [{ autor: "Mihai Ionescu", text: "Au ridicat totul azi-dimineață. Mulțumesc celor care au confirmat!", ts: acum - 5 * ZI }] }),
  raport({ id: 4, categorie: "accesibilitate", titlu: "Mașini parcate pe trotuar", descriere: "Trotuarul e blocat complet, iar oamenii cu cărucioare sau scaune cu rotile trebuie să meargă pe carosabil.", adresa: "Calea Victoriei nr. 120", cartier: "Victoriei", lat: 44.4470, lng: 26.0880, gravitate: 2, confirmari: 8,
    istoric: [{ status: "nou", ts: acum - 5 * ORA }] }),
  raport({ id: 5, categorie: "mobilier", titlu: "Bancă ruptă lângă lac", descriere: "Șezutul băncii e rupt și are cuie ieșite. E periculos mai ales pentru copii.", adresa: "Parcul Cișmigiu, aleea de lângă lac", cartier: "Cișmigiu", lat: 44.4370, lng: 26.0910, gravitate: 1, confirmari: 6,
    istoric: [{ status: "nou", ts: acum - 9 * ZI }, { status: "lucru", ts: acum - 4 * ZI }] }),
  raport({ id: 6, categorie: "drumuri", titlu: "Capac de canal lipsă", descriere: "Lipsește capacul de canal din dreptul stației. Cineva a pus o creangă în el ca semnal.", adresa: "Bd. Iuliu Maniu nr. 15", cartier: "Militari", lat: 44.4340, lng: 26.0270, gravitate: 3, confirmari: 52, autor: "Cristina Stan",
    istoric: [{ status: "nou", ts: acum - 13 * ZI }, { status: "lucru", ts: acum - 12 * ZI }, { status: "rezolvat", ts: acum - 10 * ZI }] }),
  raport({ id: 7, categorie: "iluminat", titlu: "Semafor care clipește intermitent", descriere: "Semaforul pentru pietoni clipește galben de două zile, iar mașinile nu mai opresc.", adresa: "Piața Romană", cartier: "Romană", lat: 44.4466, lng: 26.0970, gravitate: 3, confirmari: 19,
    istoric: [{ status: "nou", ts: acum - 8 * ZI }, { status: "lucru", ts: acum - 7 * ZI }, { status: "rezolvat", ts: acum - 6 * ZI }] }),
  raport({ id: 8, categorie: "curatenie", titlu: "Tomberoane pline de 5 zile", descriere: "Containerele de gunoi nu au mai fost golite, iar gunoiul s-a adunat pe jos.", adresa: "Str. Brașov nr. 22", cartier: "Drumul Taberei", lat: 44.4220, lng: 26.0330, gravitate: 2, confirmari: 15, autor: "Ana Pavel",
    istoric: [{ status: "nou", ts: acum - ZI }] }),
  raport({ id: 9, categorie: "accesibilitate", titlu: "Rampă de acces blocată la metrou", descriere: "Rampa pentru persoanele cu dizabilități e blocată de panouri publicitare.", adresa: "Piața Victoriei, ieșirea spre Guvern", cartier: "Victoriei", lat: 44.4525, lng: 26.0860, gravitate: 2, confirmari: 11,
    istoric: [{ status: "nou", ts: acum - 4 * ZI }, { status: "lucru", ts: acum - ZI }] }),
  raport({ id: 10, categorie: "altele", titlu: "Copac înclinat deasupra trotuarului", descriere: "După furtuna de ieri, un tei s-a înclinat mult și are rădăcinile ridicate. Pare că ar putea cădea.", adresa: "Str. Floreasca nr. 101", cartier: "Floreasca", lat: 44.4590, lng: 26.1000, gravitate: 3, confirmari: 9, autor: "Radu Vasile",
    istoric: [{ status: "nou", ts: acum - 12 * ORA }] }),
  raport({ id: 11, categorie: "mobilier", titlu: "Tobogan rupt la locul de joacă", descriere: "Toboganul are o margine ruptă și ascuțită. Locul de joacă e folosit zilnic de mulți copii.", adresa: "Parcul Tineretului, locul de joacă mare", cartier: "Tineretului", lat: 44.4050, lng: 26.1050, gravitate: 2, confirmari: 7,
    istoric: [{ status: "nou", ts: acum - 2 * ZI }] }),
  raport({ id: 12, categorie: "drumuri", titlu: "Asfalt crăpat pe pista de biciclete", descriere: "Crăpături lungi pe pista de biciclete, mai ales în curbă. Nu e urgent, dar se poate agrava la iarnă.", adresa: "Șoseaua Kiseleff", cartier: "Herăstrău", lat: 44.4610, lng: 26.0830, gravitate: 1, confirmari: 5,
    istoric: [{ status: "nou", ts: acum - 11 * ZI }, { status: "lucru", ts: acum - 3 * ZI }] }),
  raport({ id: 13, categorie: "curatenie", titlu: "Graffiti pe zidul școlii", descriere: "Zidul dinspre stradă al școlii a fost acoperit cu graffiti vulgar peste noapte.", adresa: "Str. Liviu Rebreanu nr. 9", cartier: "Titan", lat: 44.4235, lng: 26.1545, gravitate: 1, confirmari: 4,
    istoric: [{ status: "nou", ts: acum - 7 * ZI }, { status: "lucru", ts: acum - 6 * ZI }, { status: "rezolvat", ts: acum - 2 * ZI }] }),
];

/* ---------- Stocare ---------- */
const PREFIX = "semnal_v2_";

function incarca(cheie, implicit) {
  try {
    const v = localStorage.getItem(PREFIX + cheie);
    return v ? JSON.parse(v) : implicit;
  } catch {
    return implicit;
  }
}

function salveaza(cheie, valoare) {
  try {
    localStorage.setItem(PREFIX + cheie, JSON.stringify(valoare));
    return true;
  } catch {
    return false;
  }
}

const stare = {
  rapoarte: incarca("rapoarte", rapoarteInitiale),
  puncte: incarca("puncte", 0),
  confirmate: incarca("confirmate", []),
  urmarite: incarca("urmarite", []),
  ale_mele: incarca("ale_mele", []),
  comentarii: incarca("comentarii", 0),
  istoric: incarca("istoric", []),
  strat: incarca("strat", "intunecat"),
  introAscuns: incarca("intro_ascuns", false),
  filtre: { categorie: "toate", status: "toate", termen: "", sortare: "recente", urmarite: false, mele: false },
  selectat: null,
  densitate: false,
};

function salveazaTot() {
  const ok = ["rapoarte", "puncte", "confirmate", "urmarite", "ale_mele", "comentarii", "istoric"]
    .map((k) => salveaza(k, stare[k]))
    .every(Boolean);
  if (!ok) notifica("Nu am putut salva tot în browser (poate fotografia e prea mare).");
}

/* ---------- Utilitare ---------- */
const $ = (id) => document.getElementById(id);

function escapeHtml(text) {
  const d = document.createElement("div");
  d.textContent = text == null ? "" : String(text);
  return d.innerHTML;
}

function initiale(nume) {
  return nume.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}

function nuanta(text) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

function avatar(nume, clasa = "") {
  const tu = nume === "Tu";
  return `<span class="avatar ${tu ? "avatar-tu" : ""} ${clasa}" style="--h:${nuanta(nume)}" title="${escapeHtml(nume)}">${tu ? "TU" : escapeHtml(initiale(nume))}</span>`;
}

const cod = (r) => `SEM-${String(r.id).slice(-4).padStart(4, "0")}`;

function timpRelativ(ts) {
  const minute = Math.floor((Date.now() - ts) / 60000);
  if (minute < 1) return "chiar acum";
  if (minute < 60) return `acum ${minute} min`;
  const ore = Math.floor(minute / 60);
  if (ore < 24) return `acum ${ore} h`;
  const zile = Math.floor(ore / 24);
  return zile === 1 ? "ieri" : `acum ${zile} zile`;
}

const formatData = (ts) => new Date(ts).toLocaleDateString("ro-RO", { day: "2-digit", month: "short" });
const zileIntre = (a, b) => Math.max(0, Math.round((b - a) / ZI));
const creat = (r) => r.istoric[0].ts;
const statusCurent = (r) => r.istoric[r.istoric.length - 1].status;
const momentStatus = (r, st) => (r.istoric.find((x) => x.status === st) || {}).ts;

function nivelCurent(puncte) {
  let i = 0;
  NIVELURI.forEach((n, k) => { if (puncte >= n.prag) i = k; });
  return { ...NIVELURI[i], urmator: NIVELURI[i + 1] || null };
}

function notifica(mesaj) {
  const t = $("toast");
  t.textContent = mesaj;
  t.classList.add("vizibil");
  clearTimeout(notifica.timer);
  notifica.timer = setTimeout(() => t.classList.remove("vizibil"), 3200);
}

function adaugaIstoric(text) {
  stare.istoric.unshift({ text, ts: Date.now() });
  stare.istoric = stare.istoric.slice(0, 30);
}

/* ---------- Insigne ---------- */
const aleMele = () => stare.rapoarte.filter((r) => stare.ale_mele.includes(r.id));

const INSIGNE = [
  { nume: "Primul semnal", cat: "drumuri", icon: "tinta", test: () => aleMele().length >= 1 },
  { nume: "Ochi atent", cat: "accesibilitate", icon: "ochi", test: () => aleMele().length >= 3 },
  { nume: "Fotograf", cat: "mobilier", icon: "camera", test: () => aleMele().some((r) => r.foto) },
  { nume: "Solidar", cat: "curatenie", icon: "confirm", test: () => stare.confirmate.length >= 5 },
  { nume: "Comentator", cat: "altele", icon: "comentariu", test: () => stare.comentarii >= 3 },
  { nume: "Drumuri sigure", cat: "drumuri", icon: "drumuri", test: () => aleMele().some((r) => r.categorie === "drumuri") },
  { nume: "Lumină pe stradă", cat: "iluminat", icon: "iluminat", test: () => aleMele().some((r) => r.categorie === "iluminat") },
  { nume: "Oraș pentru toți", cat: "accesibilitate", icon: "accesibilitate", test: () => aleMele().some((r) => r.categorie === "accesibilitate") },
];

const insigneDeblocate = () => INSIGNE.filter((i) => i.test()).map((i) => i.nume);

/* ---------- Filtrare ---------- */
function rapoarteVizibile() {
  const { categorie, status, termen, sortare, urmarite, mele } = stare.filtre;
  const t = termen.trim().toLowerCase();
  const lista = stare.rapoarte.filter((r) => {
    if (categorie !== "toate" && r.categorie !== categorie) return false;
    if (status !== "toate" && statusCurent(r) !== status) return false;
    if (urmarite && !stare.urmarite.includes(r.id)) return false;
    if (mele && !stare.ale_mele.includes(r.id)) return false;
    if (!t) return true;
    return [r.titlu, r.adresa, r.cartier, r.descriere, cod(r)].some((x) => x.toLowerCase().includes(t));
  });
  const deschis = (r) => (statusCurent(r) === "rezolvat" ? 1 : 0);
  const comparatori = {
    recente: (a, b) => creat(b) - creat(a),
    confirmate: (a, b) => b.confirmari - a.confirmari,
    vechi: (a, b) => deschis(a) - deschis(b) || creat(a) - creat(b),
    gravitate: (a, b) => deschis(a) - deschis(b) || b.gravitate - a.gravitate || b.confirmari - a.confirmari,
  };
  return lista.sort(comparatori[sortare]);
}

/* =========================================================
   HARTA
   ========================================================= */
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services";
const ATRIBUIRE_ESRI = 'Tiles &copy; <a href="https://www.esri.com">Esri</a> — Esri, HERE, Garmin, &copy; OpenStreetMap contributors';
const ATRIBUIRE_OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Fiecare stil are o listă de furnizori: dacă primul nu merge, se încearcă următorul.
const STRATURI = {
  intunecat: [
    { url: `${ESRI}/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, etichete: `${ESRI}/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, maxNativ: 16, atribuire: ATRIBUIRE_ESRI },
    { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", maxNativ: 19, atribuire: ATRIBUIRE_OSM, filtru: "intunecat" },
  ],
  strada: [
    { url: `${ESRI}/World_Street_Map/MapServer/tile/{z}/{y}/{x}`, maxNativ: 19, atribuire: ATRIBUIRE_ESRI },
    { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", maxNativ: 19, atribuire: ATRIBUIRE_OSM },
  ],
  satelit: [
    { url: `${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`, etichete: `${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`, maxNativ: 19, atribuire: "Tiles &copy; Esri — Esri, Maxar, Earthstar Geographics" },
    { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", maxNativ: 19, atribuire: ATRIBUIRE_OSM },
  ],
};

const harta = { map: null, strat: null, densitate: null, markere: {}, temp: null, baza: null, etichete: null, alegere: false };

function initHarta() {
  if (typeof L === "undefined") {
    $("harta-eroare").classList.remove("hidden");
    $("alege-pe-harta").disabled = true;
    return;
  }
  harta.map = L.map("harta", { zoomControl: false, scrollWheelZoom: true, attributionControl: true }).setView(CENTRU, 13);
  L.control.zoom({ position: "topright" }).addTo(harta.map);
  harta.densitate = L.layerGroup();
  harta.strat = L.layerGroup().addTo(harta.map);
  seteazaStrat(stare.strat);

  harta.map.on("click", (e) => {
    if (harta.alegere) return alegeLoc(e.latlng);
    L.popup({ autoPanPadding: [60, 60] })
      .setLatLng(e.latlng)
      .setContent(`<span class="cod">${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}</span>
        <strong>Ai observat ceva aici?</strong>
        <button type="button" class="btn btn-semnal" data-raporteaza-aici="${e.latlng.lat},${e.latlng.lng}">Raportează aici</button>`)
      .openOn(harta.map);
  });
}

function seteazaStrat(nume, indexFurnizor = 0) {
  if (!harta.map) return;
  const furnizori = STRATURI[nume] || STRATURI.intunecat;
  const f = furnizori[indexFurnizor];
  if (!f) {
    $("harta-eroare").classList.remove("hidden");
    return;
  }
  stare.strat = nume;
  salveaza("strat", nume);
  document.querySelectorAll(".control-straturi [data-strat]").forEach((b) => b.classList.toggle("activ", b.dataset.strat === nume));

  if (harta.baza) harta.map.removeLayer(harta.baza);
  if (harta.etichete) harta.map.removeLayer(harta.etichete);
  harta.etichete = null;

  let incarcate = 0;
  let erori = 0;
  harta.baza = L.tileLayer(f.url, { maxZoom: 19, maxNativeZoom: f.maxNativ, attribution: f.atribuire, className: f.filtru ? "tile-" + f.filtru : "" });
  harta.baza.on("tileload", () => { incarcate += 1; });
  harta.baza.on("tileerror", () => {
    erori += 1;
    // dacă furnizorul nu răspunde deloc, trecem la următorul
    if (erori >= 4 && incarcate === 0) {
      harta.baza.off();
      seteazaStrat(nume, indexFurnizor + 1);
    }
  });
  harta.baza.addTo(harta.map);
  if (f.etichete) {
    harta.etichete = L.tileLayer(f.etichete, { maxZoom: 19, maxNativeZoom: f.maxNativ, pane: "overlayPane", opacity: 0.9 }).addTo(harta.map);
  }
  document.getElementById("harta").classList.toggle("osm-intunecat", f.filtru === "intunecat");
}

function iconMarcaj(r) {
  const st = statusCurent(r);
  return L.divIcon({
    className: "",
    html: `<div class="marcaj cat-${r.categorie} st-${st} ${st === "rezolvat" ? "rezolvat" : ""} ${stare.selectat === r.id ? "activ" : ""}">${svg(r.categorie)}<span class="marcaj-status"></span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

function popupHtml(r) {
  const st = statusCurent(r);
  return `<span class="status st-${st}">${STATUS[st]}</span> <span class="cod">${cod(r)}</span>
    <strong>${escapeHtml(r.titlu)}</strong>
    <span class="popup-adresa">${escapeHtml(r.adresa)} · ${r.confirmari} confirmări</span>
    <button type="button" class="btn btn-contur" data-detalii="${r.id}">Deschide sesizarea</button>`;
}

function randeazaMarkere(vizibile) {
  if (!harta.map) return;
  harta.strat.clearLayers();
  harta.densitate.clearLayers();
  harta.markere = {};
  const culori = { nou: "#ff5d5d", lucru: "#ffb020", rezolvat: "#2bd97c" };
  vizibile.forEach((r) => {
    const m = L.marker([r.lat, r.lng], { icon: iconMarcaj(r), riseOnHover: true, zIndexOffset: stare.selectat === r.id ? 1000 : 0 })
      .bindPopup(popupHtml(r), { autoPanPadding: [60, 60] })
      .on("click", () => selecteaza(r.id, { zboara: false, popup: false }));
    m.addTo(harta.strat);
    harta.markere[r.id] = m;
    if (statusCurent(r) !== "rezolvat") {
      L.circle([r.lat, r.lng], {
        radius: 180 + r.confirmari * 14,
        stroke: false,
        fillColor: culori[statusCurent(r)],
        fillOpacity: 0.16 + Math.min(0.2, r.confirmari / 250),
        interactive: false,
      }).addTo(harta.densitate);
    }
  });
}

document.addEventListener("click", (e) => {
  const d = e.target.closest("[data-detalii]");
  if (d) deschideDetalii(Number(d.dataset.detalii));
  const aici = e.target.closest("[data-raporteaza-aici]");
  if (aici && harta.map) {
    const [lat, lng] = aici.dataset.raporteazaAici.split(",").map(Number);
    harta.map.closePopup();
    deschideRaportare();
    alegeLoc({ lat, lng }, false);
  }
});

document.querySelector(".control-straturi").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b || !harta.map) return;
  if (b.dataset.strat) seteazaStrat(b.dataset.strat);
  if (b.id === "comuta-densitate") {
    stare.densitate = !stare.densitate;
    b.setAttribute("aria-pressed", stare.densitate);
    if (stare.densitate) harta.densitate.addTo(harta.map);
    else harta.map.removeLayer(harta.densitate);
  }
});

/* =========================================================
   RANDARE
   ========================================================= */
function randeazaFiltre() {
  const numar = (cat) => stare.rapoarte.filter((r) => cat === "toate" || r.categorie === cat).length;
  $("filtre").innerHTML = [["toate", "Toate"], ...Object.entries(CATEGORII)].map(([cheie, nume]) => `
    <button type="button" class="filtru ${cheie !== "toate" ? "cat-" + cheie : ""} ${stare.filtre.categorie === cheie ? "activ" : ""}" data-cat="${cheie}">
      ${cheie !== "toate" ? '<i class="punct"></i>' : ""}${nume} <b>${numar(cheie)}</b>
    </button>`).join("");
}

function raportHtml(r, i) {
  const st = statusCurent(r);
  const confirmat = stare.confirmate.includes(r.id);
  return `
    <article class="raport cat-${r.categorie} ${stare.selectat === r.id ? "selectat" : ""}" data-id="${r.id}" tabindex="0" style="animation-delay:${Math.min(i, 12) * 25}ms">
      <span class="raport-bara"></span>
      <div>
        <div class="raport-sus">
          <span class="raport-cat">${svg(r.categorie)}${CATEGORII[r.categorie]}</span>
          <span class="status st-${st}">${STATUS[st]}</span>
        </div>
        <h3>${escapeHtml(r.titlu)}</h3>
        <p class="raport-adresa">${escapeHtml(r.adresa)} · ${escapeHtml(r.cartier)}</p>
        <div class="raport-jos">
          <span class="${confirmat ? "confirmat" : ""}">${svg("confirm")}${r.confirmari}</span>
          <span>${svg("comentariu")}${r.comentarii.length}</span>
          <span class="gravitate g-${r.gravitate}" title="Gravitate ${GRAVITATE[r.gravitate].toLowerCase()}"><i></i><i></i><i></i></span>
          <span>${timpRelativ(creat(r))}</span>
          <span class="cod">${cod(r)}</span>
        </div>
      </div>
    </article>`;
}

function randeazaLista() {
  const vizibile = rapoarteVizibile();
  $("lista").innerHTML = vizibile.map(raportHtml).join("");
  $("gol").classList.toggle("hidden", vizibile.length > 0);
  $("lista").classList.toggle("hidden", vizibile.length === 0);
  $("rezultate").textContent = String(vizibile.length).padStart(2, "0");
  randeazaMarkere(vizibile);
}

function selecteaza(id, { zboara = true, popup = true } = {}) {
  stare.selectat = id;
  document.querySelectorAll(".raport").forEach((el) => el.classList.toggle("selectat", Number(el.dataset.id) === id));
  document.querySelector(`.raport[data-id="${id}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  const r = stare.rapoarte.find((x) => x.id === id);
  if (!harta.map || !r) return;
  Object.entries(harta.markere).forEach(([mid, m]) => {
    m.setIcon(iconMarcaj(stare.rapoarte.find((x) => x.id === Number(mid))));
    m.setZIndexOffset(Number(mid) === id ? 1000 : 0);
  });
  if (zboara) harta.map.flyTo([r.lat, r.lng], Math.max(harta.map.getZoom(), 15), { duration: 0.6 });
  if (popup && harta.markere[id]) setTimeout(() => harta.markere[id].openPopup(), zboara ? 650 : 0);
}

/* ---------- Cifre ---------- */
function calculeazaCifre() {
  const rezolvate = stare.rapoarte.filter((r) => statusCurent(r) === "rezolvat");
  const durate = rezolvate.map((r) => zileIntre(creat(r), momentStatus(r, "rezolvat")));
  const confirmari = stare.rapoarte.reduce((s, r) => s + r.confirmari, 0);
  return {
    total: stare.rapoarte.length,
    rezolvate: rezolvate.length,
    deschise: stare.rapoarte.length - rezolvate.length,
    confirmari,
    medieConfirmari: stare.rapoarte.length ? Math.round(confirmari / stare.rapoarte.length) : 0,
    zile: durate.length ? Math.round(durate.reduce((a, b) => a + b, 0) / durate.length) : 0,
  };
}

let cifreAnimate = false;

function animeazaNumar(el, tinta) {
  const start = performance.now();
  const pas = (t) => {
    const p = Math.min(1, (t - start) / 1100);
    el.textContent = Math.round(tinta * (1 - Math.pow(1 - p, 3))).toLocaleString("ro-RO");
    if (p < 1) requestAnimationFrame(pas);
  };
  requestAnimationFrame(pas);
}

function randeazaCifre() {
  const c = calculeazaCifre();
  const valori = { "stat-total": c.total, "stat-rezolvate": c.rezolvate, "stat-confirmari": c.confirmari, "stat-zile": c.zile };
  Object.entries(valori).forEach(([id, v]) => {
    const el = $(id);
    el.dataset.tinta = v;
    if (cifreAnimate) el.textContent = v.toLocaleString("ro-RO");
  });
  $("live-deschise").textContent = c.deschise;
  $("kpi-deschise").textContent = c.deschise;
  $("kpi-rezolvate").textContent = c.rezolvate;
  $("kpi-zile").textContent = c.zile;
  const procent = c.total ? Math.round((c.rezolvate / c.total) * 100) : 0;
  $("bara-rezolvate").style.width = `${procent}%`;
  $("procent-text").textContent = `${procent}% din total`;
  $("medie-confirmari").textContent = `în medie ${c.medieConfirmari} pe sesizare`;
  $("puncte").textContent = stare.puncte;
  $("insigna").textContent = nivelCurent(stare.puncte).nume;

  // sesizări pe zi, în ultimele 14 zile
  const azi = new Date(); azi.setHours(0, 0, 0, 0);
  const zile = Array.from({ length: 14 }, (_, i) => azi.getTime() - (13 - i) * ZI);
  const numere = zile.map((z) => stare.rapoarte.filter((r) => creat(r) >= z && creat(r) < z + ZI).length);
  const max = Math.max(1, ...numere);
  $("spark-total").innerHTML = numere.map((n) => `<i class="${n ? "plin" : ""}" style="height:${Math.max(6, (n / max) * 100)}%" title="${n}"></i>`).join("");
}

function pornesteAnimatieCifre() {
  const ruleaza = () => {
    if (cifreAnimate) return;
    cifreAnimate = true;
    document.querySelectorAll("[data-numar]").forEach((el) => animeazaNumar(el, Number(el.dataset.tinta || 0)));
  };
  if (!("IntersectionObserver" in window)) return ruleaza();
  const obs = new IntersectionObserver((intrari) => {
    if (intrari.some((i) => i.isIntersecting)) { ruleaza(); obs.disconnect(); }
  }, { threshold: 0.3 });
  obs.observe($("raport"));
}

/* ---------- Raport de oraș ---------- */
function randeazaRaport() {
  const max = Math.max(1, ...Object.keys(CATEGORII).map((c) => stare.rapoarte.filter((r) => r.categorie === c).length));
  $("bare-categorii").innerHTML = Object.entries(CATEGORII).map(([cheie, nume]) => {
    const toate = stare.rapoarte.filter((r) => r.categorie === cheie);
    const rez = toate.filter((r) => statusCurent(r) === "rezolvat").length;
    return `
      <div class="bara-rand cat-${cheie}">
        <span class="bara-nume">${svg(cheie)}${nume}</span>
        <span class="bara-pista">
          <span class="bara-total" style="width:${(toate.length / max) * 100}%"></span>
          <span class="bara-rezolvat" style="width:${(rez / max) * 100}%"></span>
        </span>
        <span class="bara-valoare">${rez}<span>/${toate.length}</span></span>
      </div>`;
  }).join("");

  const total = stare.rapoarte.length || 1;
  const n = { nou: 0, lucru: 0, rezolvat: 0 };
  stare.rapoarte.forEach((r) => { n[statusCurent(r)] += 1; });
  const p1 = (n.rezolvat / total) * 100;
  const p2 = p1 + (n.lucru / total) * 100;
  $("inel").style.background = `conic-gradient(var(--st-rezolvat) 0 ${p1}%, var(--st-lucru) ${p1}% ${p2}%, var(--st-nou) ${p2}% 100%)`;
  $("procent-rezolvate").textContent = `${Math.round(p1)}%`;
  $("inel-legenda").innerHTML = [["rezolvat", "Rezolvate"], ["lucru", "În lucru"], ["nou", "Noi"]]
    .map(([s, t]) => `<li><i class="punct st-${s}"></i>${t}<b>${n[s]}</b></li>`).join("");

  // cartiere
  const cartiere = {};
  stare.rapoarte.forEach((r) => {
    const k = r.cartier.trim();
    cartiere[k] = cartiere[k] || { deschise: 0, rezolvate: 0, confirmari: 0 };
    if (statusCurent(r) === "rezolvat") cartiere[k].rezolvate += 1;
    else cartiere[k].deschise += 1;
    cartiere[k].confirmari += r.confirmari;
  });
  const randuri = Object.entries(cartiere).sort((a, b) => b[1].deschise - a[1].deschise || b[1].confirmari - a[1].confirmari).slice(0, 7);
  const maxDeschise = Math.max(1, ...randuri.map(([, v]) => v.deschise));
  $("tabel-cartiere").querySelector("tbody").innerHTML = randuri.map(([nume, v]) => `
    <tr>
      <td>${escapeHtml(nume)}</td>
      <td><span class="mini-bara" style="width:${(v.deschise / maxDeschise) * 40}px"></span>${v.deschise}</td>
      <td>${v.rezolvate}</td>
      <td>${v.confirmari}</td>
    </tr>`).join("");

  const recente = stare.rapoarte
    .filter((r) => statusCurent(r) === "rezolvat")
    .sort((a, b) => momentStatus(b, "rezolvat") - momentStatus(a, "rezolvat"))
    .slice(0, 5);
  $("rezolvate-recent").innerHTML = recente.length ? recente.map((r) => `
    <li data-detalii="${r.id}">
      <strong>${escapeHtml(r.titlu)}</strong>
      <span>${cod(r)} · ${escapeHtml(r.cartier)} · în ${zileIntre(creat(r), momentStatus(r, "rezolvat"))} zile</span>
    </li>`).join("") : '<li><span>Încă nu s-a rezolvat nimic.</span></li>';

  const toti = [...CETATENI, { nume: "Tu", cartier: "Cartierul tău", puncte: stare.puncte, eu: true }]
    .sort((a, b) => b.puncte - a.puncte || (a.eu ? 1 : -1));
  $("clasament").innerHTML = toti.slice(0, 8).map((v, i) => `
    <li class="${v.eu ? "eu" : ""}">
      <span class="loc">#${String(i + 1).padStart(2, "0")}</span>
      ${avatar(v.nume)}
      <span class="clasament-nume"><strong>${escapeHtml(v.nume)}</strong><span>${escapeHtml(v.cartier)}</span></span>
      <span class="clasament-puncte">${v.puncte} pct</span>
    </li>`).join("");
}

/* ---------- Panouri laterale ---------- */
let panouDeschis = null;

function deschidePanou(id) {
  if (panouDeschis && panouDeschis !== id) $(panouDeschis).classList.remove("deschis");
  panouDeschis = id;
  const u = $("umbra");
  u.hidden = false;
  requestAnimationFrame(() => u.classList.add("vizibil"));
  $(id).classList.add("deschis");
  $(id).setAttribute("aria-hidden", "false");
}

function inchidePanou() {
  if (!panouDeschis) return;
  const id = panouDeschis;
  $(id).classList.remove("deschis");
  $(id).setAttribute("aria-hidden", "true");
  $("umbra").classList.remove("vizibil");
  setTimeout(() => { if (!panouDeschis) $("umbra").hidden = true; }, 260);
  panouDeschis = null;
  if (id === "panou-detalii") {
    idDetalii = null;
    if (location.hash.startsWith("#sesizare-")) history.replaceState(null, "", location.pathname + location.search);
  }
}

$("umbra").addEventListener("click", inchidePanou);
document.querySelectorAll(".panou-lateral").forEach((p) => p.addEventListener("click", (e) => {
  if (e.target.closest("[data-inchide]")) inchidePanou();
}));

/* ---------- Detalii ---------- */
let idDetalii = null;

function randeazaDetalii(id) {
  const r = stare.rapoarte.find((x) => x.id === id);
  if (!r) return;
  idDetalii = id;
  const st = statusCurent(r);
  const confirmat = stare.confirmate.includes(r.id);
  const urmarit = stare.urmarite.includes(r.id);
  const zile = zileIntre(creat(r), st === "rezolvat" ? momentStatus(r, "rezolvat") : Date.now());
  const pasi = [["nou", "Trimisă"], ["lucru", "Preluată de echipe"], ["rezolvat", "Rezolvată"]];

  $("detalii-continut").innerHTML = `
    <div class="detalii-cap cat-${r.categorie}">
      <button type="button" class="btn-x" data-inchide aria-label="Închide"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      <div class="detalii-eticheta">
        <span class="raport-cat">${svg(r.categorie)}${CATEGORII[r.categorie]}</span>
        <span class="status st-${st}">${STATUS[st]}</span>
        <span class="cod">${cod(r)}</span>
      </div>
      <h2>${escapeHtml(r.titlu)}</h2>
      <p class="detalii-adresa">${escapeHtml(r.adresa)}, ${escapeHtml(r.cartier)}</p>
      <div class="autor">${avatar(r.autor)}<span>Raportată de <strong>${escapeHtml(r.autor)}</strong> · ${timpRelativ(creat(r))}</span></div>
    </div>

    <div class="lateral-corp">
      ${r.foto ? `<img class="detalii-foto" src="${r.foto}" alt="Fotografia problemei">` : ""}
      <p class="detalii-descriere">${escapeHtml(r.descriere)}</p>

      <div class="info-grila">
        <div class="info"><span>confirmări</span><strong>${r.confirmari}</strong></div>
        <div class="info"><span>gravitate</span><strong>${GRAVITATE[r.gravitate]}</strong></div>
        <div class="info"><span>raportată</span><strong>${formatData(creat(r))}</strong></div>
        <div class="info"><span>${st === "rezolvat" ? "rezolvată în" : "deschisă de"}</span><strong>${zile} ${zile === 1 ? "zi" : "zile"}</strong></div>
      </div>

      <p class="subtitlu">Cronologie</p>
      <ol class="cronologie">
        ${pasi.map(([s, t]) => {
          const ts = momentStatus(r, s);
          return `<li class="${ts ? "facut st-" + s : ""}"><span>${t}</span><time>${ts ? formatData(ts) : "în așteptare"}</time></li>`;
        }).join("")}
      </ol>

      <p class="subtitlu">Comentarii (${r.comentarii.length})</p>
      ${r.comentarii.length ? `<ul class="comentarii">${r.comentarii.map((c) => `
        <li class="comentariu">${avatar(c.autor)}
          <div class="comentariu-corp"><b>${escapeHtml(c.autor)}</b><time>${timpRelativ(c.ts)}</time><p>${escapeHtml(c.text)}</p></div>
        </li>`).join("")}</ul>` : '<p class="fara">Niciun comentariu. Știi ceva nou despre problemă?</p>'}
      <form class="form-comentariu" id="form-comentariu">
        <input type="text" maxlength="200" placeholder="Adaugă o actualizare utilă" aria-label="Comentariu" required>
        <button type="submit" class="btn btn-contur">Trimite</button>
      </form>
    </div>

    <div class="detalii-jos">
      <button type="button" class="btn btn-text" data-act="urmareste">${svg("ochi")}${urmarit ? "Urmărești" : "Urmărește"}</button>
      <button type="button" class="btn btn-text" data-act="copiaza">${svg("link")}Link</button>
      <button type="button" class="btn btn-text" data-act="harta">${svg("loc")}Pe hartă</button>
      ${st !== "rezolvat" ? `<button type="button" class="btn btn-text" data-act="rezolvat">${svg("bifa")}S-a rezolvat?</button>` : ""}
      <span class="spatiu"></span>
      ${confirmat
        ? `<button type="button" class="btn btn-ok" data-act="anuleaza-confirmare">${svg("bifa")}Ai confirmat</button>`
        : st === "rezolvat" ? "" : `<button type="button" class="btn btn-semnal" data-act="confirma">${svg("confirm")}Am văzut și eu</button>`}
    </div>`;
}

function deschideDetalii(id) {
  if (harta.map) harta.map.closePopup();
  randeazaDetalii(id);
  deschidePanou("panou-detalii");
  history.replaceState(null, "", `#sesizare-${id}`);
}

$("panou-detalii").addEventListener("click", (e) => {
  const t = e.target.closest("[data-act]");
  if (!t || idDetalii == null) return;
  const id = idDetalii;
  const act = t.dataset.act;
  if (act === "confirma") confirma(id);
  else if (act === "anuleaza-confirmare") anuleazaConfirmare(id);
  else if (act === "urmareste") urmareste(id);
  else if (act === "copiaza") copiazaLink(id);
  else if (act === "rezolvat") marcheazaRezolvat(id);
  else if (act === "harta") {
    inchidePanou();
    $("harta-sectiune").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => selecteaza(id), 350);
  }
});

$("panou-detalii").addEventListener("submit", (e) => {
  if (e.target.id !== "form-comentariu") return;
  e.preventDefault();
  comenteaza(idDetalii, e.target.querySelector("input").value);
});

/* ---------- Profil ---------- */
function randeazaProfil() {
  const n = nivelCurent(stare.puncte);
  const deblocate = insigneDeblocate();
  let progres = 100;
  let text = "nivel maxim atins";
  if (n.urmator) {
    progres = ((stare.puncte - n.prag) / (n.urmator.prag - n.prag)) * 100;
    text = `${n.urmator.prag - stare.puncte} pct până la ${n.urmator.nume}`;
  }
  $("profil-continut").innerHTML = `
    <div class="profil-card">
      <span class="avatar avatar-tu avatar-mare">TU</span>
      <div><h3>${n.nume}</h3><p>${stare.puncte} pct · ${deblocate.length}/${INSIGNE.length} insigne</p></div>
    </div>
    <div>
      <div class="nivel-text"><span>${text}</span><span>${Math.round(progres)}%</span></div>
      <div class="nivel-bara"><div style="width:${progres}%"></div></div>
    </div>
    <div class="mini-cifre">
      <div class="mini-cifra"><b>${stare.ale_mele.length}</b><span>sesizări</span></div>
      <div class="mini-cifra"><b>${stare.confirmate.length}</b><span>confirmări</span></div>
      <div class="mini-cifra"><b>${stare.urmarite.length}</b><span>urmărite</span></div>
    </div>
    <p class="subtitlu">Insigne</p>
    <div class="insigne">
      ${INSIGNE.map((i) => `
        <div class="insigna cat-${i.cat} ${deblocate.includes(i.nume) ? "" : "blocata"}">
          <span class="insigna-icon">${svg(i.icon)}</span>${i.nume}
        </div>`).join("")}
    </div>
    <p class="subtitlu">Activitate</p>
    ${stare.istoric.length
      ? `<ul class="istoric">${stare.istoric.slice(0, 10).map((a) => `<li><span>${escapeHtml(a.text)}</span><time>${timpRelativ(a.ts)}</time></li>`).join("")}</ul>`
      : '<p class="fara">Nicio activitate încă. Confirmă o sesizare sau raportează o problemă.</p>'}
    <button type="button" class="btn btn-pericol" id="reseteaza-date">Șterge datele salvate</button>`;
}

$("deschide-profil").addEventListener("click", () => { randeazaProfil(); deschidePanou("panou-profil"); });

$("profil-continut").addEventListener("click", (e) => {
  if (e.target.id !== "reseteaza-date") return;
  if (!confirm("Sigur vrei să ștergi toate datele salvate în acest browser?")) return;
  try { Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k)); } catch { /* ignoră */ }
  location.reload();
});

/* ---------- Randare generală ---------- */
function randeazaTot() {
  randeazaFiltre();
  randeazaLista();
  randeazaCifre();
  randeazaRaport();
  if (panouDeschis === "panou-profil") randeazaProfil();
  if (idDetalii != null) randeazaDetalii(idDetalii);
}

/* =========================================================
   ACȚIUNI
   ========================================================= */
function castiga(puncte, text) {
  const nivelVechi = nivelCurent(stare.puncte).nume;
  const insigneVechi = insigneDeblocate();
  stare.puncte += puncte;
  adaugaIstoric(text);
  return () => {
    const noi = insigneDeblocate().filter((i) => !insigneVechi.includes(i));
    if (noi.length) return `Insignă nouă: „${noi[0]}”`;
    const nivelNou = nivelCurent(stare.puncte).nume;
    if (nivelNou !== nivelVechi) return `Nivel nou: ${nivelNou}`;
    return null;
  };
}

function confirma(id) {
  const r = stare.rapoarte.find((x) => x.id === id);
  if (!r || stare.confirmate.includes(id)) return;
  const verifica = castiga(PUNCTE.confirmare, `Ai confirmat ${cod(r)}`);
  r.confirmari += 1;
  stare.confirmate.push(id);
  salveazaTot();
  randeazaTot();
  notifica(verifica() || `Confirmat · +${PUNCTE.confirmare} pct · ${r.confirmari} confirmări în total`);
}

function anuleazaConfirmare(id) {
  const r = stare.rapoarte.find((x) => x.id === id);
  if (!r || !stare.confirmate.includes(id)) return;
  r.confirmari = Math.max(0, r.confirmari - 1);
  stare.confirmate = stare.confirmate.filter((x) => x !== id);
  stare.puncte = Math.max(0, stare.puncte - PUNCTE.confirmare);
  adaugaIstoric(`Ai retras confirmarea pentru ${cod(r)}`);
  salveazaTot();
  randeazaTot();
  notifica("Confirmarea a fost retrasă.");
}

function urmareste(id) {
  const da = stare.urmarite.includes(id);
  stare.urmarite = da ? stare.urmarite.filter((x) => x !== id) : [...stare.urmarite, id];
  salveazaTot();
  randeazaTot();
  notifica(da ? "Nu mai urmărești sesizarea." : "Urmărești sesizarea. O găsești cu butonul cu ochi din listă.");
}

function marcheazaRezolvat(id) {
  const r = stare.rapoarte.find((x) => x.id === id);
  if (!r || statusCurent(r) === "rezolvat") return;
  if (!momentStatus(r, "lucru")) r.istoric.push({ status: "lucru", ts: Date.now() - 1000 });
  r.istoric.push({ status: "rezolvat", ts: Date.now() });
  adaugaIstoric(`Ai semnalat că ${cod(r)} s-a rezolvat`);
  salveazaTot();
  randeazaTot();
  notifica(`${cod(r)} a fost marcată ca rezolvată.`);
}

function comenteaza(id, text) {
  const r = stare.rapoarte.find((x) => x.id === id);
  if (!r || !text.trim()) return;
  const verifica = castiga(PUNCTE.comentariu, `Ai comentat la ${cod(r)}`);
  r.comentarii.push({ autor: "Tu", text: text.trim(), ts: Date.now() });
  stare.comentarii += 1;
  salveazaTot();
  randeazaTot();
  notifica(verifica() || `Comentariu adăugat · +${PUNCTE.comentariu} pct`);
}

async function copiazaLink(id) {
  const url = `${location.href.split("#")[0]}#sesizare-${id}`;
  try {
    await navigator.clipboard.writeText(url);
    notifica("Linkul a fost copiat.");
  } catch {
    notifica("Nu am putut copia linkul automat.");
  }
}

/* ---------- Evenimente: listă și filtre ---------- */
$("lista").addEventListener("click", (e) => {
  const el = e.target.closest(".raport");
  if (!el) return;
  const id = Number(el.dataset.id);
  if (stare.selectat === id || !harta.map) deschideDetalii(id);
  else selecteaza(id);
});

$("lista").addEventListener("keydown", (e) => {
  const el = e.target.closest(".raport");
  if (el && e.key === "Enter") deschideDetalii(Number(el.dataset.id));
});

$("filtre").addEventListener("click", (e) => {
  const f = e.target.closest(".filtru");
  if (!f) return;
  stare.filtre.categorie = f.dataset.cat;
  randeazaFiltre();
  randeazaLista();
});

$("segment-status").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  stare.filtre.status = b.dataset.status;
  $("segment-status").querySelectorAll("button").forEach((x) => x.classList.toggle("activ", x === b));
  randeazaLista();
});

let intarziere;
$("cautare").addEventListener("input", (e) => {
  clearTimeout(intarziere);
  intarziere = setTimeout(() => { stare.filtre.termen = e.target.value; randeazaLista(); }, 150);
});

$("sortare").addEventListener("change", (e) => { stare.filtre.sortare = e.target.value; randeazaLista(); });

function legaComutator(id, cheie) {
  $(id).addEventListener("click", () => {
    stare.filtre[cheie] = !stare.filtre[cheie];
    $(id).setAttribute("aria-pressed", stare.filtre[cheie]);
    randeazaLista();
  });
}
legaComutator("doar-urmarite", "urmarite");
legaComutator("doar-ale-mele", "mele");

function reseteazaFiltre() {
  stare.filtre = { categorie: "toate", status: "toate", termen: "", sortare: stare.filtre.sortare, urmarite: false, mele: false };
  $("cautare").value = "";
  $("doar-urmarite").setAttribute("aria-pressed", "false");
  $("doar-ale-mele").setAttribute("aria-pressed", "false");
  $("segment-status").querySelectorAll("button").forEach((x) => x.classList.toggle("activ", x.dataset.status === "toate"));
  randeazaFiltre();
  randeazaLista();
}
$("reseteaza-filtre").addEventListener("click", reseteazaFiltre);

/* ---------- Raportare ---------- */
const form = $("form-raport");
const raportNou = { loc: null, foto: null };

$("alegeri-categorie").innerHTML = Object.entries(CATEGORII).map(([cheie, nume], i) => `
  <div class="alegere-cat cat-${cheie}">
    <input type="radio" name="categorie" id="cat-${cheie}" value="${cheie}" ${i === 0 ? "checked" : ""}>
    <label for="cat-${cheie}">${svg(cheie)}${nume}</label>
  </div>`).join("");

function actualizeazaLocatie() {
  const are = !!raportNou.loc;
  $("locatie").classList.toggle("aleasa", are);
  $("locatie-text").textContent = are ? `✓ ${raportNou.loc.lat.toFixed(5)}, ${raportNou.loc.lng.toFixed(5)}` : "Nicio locație aleasă";
  $("alege-pe-harta").textContent = are ? "Schimbă locul" : "Alege pe hartă";
  $("trimite").disabled = !are;
  $("nota-locatie").textContent = are ? "Gata de trimis." : "Alege locația ca să poți trimite.";
}

function deschideRaportare() {
  actualizeazaLocatie();
  deschidePanou("panou-raport");
}

function golesteFormular() {
  form.reset();
  raportNou.loc = null;
  raportNou.foto = null;
  $("previzualizare").classList.add("hidden");
  $("fisier-text").textContent = "+ Alege o imagine (o micșorăm automat)";
  $("contor-descriere").textContent = "0/300";
  $("eroare-raport").textContent = "";
  if (harta.temp) { harta.map.removeLayer(harta.temp); harta.temp = null; }
  actualizeazaLocatie();
}

document.querySelectorAll("[data-raporteaza]").forEach((b) => b.addEventListener("click", deschideRaportare));

form.descriere.addEventListener("input", () => { $("contor-descriere").textContent = `${form.descriere.value.length}/300`; });

function pornesteAlegere() {
  if (!harta.map) return;
  inchidePanou();
  harta.alegere = true;
  $("harta").classList.add("alegere");
  $("banner-alegere").classList.remove("hidden");
  $("harta-sectiune").scrollIntoView({ behavior: "smooth" });
}

function opresteAlegere() {
  harta.alegere = false;
  $("harta").classList.remove("alegere");
  $("banner-alegere").classList.add("hidden");
}

function alegeLoc(latlng, redeschide = true) {
  raportNou.loc = { lat: latlng.lat, lng: latlng.lng };
  if (harta.map) {
    if (harta.temp) harta.temp.setLatLng(latlng);
    else harta.temp = L.marker(latlng, { icon: L.divIcon({ className: "", html: '<div class="marcaj-nou-loc"></div>', iconSize: [20, 20], iconAnchor: [10, 10] }), zIndexOffset: 2000 }).addTo(harta.map);
  }
  if (harta.alegere) {
    opresteAlegere();
    if (redeschide) setTimeout(deschideRaportare, 200);
  }
  actualizeazaLocatie();
}

$("alege-pe-harta").addEventListener("click", pornesteAlegere);
$("anuleaza-alegere").addEventListener("click", () => { opresteAlegere(); deschideRaportare(); });

$("locatia-mea").addEventListener("click", () => {
  if (!navigator.geolocation) return notifica("Browserul nu permite aflarea locației.");
  $("locatie-text").textContent = "Caut locația...";
  navigator.geolocation.getCurrentPosition(
    (p) => {
      const ll = { lat: p.coords.latitude, lng: p.coords.longitude };
      alegeLoc(ll, false);
      if (harta.map) harta.map.setView([ll.lat, ll.lng], 16);
    },
    () => { actualizeazaLocatie(); notifica("Nu am putut afla locația. Alege locul pe hartă."); },
    { timeout: 8000 },
  );
});

$("foto").addEventListener("change", (e) => {
  const fisier = e.target.files[0];
  const prev = $("previzualizare");
  if (!fisier) { raportNou.foto = null; prev.classList.add("hidden"); return; }
  const img = new Image();
  img.onload = () => {
    const scara = Math.min(1, 800 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scara);
    c.height = Math.round(img.height * scara);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    raportNou.foto = c.toDataURL("image/jpeg", 0.7);
    prev.src = raportNou.foto;
    prev.classList.remove("hidden");
    $("fisier-text").textContent = `✓ ${fisier.name}`;
    URL.revokeObjectURL(img.src);
  };
  img.onerror = () => notifica("Fișierul ales nu pare să fie o imagine.");
  img.src = URL.createObjectURL(fisier);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const d = new FormData(form);
  const titlu = String(d.get("titlu") || "").trim();
  const descriere = String(d.get("descriere") || "").trim();
  const adresa = String(d.get("adresa") || "").trim();
  const cartier = String(d.get("cartier") || "").trim();
  let eroare = "";
  if (!raportNou.loc) eroare = "Alege mai întâi locul problemei.";
  else if (!titlu) eroare = "Scrie un titlu scurt.";
  else if (!descriere) eroare = "Adaugă o descriere.";
  else if (!adresa || !cartier) eroare = "Completează adresa și cartierul.";
  $("eroare-raport").textContent = eroare;
  if (eroare) return;

  const r = {
    id: Date.now(),
    categorie: d.get("categorie"),
    titlu, descriere, adresa, cartier,
    lat: raportNou.loc.lat,
    lng: raportNou.loc.lng,
    gravitate: Number(d.get("gravitate")) || 2,
    confirmari: 1,
    autor: "Tu",
    foto: raportNou.foto,
    comentarii: [],
    istoric: [{ status: "nou", ts: Date.now() }],
  };
  const verifica = castiga(PUNCTE.raport, `Ai raportat ${cod(r)} — ${titlu}`);
  stare.rapoarte.unshift(r);
  stare.ale_mele.push(r.id);
  stare.urmarite.push(r.id);
  salveazaTot();

  golesteFormular();
  inchidePanou();
  reseteazaFiltre();
  randeazaTot();
  $("harta-sectiune").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => selecteaza(r.id), 400);
  notifica(verifica() || `${cod(r)} adăugată pe hartă · +${PUNCTE.raport} pct`);
});

/* ---------- Diverse ---------- */
if (stare.introAscuns) $("intro").classList.add("hidden");
$("ascunde-intro").addEventListener("click", () => {
  $("intro").classList.add("hidden");
  salveaza("intro_ascuns", true);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (harta.alegere) { opresteAlegere(); deschideRaportare(); return; }
    inchidePanou();
  }
  if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
    e.preventDefault();
    $("cautare").focus();
  }
});

// evidențiază în meniu secțiunea vizibilă
if ("IntersectionObserver" in window) {
  const linkuri = document.querySelectorAll(".meniu a");
  const obs = new IntersectionObserver((intrari) => {
    intrari.forEach((i) => {
      if (!i.isIntersecting) return;
      linkuri.forEach((a) => a.classList.toggle("activ", a.getAttribute("href") === `#${i.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["harta-sectiune", "raport", "cum", "quiz", "intrebari"].forEach((id) => obs.observe($(id)));
}

/* =========================================================
   QUIZ
   ========================================================= */
const INTREBARI = [
  {
    text: "Ce face ca o sesizare să fie ușor de rezolvat?",
    variante: [
      "Un titlu scurt, de exemplu „E rău aici”",
      "Locul exact, o descriere clară și, dacă se poate, o fotografie",
      "Cât mai multe semne de exclamare",
    ],
    corect: 1,
  },
  {
    text: "Vezi pe hartă că problema ta a fost deja raportată. Ce e cel mai util?",
    variante: [
      "O raportezi încă o dată, ca să fie mai multe",
      "O ignori, oricum s-a ocupat altcineva",
      "Apeși „Am văzut și eu” și adaugi un comentariu dacă știi ceva nou",
    ],
    corect: 2,
  },
  {
    text: "Pe trotuar sunt fire electrice căzute. Ce faci mai întâi?",
    variante: [
      "Te ții la distanță și suni la 112; abia apoi faci sesizarea",
      "Te apropii ca să faci o fotografie clară",
      "Le dai la o parte cu un băț",
    ],
    corect: 0,
  },
  {
    text: "Ce NU ar trebui să se vadă clar într-o fotografie publică?",
    variante: [
      "Groapa din asfalt",
      "Fețele trecătorilor și numerele de înmatriculare",
      "Indicatorul cu numele străzii",
    ],
    corect: 1,
  },
  {
    text: "Cine se ocupă, de obicei, de iluminatul public și de gropile de pe străzile unui oraș?",
    variante: [
      "Poliția rutieră",
      "Școlile din cartier",
      "Primăria, prin serviciile ei sau firmele cu care are contract",
    ],
    corect: 2,
  },
];

const quiz = { index: 0, scor: 0, raspuns: false };
const butonStart = $("start");
const butonUrmator = $("urmatoarea");
const butonReia = $("reia");
const zonaScor = $("scor");
const zonaIntrebare = $("intrebare");
const zonaRaspunsuri = $("raspunsuri");
const zonaMesaj = $("mesaj");

function actualizeazaProgresQuiz() {
  const total = INTREBARI.length;
  $("progres-quiz").textContent = `întrebarea ${Math.min(quiz.index + 1, total)}/${total}`;
  $("bara-quiz").style.width = `${(quiz.index / total) * 100}%`;
  zonaScor.textContent = "Scor: " + quiz.scor;
}

function afiseazaIntrebare() {
  const intrebare = INTREBARI[quiz.index];
  quiz.raspuns = false;
  zonaIntrebare.textContent = intrebare.text;
  zonaMesaj.textContent = "";
  zonaMesaj.className = "";
  zonaRaspunsuri.innerHTML = "";
  butonUrmator.hidden = true;
  intrebare.variante.forEach((varianta, i) => {
    const buton = document.createElement("button");
    buton.type = "button";
    buton.innerHTML = `<span class="litera">${"ABC"[i]}</span>`;
    buton.append(varianta);
    buton.addEventListener("click", () => verifica(i));
    zonaRaspunsuri.appendChild(buton);
  });
  actualizeazaProgresQuiz();
}

function verifica(alegere) {
  if (quiz.raspuns) return; // la o întrebare se poate răspunde o singură dată
  quiz.raspuns = true;
  const intrebare = INTREBARI[quiz.index];
  const butoane = zonaRaspunsuri.querySelectorAll("button");
  butoane.forEach((b) => { b.disabled = true; });
  butoane[intrebare.corect].classList.add("corect");
  if (alegere === intrebare.corect) {
    quiz.scor += 10;
    zonaMesaj.textContent = "✓ Corect! +10 puncte";
    zonaMesaj.className = "bine";
  } else {
    butoane[alegere].classList.add("gresit");
    zonaMesaj.textContent = "✗ Răspunsul corect era: " + intrebare.variante[intrebare.corect];
    zonaMesaj.className = "rau";
  }
  zonaScor.textContent = "Scor: " + quiz.scor;
  butonUrmator.textContent = quiz.index === INTREBARI.length - 1 ? "Vezi rezultatul" : "Următoarea întrebare";
  butonUrmator.hidden = false;
}

function afiseazaFinal() {
  const maxim = INTREBARI.length * 10;
  let verdict = "Mai citește întrebările frecvente și încearcă din nou.";
  if (quiz.scor === maxim) verdict = "Excelent! Știi exact cum se face o sesizare utilă și sigură.";
  else if (quiz.scor >= maxim * 0.6) verdict = "Foarte bine! Mai ai câteva detalii de prins.";
  $("progres-quiz").textContent = "gata";
  $("bara-quiz").style.width = "100%";
  zonaIntrebare.textContent = "Rezultat";
  zonaRaspunsuri.innerHTML = `<div class="quiz-final"><strong>${quiz.scor}/${maxim}</strong>puncte</div>`;
  zonaMesaj.textContent = verdict;
  zonaMesaj.className = quiz.scor >= maxim * 0.6 ? "bine" : "";
  butonUrmator.hidden = true;
  butonReia.hidden = false;
}

function pornesteQuiz() {
  butonStart.hidden = true;
  butonReia.hidden = true;
  quiz.index = 0;
  quiz.scor = 0;
  afiseazaIntrebare();
}

butonStart.addEventListener("click", pornesteQuiz);
butonReia.addEventListener("click", pornesteQuiz);
butonUrmator.addEventListener("click", () => {
  quiz.index += 1;
  if (quiz.index < INTREBARI.length) afiseazaIntrebare();
  else afiseazaFinal();
});

/* ---------- Pornire ---------- */
initHarta();
randeazaTot();
actualizeazaLocatie();
pornesteAnimatieCifre();

const potrivire = location.hash.match(/^#sesizare-(\d+)$/);
if (potrivire && stare.rapoarte.some((r) => r.id === Number(potrivire[1]))) deschideDetalii(Number(potrivire[1]));
