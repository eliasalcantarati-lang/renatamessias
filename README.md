# Renata Messias — Skin Concept

Site institucional (estático, HTML/CSS/JS puro, sem build e sem dependências externas).

## Estrutura
```
index.html      todas as seções do site
styles.css      estilos (organizado em 18 blocos numerados, com comentários)
script.js       interações: menu mobile, antes/depois, lightbox, agendador
robots.txt      libera a indexação e aponta o sitemap
sitemap.xml     mapa do site para o Google
preview.jpg     imagem do og:image (preview ao compartilhar)
assets/         imagens (.jpg + .webp) e fontes auto-hospedadas
assets/fonts/   Fraunces e Jost em .woff2 variável
```

## Rodar localmente
Abrir o `index.html` no navegador já funciona.
Para testar as fontes e o WebP como em produção, prefira um servidor local:

```bash
python3 -m http.server 8000
# depois: http://localhost:8000
```

## Publicar / atualizar na Vercel
Repositório conectado à Vercel — qualquer `git push` na branch principal gera um novo deploy.

---

## O que mudar quando precisar

**Telefone do WhatsApp** — está em dois lugares:
- `script.js`, constante `WHATSAPP` no topo do arquivo;
- `index.html`, nos links `wa.me/...` e no `telephone` do JSON-LD.

**Horário de atendimento** — três lugares, precisam bater entre si:
- `index.html` → bloco `.hours-card` (a tabela visível);
- `index.html` → `openingHoursSpecification` no JSON-LD (o que o Google lê);
- `script.js` → o aviso de sexta-feira dentro de `agendamento()`.
  O `data-day` de cada linha usa a numeração do JavaScript: 0 = domingo, 2 = terça, 5 = sexta.

**Cores** — todas no `:root` do `styles.css`. Trocar `--terra-deep` muda a marca inteira.

**Novo antes/depois** — duplicar um bloco `<figure class="ba-card">` em `#resultados`.
As duas imagens precisam ser arquivos separados (uma "antes", uma "depois"), não uma
montagem lado a lado, porque o comparador sobrepõe as duas.

**Nova imagem** — gerar sempre o `.webp` junto e usar `<picture>` com o `.jpg` de reserva:

```bash
python3 -c "from PIL import Image; \
  Image.open('assets/nova.jpg').convert('RGB').save('assets/nova.webp','WEBP',quality=82,method=6)"
```

## Detalhes que não são óbvios

- **As fontes são auto-hospedadas** (`assets/fonts/`). Não há requisição ao Google Fonts:
  carrega mais rápido, funciona offline e não envia o IP do visitante para terceiros (LGPD).
  Os arquivos são variáveis — um só arquivo cobre todos os pesos.
- **`.reveal` começa invisível** e só aparece via JavaScript. Existe um `<noscript>` no
  `<head>` que devolve a visibilidade caso o JS falhe ou esteja bloqueado. Se criar um
  elemento novo com `.reveal`, ele já está coberto por essa regra.
- **O comparador antes/depois** é um `<input type="range">` invisível por cima da imagem.
  Isso dá arrasto no mouse, toque no celular e setas do teclado sem código extra.
- **A largura e altura de cada `<img>`** estão no HTML de propósito: evita que a página
  "pule" enquanto as imagens carregam (CLS).
