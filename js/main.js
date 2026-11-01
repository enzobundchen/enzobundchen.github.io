const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- menu ---------- */
const nav = $('#nav'), menu = $('#menu');
const fechaMenu = () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); };
menu.addEventListener('click', () => menu.setAttribute('aria-expanded', nav.classList.toggle('open')));
nav.addEventListener('click', e => { if (e.target.closest('a')) fechaMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') fechaMenu(); });

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

/* ---------- carrosséis de tecnologias ---------- */
$$('.strip').forEach(el => {
  const itens = [...el.children], dir = +el.dataset.dir;
  itens.forEach(li => {
    const c = li.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    el.append(c);
  });
  let pos = 0, volta = 0, parado = false, arrasto = null, ultimo = 0;
  const mede = () => { volta = el.children[itens.length].offsetLeft - el.children[0].offsetLeft; };
  const ajusta = () => { if (volta) pos = ((pos % volta) + volta) % volta; };
  mede();
  addEventListener('load', mede);
  addEventListener('resize', mede);
  if (dir < 0) pos = volta - 1;
  el.scrollLeft = pos;

  el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') parado = true; });
  el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && arrasto === null) parado = false; });
  el.addEventListener('touchstart', () => { parado = true; }, { passive: true });
  el.addEventListener('touchend', () => { setTimeout(() => { pos = el.scrollLeft; ajusta(); parado = false; }, 900); });
  el.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    arrasto = e.clientX;
    el.classList.add('drag');
  });
  addEventListener('pointermove', e => {
    if (arrasto === null) return;
    pos -= e.clientX - arrasto;
    arrasto = e.clientX;
    ajusta();
    el.scrollLeft = pos;
  });
  addEventListener('pointerup', () => {
    if (arrasto === null) return;
    arrasto = null;
    el.classList.remove('drag');
    parado = el.matches(':hover');
  });

  if (calmo) return;
  const anda = t => {
    const dt = Math.min(t - ultimo, 50);
    ultimo = t;
    if (!parado) {
      pos += dt * 0.04 * dir;
      ajusta();
      el.scrollLeft = pos;
    }
    requestAnimationFrame(anda);
  };
  requestAnimationFrame(t => { ultimo = t; anda(t); });
});

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
