# Vestibular IA — Next.js

Protótipo em Next.js + React + Tailwind para navegação generativa da jornada do candidato de graduação.

## O que esta versão inclui

- Home generativa com busca em linguagem natural.
- OpenAI via rota segura em `app/api/generate-ui/route.ts`.
- Respostas renderizadas por componentes React.
- Skeletons adaptativos durante o carregamento.
- Histórico lateral com restauração de respostas anteriores.
- Captura de nome/e-mail para liberar resumo em PDF.
- Menu principal e Menu completo como navegação estática, sem acionar a IA.
- Rotas estáticas para conteúdo âncora/SEO: cursos, formas de ingresso, eventos, blog, editais, provas e gabaritos, resultados, locais de prova, acompanhamento de inscrição, bolsas e contato.
- Modal de comparação de cursos: quando a IA sugere comparação, o usuário escolhe quais cursos quer comparar.

## Variáveis de ambiente

Configure na Vercel:

```txt
OPENAI_API_KEY=sua-chave
OPENAI_MODEL=gpt-4.1-mini
```

Para voltar ao modelo anterior:

```txt
OPENAI_MODEL=gpt-4o-mini
```

## Deploy na Vercel

Framework Preset: Next.js  
Build Command: padrão  
Output Directory: vazio  
Install Command: padrão  

Não use `public` como Output Directory.

## Observações

O menu estático funciona como uma âncora de navegação tradicional para o candidato e como base para SEO/GEO. A experiência generativa continua na home e nos fluxos iniciados pelo campo de busca.

## Atualização V8 — menu e comparação

- Removido o badge "Graduação" ao lado do menu.
- Ajustado o modal de comparação para os selects ficarem contidos no modal.
- Adicionado microcopy discreto nos resultados: "Resultado baseado na sua pergunta".
- Sugestões da home reduzidas para três caminhos principais: cursos, provas anteriores e inscrição.
