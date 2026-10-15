# gacee.org

Website of the Global Association of Cultural and Educational Exchange (GACEE), Singapore.

Next.js App Router with three language packs (`messages/en.json`, `messages/zh.json`, `messages/fr.json`). Add a language by dropping a new JSON file into `messages/` and registering the code in `lib/i18n.ts` and `middleware.ts`.

## Routes

`/{locale}` home · `/about` · `/milestones` · `/programmes` · `/programmes/{slug}` · `/events` · `/impact` · `/news` · `/global-partners` · `/partners` · `/contact` · `/verify` · `/privacy` · `/terms`

Locale is chosen from the `gacee_lang` cookie, then `Accept-Language`, defaulting to English. `/` redirects.

## Develop

```bash
npm install
npm run dev
```

## Content and data

Live at [gacee.org](https://gacee.org). Editable sections, news, events and the homepage gallery are published from the association's digital portal ([hub.gacee.org](https://hub.gacee.org)); the JSON language packs are the fallback. Partnership and contact forms create records in the portal for the secretariat, the newsletter uses double opt-in, and certificate verification queries the portal's public verification API.

Technology partner: Juris&Edu AI Technology.
