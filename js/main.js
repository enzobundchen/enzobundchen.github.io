const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- menu ---------- */
const nav = $('#nav'), menu = $('#menu');
const fechaMenu = () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); };
menu.addEventListener('click', () => menu.setAttribute('aria-expanded', nav.classList.toggle('open')));
nav.addEventListener('click', e => { if (e.target.closest('a')) fechaMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') fechaMenu(); });
document.addEventListener('click', e => { if (!e.target.closest('.top')) fechaMenu(); });

/* ---------- seção atual no menu ---------- */
const links = $$('a', nav);
const secoes = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  links.forEach(a => a.toggleAttribute('aria-current', false));
  const a = links.find(l => l.getAttribute('href') === '#' + e.target.id);
  if (a) a.setAttribute('aria-current', 'true');
}), { rootMargin: '-30% 0px -65% 0px' });
$$('main section').forEach(s => secoes.observe(s));

/* ---------- barra de progresso ---------- */
const barra = $('#progress');
const progresso = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  barra.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
};
addEventListener('scroll', progresso, { passive: true });
addEventListener('resize', progresso);
progresso();

/* ---------- entrada ao rolar ---------- */
const entrada = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  entrada.unobserve(e.target);
}), { rootMargin: '0px 0px -8% 0px' });
$$('.reveal').forEach(el => entrada.observe(el));

/* ---------- contadores do topo ---------- */
if (!calmo) $$('[data-count]').forEach(el => {
  const alvo = +el.dataset.count, ini = performance.now(), dur = 900;
  const passo = t => {
    const f = Math.min((t - ini) / dur, 1);
    el.textContent = Math.round(alvo * (1 - (1 - f) ** 3));
    if (f < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
});

/* ---------- telas dos projetos ---------- */
$$('[data-gallery]').forEach(g => {
  const img = $('[data-main]', g), bts = $$('.thumbs button', g);
  bts.forEach(b => {
    new Image().src = b.dataset.src;
    b.addEventListener('click', () => {
      img.src = b.dataset.src;
      img.alt = b.dataset.alt;
      bts.forEach(x => x.setAttribute('aria-pressed', x === b));
    });
  });
});

/* ---------- fluxo ---------- */
const FLOW = [
  { n: 'Solid Edge', t: 'Presto suporte aos projetistas, atualizo e subo dos templates, desenvolvo macros para eliminar tarefas repetitivas e resolvo problemas da aplicação CAD.', l: ['Suporte aos projetistas', 'Manutenção de templates', 'Macros e APIs de automação'] },
  { n: 'SEEC', t: 'Liga o Solid Edge ao Teamcenter. Monitoro a integração, analiso e resolvo os incidentes.', l: ['Monitoramento da integração', 'Análise e resolução de incidentes'] },
  { n: 'Teamcenter', t: 'Atuo como Key User e administro o ambiente. Desenvolvo workflows, gerencio BOMs, presto suporte aos usuários e resolvo incidentes.', l: ['Administração do ambiente', 'Desenvolvimento de workflows', 'Gerenciamento de BOMs', 'Suporte aos usuários'] },
  { n: 'T4EA', t: 'Leva os dados do Teamcenter para o Focco. Acompanho a transferência e investigo as divergências entre os dois sistemas.', l: ['Monitoramento da integração', 'Investigação de divergências de cadastro'] },
  { n: 'Focco', t: 'Tenho domínio do cadastro de itens e estruturas, crio validações na estrutura, auxilio no desenvolvimento do configurador de produto e o PDM com grupos, modificadores e atributos.', l: ['Cadastro de itens e estruturas', 'Criação de validações', 'Configurador de produto', 'PDM com modificadores e atributos'] }
];
const flow = $('#flow'), detalhe = $('#flowdetail');
const mostraEtapa = i => {
  const f = FLOW[i];
  $$('button', flow).forEach((b, n) => b.setAttribute('aria-pressed', n === i));
  detalhe.innerHTML = `<div><h3>${f.n}</h3><p>${f.t}</p></div><div><p class="lab">O que faço aqui</p><ul class="ticks">${f.l.map(x => `<li>${x}</li>`).join('')}</ul></div>`;
};
flow.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b) mostraEtapa(+b.dataset.i);
});
mostraEtapa(0);

/* ---------- grade de tecnologias: lente que amplia sob o ponteiro, valores padrão do Expanding Grid ---------- */
const G = { colunas: 12, tile: 0.36, ampliar: 1.5, lente: 1.3, preencher: 0.92, raio: 0.14, apagado: 0.45, seguir: 0.45 };
const grade = $('#techs');
const itens = $$('li', grade).map(li => ({
  nome: li.textContent.trim(),
  src: $('img', li).getAttribute('src'),
  grupo: li.parentElement.getAttribute('aria-label')
}));
const tela = document.createElement('canvas');
const nome = document.createElement('p');
const aviso = document.createElement('p');
nome.className = 'techs__nome';
nome.setAttribute('aria-hidden', 'true');
aviso.className = 'techs__aviso';
aviso.setAttribute('aria-live', 'polite');
grade.append(tela, nome, aviso);
grade.tabIndex = 0;
grade.setAttribute('role', 'group');
grade.setAttribute('aria-label', 'Grade de tecnologias. Use as setas para percorrer e Enter para abrir.');

