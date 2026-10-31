# Переїзд imconf.com.ua на Render Static Site

Зараз сайт працює як Node web service `national-technical-university-kharkiv` (Procfile + `server.js`). Новий сайт — статичний, тому на Render це окремий сервіс типу **Static Site**. Перетворити один тип сервісу на інший не можна.

Стан DNS на 2026-10-31 (DNS-провайдер srv53):

| Запис | Значення |
|---|---|
| `imconf.com.ua` A | `216.24.57.1`, `216.24.57.16`, `216.24.57.18` (IP Render) |
| `www.imconf.com.ua` CNAME | `national-technical-university-kharkiv.onrender.com` |

Робити поза сезоном правок. Очікуваний простій — кілька хвилин між кроками 4 і 5.

## 1. Створити Static Site

Render → **New → Static Site**:

- Repository: `melygosh/conf-cms`
- Branch: `redesign/astro`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Environment: `NODE_VERSION` = `22`

## 2. Перевірити на `*.onrender.com`

На адресі, яку Render дав новому сервісу:

- `/` — українська версія, у логотипі правильний рік
- `/en/` — англійська
- `/index_eng.html` і `/?lang=en` — перекидають на `/en/`
- телефон (або вузьке вікно): меню відкривається, сторінка не скролиться вбік
- обидві мапи (Карпати вгорі, ХПІ в контактах) відображаються

## 3. Не зливати гілку в `master` до кроку 7

Відкрити старий сервіс `national-technical-university-kharkiv` → Settings і перевірити, чи ввімкнено Auto-Deploy з `master`. Якщо так, злиття видалить `server.js` і `Procfile`, і старий сервіс впаде ще до того, як домен переїде.

## 4. Зняти домени зі старого сервісу

Старий сервіс → Settings → **Custom Domains**: видалити `imconf.com.ua` і `www.imconf.com.ua`.

## 5. Додати домени на новий сервіс

Новий Static Site → Settings → **Custom Domains**: додати `imconf.com.ua` і `www.imconf.com.ua`. Render покаже, які DNS-записи потрібні.

- `www` CNAME: у панелі srv53 змінити `national-technical-university-kharkiv.onrender.com` на хост нового сервісу (`<назва>.onrender.com`).
- apex A: звірити з тим, що показує Render. Найімовірніше, `216.24.57.1` лишається як є.

Дочекатися в Render статусу **Verified** і **Certificate issued** для обох доменів.

## 6. Перевірити продакшн

`https://imconf.com.ua/`, `https://www.imconf.com.ua/`, `https://imconf.com.ua/en/` — ті самі перевірки, що в кроці 2.

## 7. Завершити

1. Злити `redesign/astro` у `master`.
2. Static Site → Settings → Branch: `master`.
3. Видалити старий web service `national-technical-university-kharkiv`.
