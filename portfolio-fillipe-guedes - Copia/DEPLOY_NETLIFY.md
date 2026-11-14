# Publicação no GitHub + Netlify (`app.netlify.com`)

Este projeto está configurado para funcionar **100% na Netlify**, incluindo o **Painel Administrativo**, **formulário de contato**, **banco de dados** e **upload de fotos reais** (usando **Netlify Functions** + **Netlify Blobs**).

---

## Passo 1 — Enviar o projeto para o GitHub

No terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Portfólio Digital Profissional - Fillipe Guedes"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

*(Observação: o arquivo `.gitignore` já evita o envio de `node_modules/`, `app_dist/`, `data/` e `uploads/`.)*

---

## Passo 2 — Conectar o repositório em `app.netlify.com`

1. Acesse [https://app.netlify.com](https://app.netlify.com) e faça login.
2. Clique em **Add new site** → **Import an existing project**.
3. Escolha **Deploy with GitHub** e selecione o repositório criado no Passo 1.
4. A Netlify lerá automaticamente o arquivo `netlify.toml` com as configurações:
   - **Build command:** `npm run build`
   - **Publish directory:** `app_dist`
   - **Functions directory:** `netlify/functions`
5. *(Opcional, recomendado)* Em **Site configuration → Environment variables**, adicione uma variável:
   - **Key:** `AUTH_SECRET`
   - **Value:** uma chave secreta longa e aleatória (ex.: 48 caracteres).
6. Clique em **Deploy site**.

---

## Passo 3 — Primeiro acesso ao Painel Administrativo em produção

1. Abra a URL gerada pela Netlify (ex.: `https://fillipe-guedes.netlify.app`).
2. Clique em **Admin** (ou acesse `/admin`).
3. Entre com as credenciais iniciais:
   - **Usuário:** `admin`
   - **Senha:** `Fillipe@2026`
4. Vá imediatamente na aba **Segurança** e altere usuário e senha.
5. Envie sua foto profissional real, preencha LinkedIn, WhatsApp, e-mail, conquistas, eventos e trabalhos.

---

## Observação sobre vídeos longos na Netlify

- **Fotos** enviadas pelo Painel são otimizadas automaticamente no navegador e armazenadas com persistência no **Netlify Blobs**.
- Para **vídeos de reportagens ou eventos maiores que 5 MB**, utilize a opção de colar o **link do YouTube ou Vimeo** diretamente no painel (eles abrem em player embutido no site sem limite de tamanho).
