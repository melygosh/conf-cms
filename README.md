# imconf.com.ua

Сайт конференції «Інтегроване стратегічне управління, управління портфелями, програмами, проєктами». Статичний сайт на Astro, дві мови: `/` (UA) і `/en/` (EN).

```bash
npm install
npm run dev     # http://localhost:4321
npm test && npm run test:build
```

**Новий рік конференції:** скопіювати `src/content/conferences/2026.yaml` у `<рік>.yaml` і змінити `year`, `edition`, дати, дедлайни й посилання. Кожен текст має варіант `uk` і `en`; якщо одного бракує, build впаде й покаже, яке поле. Рік у логотипі підставиться сам.

**Архів:** `src/content/archive/<рік>.yaml` з посиланням на фото й презентаціями.

Деплой: [docs/deploy-render.md](docs/deploy-render.md).