const ctx = tela.getContext('2d');
const SPRITE = 200;
const suave = x => { const t = Math.min(Math.max(x, 0), 1); return t * t * (3 - 2 * t); };

const fazSprite = img => {
  const c = document.createElement('canvas');
  c.width = c.height = SPRITE;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.fillStyle = '#1C1C20';
  x.beginPath();
  x.roundRect(0, 0, SPRITE, SPRITE, SPRITE * G.raio);
  x.fill();
  const m = SPRITE * 0.14, l = SPRITE - m * 2, e = l / Math.max(img.naturalWidth, img.naturalHeight);
  const iw = img.naturalWidth * e, ih = img.naturalHeight * e;
  x.drawImage(img, (SPRITE - iw) / 2, (SPRITE - ih) / 2, iw, ih);
  const cinza = document.createElement('canvas');
  cinza.width = cinza.height = SPRITE;
  const d = x.getImageData(0, 0, SPRITE, SPRITE);
  for (let i = 0; i < d.data.length; i += 4) {
    d.data[i] = d.data[i + 1] = d.data[i + 2] = d.data[i] * 0.299 + d.data[i + 1] * 0.587 + d.data[i + 2] * 0.114;
  }
  cinza.getContext('2d').putImageData(d, 0, 0);
  return { cor: c, cinza };
};

let L = 0, A = 0, cel = 1, cols = 1, linhas = 1, topoY = 0, tiles = [];
let dentro = false, teclado = false, visivel = false, antes = 0, pronto = false, iniciada = false;
let aberto = null, fechando = null, pAberto = 0;
const lente = { x: 0, y: 0 }, alvo = { x: 0, y: 0 };

const monta = () => {
  const r = grade.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
  if (!r.width || !r.height) return;
  L = r.width; A = r.height;
  tela.width = L * dpr; tela.height = A * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cols = L >= 900 ? G.colunas : L >= 560 ? 8 : 6;
  cel = L / cols;
  linhas = Math.max(Math.floor(A / cel), 1);
  topoY = (A - linhas * cel) / 2;
  tiles = [];
  for (let y = 0; y < linhas; y++) for (let x = 0; x < cols; x++) {
    tiles.push({ x: (x + 0.5) * cel, y: topoY + (y + 0.5) * cel, item: itens[(x * 7 + y * 11) % itens.length], f: 0 });
  }
  aberto = fechando = null;
  pAberto = 0;
  grade.classList.remove('aberto');
  if (!iniciada) { iniciada = true; lente.x = alvo.x = L / 2; lente.y = alvo.y = A / 2; }
};
const tileEm = (x, y) => {
  const c = Math.min(Math.max(Math.floor(x / cel), 0), cols - 1);
  const l = Math.min(Math.max(Math.floor((y - topoY) / cel), 0), linhas - 1);
  return tiles[l * cols + c];
};

const desenha = () => {
  ctx.clearRect(0, 0, L, A);
  const R = G.lente * 1.7 * cel;
  tiles.forEach(t => {
    const dx = t.x - lente.x, dy = t.y - lente.y;
    t.f = suave(1 - Math.hypot(dx, dy) / R);
    const esp = 1 + (G.ampliar - 1) * t.f;
    t.dx = lente.x + dx * esp;
    t.dy = lente.y + dy * esp;
    t.lado = cel * (G.tile + (G.preencher * G.ampliar - G.tile) * t.f);
  });
  [...tiles].sort((a, b) => a.f - b.f).forEach(t => {
    const s = t.item.sprite;
    if (!s) return;
    const base = (G.apagado + (1 - G.apagado) * t.f) * (1 - 0.82 * pAberto);
    ctx.globalAlpha = base;
    ctx.drawImage(s.cinza, t.dx - t.lado / 2, t.dy - t.lado / 2, t.lado, t.lado);
    if (t.f > 0.01) {
      ctx.globalAlpha = base * t.f;
      ctx.drawImage(s.cor, t.dx - t.lado / 2, t.dy - t.lado / 2, t.lado, t.lado);
    }
  });
  const t = aberto || fechando;
  if (t && t.item.img && pAberto > 0.001) {
    const grande = Math.min(A * 0.62, L * 0.6), p = pAberto, cy = A / 2 - 28;
    const lado = t.lado + (grande - t.lado) * p;
    const x = t.dx + (L / 2 - t.dx) * p - lado / 2, y = t.dy + (cy - t.dy) * p - lado / 2;
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#1C1C20';
    ctx.beginPath();
    ctx.roundRect(x, y, lado, lado, lado * G.raio);
    ctx.fill();
    const m = lado * 0.14, img = t.item.img, e = (lado - m * 2) / Math.max(img.naturalWidth, img.naturalHeight);
    const iw = img.naturalWidth * e, ih = img.naturalHeight * e;
    ctx.drawImage(img, x + (lado - iw) / 2, y + (lado - ih) / 2, iw, ih);
    ctx.globalAlpha = p;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#EDEDEE';
    ctx.font = "800 28px 'Big Shoulders Display', sans-serif";
    ctx.fillText(t.item.nome, L / 2, cy + grande / 2 + 34);
    ctx.fillStyle = '#9B9BA3';
    ctx.font = "500 12px 'JetBrains Mono', monospace";
    ctx.fillText(t.item.grupo, L / 2, cy + grande / 2 + 54);
  }
  ctx.globalAlpha = 1;
};

