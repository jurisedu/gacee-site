# gacee.org

Website of the Global Association of Cultural and Educational Exchange (GACEE), Singapore.

Preview build: Next.js App Router, static pages, three language packs (`messages/en.json`, `messages/zh.json`, `messages/fr.json`). Add a language by dropping a new JSON file into `messages/` and registering the code in `lib/i18n.ts` and `middleware.ts`.

## Routes

`/{locale}` home · `/about` · `/programmes` · `/programmes/{slug}` · `/events` · `/impact` · `/news` · `/partners` · `/contact` · `/privacy` · `/terms`

Locale is chosen from the `gacee_lang` cookie, then `Accept-Language`, defaulting to English. `/` redirects.

## Develop

```bash
npm install
npm run dev
```

## Status

This is the v1 preview. Forms are mock (no submissions stored), contact addresses are placeholders until mailboxes exist, and all figures come from the association's fact sheet.

Technology partner: Juris&Edu AI Technology.
