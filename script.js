/* =========================================================
   RENATA MESSIAS · SKIN CONCEPT
   Interações do site. Sem dependências externas.
   ========================================================= */
(function () {
  'use strict';

  var WHATSAPP = '5571994052950';
  var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. ANIMAÇÃO DE ENTRADA ---------- */
  (function revelarAoRolar() {
    var alvos = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduzMovimento) {
      alvos.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    alvos.forEach(function (el) { obs.observe(el); });
  })();

  /* ---------- 2. HEADER, PROGRESSO E LINK ATIVO ---------- */
  (function header() {
    var head = document.getElementById('header');
    var barra = document.getElementById('scrollProgress');
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
    var secoes = links
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);
    var tick = false;

    function atualizar() {
      var y = window.scrollY || document.documentElement.scrollTop;
      var alturaTotal = document.documentElement.scrollHeight - window.innerHeight;

      head.classList.toggle('is-scrolled', y > 12);
      if (barra) {
        barra.style.transform = 'scaleX(' + (alturaTotal > 0 ? Math.min(y / alturaTotal, 1) : 0) + ')';
      }

      // Seção visível = link destacado
      var limite = y + window.innerHeight * 0.35;
      var atual = null;
      secoes.forEach(function (s) { if (s.offsetTop <= limite) atual = s.id; });
      links.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + atual);
      });

      tick = false;
    }

    window.addEventListener('scroll', function () {
      if (!tick) { tick = true; window.requestAnimationFrame(atualizar); }
    }, { passive: true });
    window.addEventListener('resize', atualizar, { passive: true });
    atualizar();
  })();

  /* ---------- 3. MENU MOBILE ---------- */
  (function menuMobile() {
    var botao = document.getElementById('menuToggle');
    var menu = document.getElementById('mobileMenu');
    if (!botao || !menu) return;

    function abrir(estado) {
      botao.setAttribute('aria-expanded', String(estado));
      botao.setAttribute('aria-label', estado ? 'Fechar menu' : 'Abrir menu');
      menu.classList.toggle('is-open', estado);
      document.body.classList.toggle('is-locked', estado);
    }

    botao.addEventListener('click', function () {
      abrir(botao.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) abrir(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        abrir(false);
        botao.focus();
      }
    });

    // Se a tela crescer, garante que o menu não fique preso aberto
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && menu.classList.contains('is-open')) abrir(false);
    }, { passive: true });
  })();

  /* ---------- 4. FAIXA DE PALAVRAS (loop contínuo) ---------- */
  (function marquee() {
    var trilha = document.getElementById('marqueeTrack');
    if (!trilha || reduzMovimento) return;
    var grupo = trilha.querySelector('.marquee-group');
    if (grupo) trilha.appendChild(grupo.cloneNode(true));
  })();

  /* ---------- 5. ANTES E DEPOIS ---------- */
  (function antesDepois() {
    var molduras = document.querySelectorAll('[data-ba]');

    molduras.forEach(function (moldura) {
      var range = moldura.querySelector('.ba-range');
      var tagAntes = moldura.querySelector('.ba-tag--before');
      var tagDepois = moldura.querySelector('.ba-tag--after');
      if (!range) return;

      var interagiu = false;

      function aplicar(valor) {
        moldura.style.setProperty('--pos', valor + '%');
        // Some com o rótulo quando a alça passa por cima dele
        if (tagAntes) tagAntes.style.opacity = valor < 22 ? '0' : '1';
        if (tagDepois) tagDepois.style.opacity = valor > 78 ? '0' : '1';
      }

      range.addEventListener('input', function () {
        interagiu = true;
        aplicar(parseFloat(range.value));
      });
      ['pointerdown', 'keydown'].forEach(function (evt) {
        range.addEventListener(evt, function () { interagiu = true; });
      });

      aplicar(parseFloat(range.value));

      // Dica visual: ao aparecer na tela, a alça faz um vai-e-vem curto
      if (reduzMovimento || !('IntersectionObserver' in window)) return;

      var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          obs.unobserve(e.target);
          setTimeout(function () {
            if (interagiu) return;
            var inicio = null;
            var duracao = 1700;
            function passo(agora) {
              if (interagiu) return;
              if (inicio === null) inicio = agora;
              var t = Math.min((agora - inicio) / duracao, 1);
              // 50 → 74 → 28 → 50, com suavização
              var suave = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
              var valor = 50 + 24 * Math.sin(suave * Math.PI * 2);
              aplicar(valor);
              range.value = valor;
              if (t < 1) requestAnimationFrame(passo);
              else { aplicar(50); range.value = 50; }
            }
            requestAnimationFrame(passo);
          }, 420);
        });
      }, { threshold: 0.45 });
      obs.observe(moldura);
    });
  })();

  /* ---------- 6. CONTADORES DO HERO ---------- */
  (function contadores() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    if (reduzMovimento || !('IntersectionObserver' in window)) return; // já estão escritos no HTML

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);

        var el = e.target;
        var alvo = parseFloat(el.dataset.count);
        var sufixo = el.dataset.suffix || '';
        var inicio = null;
        var duracao = 1200;

        function passo(agora) {
          if (inicio === null) inicio = agora;
          var t = Math.min((agora - inicio) / duracao, 1);
          var suave = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(alvo * suave) + sufixo;
          if (t < 1) requestAnimationFrame(passo);
          else el.textContent = alvo + sufixo;
        }
        requestAnimationFrame(passo);
      });
    }, { threshold: 0.6 });

    nums.forEach(function (n) { obs.observe(n); });
  })();

  /* ---------- 7. LIGHTBOX ---------- */
  (function lightbox() {
    var caixa = document.getElementById('lightbox');
    if (!caixa) return;

    var img = document.getElementById('lbImg');
    var contador = document.getElementById('lbCount');
    var btnFechar = document.getElementById('lbClose');
    var btnAnt = document.getElementById('lbPrev');
    var btnProx = document.getElementById('lbNext');

    var gatilhos = Array.prototype.slice.call(
      document.querySelectorAll('.gallery-item, .testimonial-shots button')
    );
    if (!gatilhos.length) return;

    var fotos = gatilhos.map(function (g) {
      var i = g.querySelector('img');
      return { src: i ? i.currentSrc || i.src : '', alt: i ? i.alt : '' };
    });

    var indice = 0;
    var ultimoFoco = null;
    var foco = [btnFechar, btnAnt, btnProx].filter(Boolean);

    function mostrar(i) {
      indice = (i + fotos.length) % fotos.length;
      img.src = fotos[indice].src;
      img.alt = fotos[indice].alt;
      if (contador) contador.textContent = (indice + 1) + ' / ' + fotos.length;
    }

    function abrir(i, origem) {
      ultimoFoco = origem || document.activeElement;
      mostrar(i);
      caixa.classList.add('is-open');
      document.body.classList.add('is-locked');
      btnFechar.focus();
    }

    function fechar() {
      caixa.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      if (ultimoFoco) ultimoFoco.focus();
    }

    gatilhos.forEach(function (g, i) {
      g.addEventListener('click', function () { abrir(i, g); });
    });

    btnFechar.addEventListener('click', fechar);
    btnAnt.addEventListener('click', function () { mostrar(indice - 1); });
    btnProx.addEventListener('click', function () { mostrar(indice + 1); });
    caixa.addEventListener('click', function (e) { if (e.target === caixa) fechar(); });

    document.addEventListener('keydown', function (e) {
      if (!caixa.classList.contains('is-open')) return;
      if (e.key === 'Escape') fechar();
      if (e.key === 'ArrowLeft') mostrar(indice - 1);
      if (e.key === 'ArrowRight') mostrar(indice + 1);
      if (e.key === 'Tab') {
        // Mantém o foco dentro do lightbox
        var pos = foco.indexOf(document.activeElement);
        e.preventDefault();
        var proximo = e.shiftKey ? pos - 1 : pos + 1;
        foco[(proximo + foco.length) % foco.length].focus();
      }
    });
  })();

  /* ---------- 8. AGENDAMENTO: MONTA A MENSAGEM DO WHATSAPP ---------- */
  (function agendamento() {
    var botao = document.getElementById('bookingBtn');
    var dica = document.getElementById('bookingHint');
    if (!botao) return;

    var grupos = document.querySelectorAll('.chips[data-group]');
    var escolha = { servico: '', dia: '', periodo: '' };

    grupos.forEach(function (grupo) {
      var nome = grupo.dataset.group;
      var marcado = grupo.querySelector('[aria-pressed="true"]');
      if (marcado) escolha[nome] = marcado.dataset.value;

      grupo.addEventListener('click', function (e) {
        var chip = e.target.closest('.chip');
        if (!chip) return;
        grupo.querySelectorAll('.chip').forEach(function (c) {
          c.setAttribute('aria-pressed', String(c === chip));
        });
        escolha[nome] = chip.dataset.value;
        atualizar();
      });
    });

    function atualizar() {
      var dia = escolha.dia;
      var periodo = escolha.periodo;
      var preferencia;

      if (dia === 'qualquer dia' && periodo === 'qualquer horário') {
        preferencia = 'Tenho flexibilidade de horário.';
      } else if (dia === 'qualquer dia') {
        preferencia = 'Prefiro ser atendida ' + periodo + '.';
      } else if (periodo === 'qualquer horário') {
        preferencia = 'Prefiro na ' + dia + '.';
      } else {
        preferencia = 'Prefiro na ' + dia + ', ' + periodo + '.';
      }

      var texto = 'Olá, Renata! Vim pelo site. Tenho interesse em ' + escolha.servico +
                  '. ' + preferencia + ' Podemos agendar?';
      botao.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);

      // Aviso honesto: sexta só tem atendimento à tarde
      if (dia === 'sexta' && periodo === 'de manhã') {
        dica.textContent = 'Às sextas o atendimento começa às 13h. Terça e quinta têm horários pela manhã.';
        dica.hidden = false;
      } else {
        dica.hidden = true;
      }
    }

    atualizar();
  })();

  /* ---------- 9. DETALHES FINAIS ---------- */
  (function detalhes() {
    // Ano do rodapé sempre atual
    var ano = document.getElementById('ano');
    if (ano) ano.textContent = new Date().getFullYear();

    // Destaca o horário de hoje na tabela
    var hoje = new Date().getDay(); // 0 = domingo
    var linha = document.querySelector('.hours-row[data-day="' + hoje + '"]');
    if (linha) {
      linha.classList.add('is-today');
      var marca = document.createElement('span');
      marca.className = 'today-flag';
      marca.textContent = 'hoje';
      linha.firstElementChild.appendChild(marca);
    }

    // Barra de ação mobile aparece depois que o usuário passa do topo
    var barra = document.getElementById('mobileBar');
    if (!barra) return;
    var tick = false;
    function verificar() {
      barra.classList.toggle('is-visible', window.scrollY > 420);
      tick = false;
    }
    window.addEventListener('scroll', function () {
      if (!tick) { tick = true; window.requestAnimationFrame(verificar); }
    }, { passive: true });
    verificar();
  })();

})();