const quadro = t => {
  if (!visivel) { antes = 0; return; }
  const dt = antes ? Math.min(t - antes, 50) / 1000 : 0;
  antes = t;
  if (!dentro && !teclado && !aberto && !calmo) {
    alvo.x = L * (0.5 + 0.38 * Math.sin(t * 0.00035));
    alvo.y = A * (0.5 + 0.34 * Math.sin(t * 0.00052 + 1));
  }
  const k = calmo ? 1 : 1 - Math.exp(-dt / (G.seguir / 3));
  lente.x += (alvo.x - lente.x) * k;
  lente.y += (alvo.y - lente.y) * k;
  const fim = aberto ? 1 : 0;
  pAberto += (fim - pAberto) * (calmo ? 1 : 1 - Math.exp(-dt / 0.09));
  if (!aberto && pAberto < 0.002) { pAberto = 0; fechando = null; }
  const sob = tileEm(lente.x, lente.y);
  if (sob && nome.textContent !== sob.item.nome) nome.textContent = sob.item.nome;
  desenha();
  requestAnimationFrame(quadro);
};

const abre = t => {
  aberto = t;
  fechando = null;
  grade.classList.add('aberto');
  aviso.textContent = t.item.nome + ', ' + t.item.grupo;
};
const fecha = () => {
  fechando = aberto;
  aberto = null;
  grade.classList.remove('aberto');
};

const ponto = e => {
  const r = grade.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
};
grade.addEventListener('pointermove', e => {
  dentro = true;
  teclado = false;
  if (!aberto) Object.assign(alvo, ponto(e));
});
grade.addEventListener('pointerleave', () => { dentro = false; });
grade.addEventListener('click', e => {
  if (aberto) return fecha();
  const p = ponto(e);
  Object.assign(alvo, p);
  abre(tileEm(p.x, p.y));
});
grade.addEventListener('blur', () => { teclado = false; });
grade.addEventListener('keydown', e => {
  const passo = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
  if (passo) {
    e.preventDefault();
    if (aberto) fecha();
    const t = tileEm(alvo.x, alvo.y);
    const c = Math.min(Math.max(t.x + passo[0] * cel, cel / 2), L - cel / 2);
    const l = Math.min(Math.max(t.y + passo[1] * cel, topoY + cel / 2), topoY + (linhas - 0.5) * cel);
    teclado = true;
    alvo.x = c; alvo.y = l;
    aviso.textContent = tileEm(c, l).item.nome;
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (aberto) fecha(); else { teclado = true; abre(tileEm(alvo.x, alvo.y)); }
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && aberto) fecha(); });

new ResizeObserver(monta).observe(grade);
monta();
new IntersectionObserver(es => {
  const era = visivel;
  visivel = es[0].isIntersecting;
  if (visivel && !era) {
    if (!pronto) {
      pronto = true;
      itens.forEach(it => {
        const img = new Image();
        img.onload = () => { it.img = img; it.sprite = fazSprite(img); };
        img.src = it.src;
      });
    }
    antes = 0;
    requestAnimationFrame(quadro);
  }
}, { rootMargin: '200px' }).observe(grade);

/* ---------- cartão de contato ---------- */
const magic = $('#magic');
magic.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  const r = magic.getBoundingClientRect();
  magic.style.setProperty('--mx', e.clientX - r.left + 'px');
  magic.style.setProperty('--my', e.clientY - r.top + 'px');
  magic.style.setProperty('--brilho', 1);
});
magic.addEventListener('pointerleave', () => magic.style.setProperty('--brilho', 0));

/* ---------- copiar contato ---------- */
$('#channels').addEventListener('click', async e => {
  const b = e.target.closest('.copy');
  if (!b) return;
  try {
    await navigator.clipboard.writeText(b.dataset.t);
    b.textContent = 'Copiado';
  } catch {
    b.textContent = 'Não copiou';
  }
  setTimeout(() => { b.textContent = 'Copiar'; }, 1800);
});
