# Vestibular IA — Next.js

Protótipo em Next.js + React + Tailwind + componentes no padrão shadcn/Radix para testar navegação generativa na jornada do candidato da graduação FGV.

## O que esta versão inclui

- Interface em React/Next.js, pronta para Vercel.
- API route em `app/api/generate-ui/route.ts` chamando a OpenAI.
- Renderização por seções: a IA retorna um plano estruturado e o React renderiza componentes controlados.
- Loader atual preservado: “Montando sua experiência”.
- Skeleton screens adaptativos por tipo provável de pergunta:
  - cursos;
  - datas/timeline;
  - formas de ingresso;
  - bolsas;
  - eventos;
  - detalhe de curso.
- Drawer lateral **Sua jornada**, com histórico das experiências geradas.
- Clique no histórico restaura a visualização anterior sem chamar a IA novamente.
- Histórico salvo no `localStorage` do navegador.

## Variáveis de ambiente na Vercel

Configure no projeto:

```text
OPENAI_API_KEY=sua_chave_da_openai
OPENAI_MODEL=gpt-4.1-mini
```

A variável `OPENAI_MODEL` é opcional. Se não existir, o projeto usa o modelo definido no código.

## Como rodar localmente

```bash
npm install
npm run dev
```

Depois acesse:

```text
http://localhost:3000
```

## Como publicar na Vercel

1. Suba os arquivos para um repositório no GitHub.
2. Importe o repositório na Vercel.
3. Em Framework Preset, use `Next.js`.
4. Deixe Output Directory em branco.
5. Configure as variáveis de ambiente.
6. Faça o deploy.

## Observação sobre o skeleton

O skeleton é apenas um feedback visual de carregamento. Ele não substitui a resposta da OpenAI e não funciona como fallback. A resposta real continua vindo da API `/api/generate-ui`.
