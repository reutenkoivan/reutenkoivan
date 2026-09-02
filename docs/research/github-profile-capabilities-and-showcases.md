# GitHub-профіль: легітимні можливості, трюки й showcase

Дата перевірки: **2026-09-02**. Дослідження спирається насамперед на офіційні GitHub Docs, GitHub Flavored Markdown specification, офіційний renderer source та на самі profile/source repositories у showcase.

## Коротка відповідь

GitHub-профіль складається не лише з profile README. Повноцінно можна керувати такими поверхнями:

1. **Profile README** — текст, зображення, GIF, таблиці, collapsible sections, alerts, діаграми, light/dark assets і згенеровані картки.
2. **Нативні profile metadata** — avatar, display name, bio, pronouns, location, local time, social links, ORCID, hiring status і status/Busy.
3. **Pinned repositories та gists** — до шести curated items сумарно.
4. **Contribution graph, activity overview та timeline** — їх можна коректно налаштувати, але не довільно стилізувати.
5. **Achievements, program badges і Sponsors** — нативні, автоматично керовані GitHub surfaces.
6. **Якість самих репозиторіїв** — About description, topics, README, release history, license, social preview та Sponsor button часто переконують сильніше за віджети.
7. **GitHub Pages** — окремий повноцінний static site з HTML/CSS/JS, якщо меж README вже мало.

Найсильніший практичний «трюк» — не максимальна кількість віджетів, а узгодження цих поверхонь: коротке позиціонування → 2–6 сильних pins → контекст і докази в README → надійна динаміка лише там, де вона справді додає інформацію.

## 1. Profile README: як він вмикається

GitHub показує README у верхній частині профілю, якщо одночасно виконано чотири умови: є repository з **точною назвою username**, repository public, у корені є непорожній `README.md`. Для repositories, створених до липня 2020 року, іноді треба натиснути `Share to profile`; для managed user accounts feature недоступна. README зникає, якщо файл видалити/спорожнити, repository зробити private або порушити збіг назв ([GitHub Docs: Managing your profile README](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/managing-your-profile-readme)).

GitHub прямо описує profile README як довільно керований верхній блок і дозволяє в ньому GitHub Flavored Markdown, emoji, images та GIFs ([About your profile](https://docs.github.com/en/account-and-profile/concepts/personal-profile)). Важлива технічна межа: будь-який README обрізається після **500 KiB**; headings також отримують section anchors та автоматичний outline у file view ([About the repository README file](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)).

## 2. Що можна робити всередині README

### 2.1. Нативний GFM, який часто недовикористовують

Офіційно задокументований набір включає headings, emphasis, strike, `<sub>`, `<sup>`, `<ins>`, quotes, code blocks з syntax highlighting, relative links/images, lists і task lists, mentions, issue/PR references, emoji, footnotes, alerts (`NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`), HTML comments та `<picture>` ([Basic writing and formatting syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)).

Корисні композиційні прийоми:

- **GFM tables** — для компактних порівнянь, стеку або project matrix ([Organizing information with tables](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-tables)).
- **`<details><summary>`** — щоб сховати довгі списки, FAQ, сертифікати, talks або raw stats; підтримується `open`, а всередині — Markdown, images і code blocks ([Collapsed sections](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-collapsed-sections)).
- **HTML comments як markers** — невидимі `<!-- BLOG:START -->` / `<!-- BLOG:END -->`, між якими automation замінює лише одну секцію.
- **Relative images** — GitHub радить їх для assets із того самого repository, бо вони коректно трансформуються залежно від branch/context ([About READMEs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)).

### 2.2. Light/dark і responsive assets

GitHub прямо наводить для profile README pattern із `<picture>`, `prefers-color-scheme` та fallback `<img>` ([Quickstart for writing on GitHub](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/quickstart-for-writing-on-github)):

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/card-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/card-light.svg">
  <img src="./assets/card-light.svg" alt="Короткий текстовий еквівалент картки">
</picture>
```

Цим самим механізмом можна давати mobile/desktop variants через media query. Обов'язковий fallback `<img>` робить блок стійкішим, ніж пара окремих theme-only images.

### 2.3. Діаграми, карти та 3D — без стороннього renderer

У Markdown files GitHub нативно рендерить fenced blocks чотирьох типів:

- `mermaid` — flowcharts, sequence diagrams, pie charts тощо;
- `geojson` і `topojson` — інтерактивні карти;
- `stl` — інтерактивний 3D viewer для ASCII STL.

Це офіційно доступно в Markdown files, а отже придатне і для profile README ([Creating diagrams](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams)). Для профілю Mermaid особливо корисний, якщо треба стисло показати architecture/ownership flow або OSS ecosystem. Caveat: GitHub окремо попереджає, що не всі Mermaid charts повністю accessibility-compliant ([Working with non-code files](https://docs.github.com/en/repositories/working-with-files/using-files/working-with-non-code-files)).

### 2.4. HTML, CSS, JS, iframe: де проходить межа

Profile README — **не довільна HTML-сторінка**. GFM tagfilter фільтрує щонайменше `<title>`, `<textarea>`, `<style>`, `<xmp>`, `<iframe>`, `<noembed>`, `<noframes>`, `<script>` і `<plaintext>` ([GitHub Flavored Markdown specification](https://github.github.com/gfm/#disallowed-raw-html-extension)). Офіційний [`github/markup`](https://github.com/github/markup) описує наступний крок pipeline як aggressive sanitization: прибираються небезпечні речі на кшталт scripts, inline styles, `class` та `id`, після чого додаються syntax highlighting, emoji/task lists, anchors, image CDN caching й autolinks.

Звідси практичні наслідки:

- довільний JavaScript, custom stylesheet, iframe/YouTube embed, forms або DOM interaction у README не працюватимуть як на сайті;
- HTML tables, alignment, widths та інші дозволені атрибути можуть допомогти з layout, але GitHub не публікує стабільний повний allowlist — не варто будувати дизайн на недокументованому sanitizer behavior;
- надійні documented primitives — GFM, `<picture>`, `<details>/<summary>`, базові semantic tags і звичайні images;
- якщо потрібні справжні CSS/JS, routing, forms або інтерактивність — це вже завдання для GitHub Pages.

### 2.5. SVG: потужний, але не безмежний

GitHub підтримує SVG як image format, хоча попереджає, що SVG інколи не рендериться у Firefox, а direct repository viewer не підтримує inline scripting чи animation ([Working with non-code files](https://docs.github.com/en/repositories/working-with-files/using-files/working-with-non-code-files)). Водночас багато profile projects генерують declarative animated SVG і вставляють його через `<img>`; це корисний observed pattern, але не гарантія повноцінного browser runtime. Тому:

- не розраховувати на JS усередині SVG;
- важливі дані дублювати текстом або meaningful `alt`;
- мати static/reduced-motion fallback;
- для критичних карток краще зберігати generated SVG у власному repository, а не залежати від live endpoint.

## 3. Динамічний README: три архітектури

### Варіант A — live image endpoint

README містить URL, який на кожен запит віддає SVG/PNG: stats card, visitor counter, Spotify, WakaTime, streak, typing text тощо.

Переваги: мінімум setup, дані можуть бути свіжими. Недоліки: сторонній uptime, rate limits, domain migration і cache. GitHub проксіює external images через Camo, приховуючи browser details; private/auth-only images він не отримає, а оновлення можуть затримуватися через cache headers ([About anonymized URLs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-anonymized-urls)). Тому image-request counter не є надійною unique-human analytics: bots, reloads, Camo fetch/cache і штучно заданий base спотворюють семантику.

### Варіант B — GitHub Action генерує й комітить Markdown/SVG/PNG

Workflow за schedule, `workflow_dispatch` або repository event:

1. отримує GitHub REST/GraphQL data, RSS чи third-party API;
2. змінює лише marker-delimited section або генерує asset;
3. комітить результат у profile repository;
4. README посилається на local last-known-good file.

Цей pattern використовують feeds, metrics, snake/3D contributions, recent activity та власні stats. У workflow варто явно дати тільки `contents: write`; якщо задати `permissions`, усі незгадані permissions стають `none` ([Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#permissions)).

Scheduled workflow має бути на default branch, працює на latest commit default branch, може затримуватися під навантаженням, а в public repository автоматично вимикається після **60 днів без repository activity** ([Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)). Генератор має переживати пропущений run: README повинен залишатися корисним із останнім asset.

### Варіант C — власний generator/service або Pages

Власний endpoint дає повний контроль над даними й SVG, але переносить на власника hosting, secrets, API migrations, caching і monitoring. GitHub Pages натомість дає окремий static site; це правильний шлях для interactive portfolio, demo, rich case studies та full HTML/CSS/JS.

### Які дані можна підставляти

- GitHub public profile/repositories/events через REST API ([REST activity endpoints](https://docs.github.com/en/rest/activity));
- contribution collections, pins, stats і profile fields через GraphQL, зокрема `contributionsCollection` ([GraphQL Users reference](https://docs.github.com/en/graphql/reference/users));
- RSS/Atom: blog posts, releases, YouTube, podcasts;
- WakaTime/editor telemetry, Spotify/Last.fm, Todoist, Chess.com та інші APIs — але це вже окремі credentials, privacy model і failure modes.

Найкорисніші dynamic sections зазвичай не «score», а **latest releases, recent writing, maintained projects, selected contributions, availability або current focus**.

## 4. Що налаштовується поза README

### 4.1. Profile metadata

Офіційний profile editor підтримує avatar, display name, bio до 160 символів, custom pronouns, location, local time/time zone, до чотирьох social links та ORCID iD ([Personalize your profile](https://docs.github.com/en/account-and-profile/tutorials/personalize-your-profile)). Avatar має бути PNG/JPG/GIF, менше 1 MB і 3000×3000 px; GitHub радить приблизно 500×500 ([Profile reference](https://docs.github.com/en/account-and-profile/reference/profile-reference)).

Додаткові корисні можливості:

- public email/website/company/location і `Available for hire` ([Set your hiring status](https://docs.github.com/en/account-and-profile/how-tos/account-settings/set-your-hiring-status));
- public organization memberships: membership за замовчуванням private, але її можна окремо publicize, щоб organization з'явилася на profile ([Organization membership](https://docs.github.com/en/account-and-profile/concepts/organization-membership));
- `@mention` organization у bio, якщо ви її member, піднімає її першою в Activity overview ([Contributions on your profile](https://docs.github.com/en/account-and-profile/concepts/contributions-on-your-profile#activity-overview));
- profile/social fields можна автоматизувати authenticated REST API ([Users endpoints](https://docs.github.com/en/rest/users/users), [Social accounts endpoints](https://docs.github.com/en/rest/users/social-accounts)).

### 4.2. Status і Busy

Status підтримує короткий message, emoji, optional expiration і visibility: public або лише для members обраної organization. `Busy` не просто декор: GitHub показує його біля mention/assignment/review request і виключає користувача з automatic team review assignment ([Personalize your profile](https://docs.github.com/en/account-and-profile/tutorials/personalize-your-profile#setting-a-status), [Profile reference](https://docs.github.com/en/account-and-profile/reference/profile-reference#profile-status)).

Є й API-level trick: GraphQL mutation `changeUserStatus` дозволяє оновлювати message, emoji, expiration, limited availability і organization visibility програмно ([GraphQL Users reference](https://docs.github.com/en/graphql/reference/users#changeuserstatus)). Це дає змогу синхронізувати status з відпусткою, focus mode або музикою, але PAT із user-level access є набагато чутливішим за repository-scoped `GITHUB_TOKEN`.

### 4.3. Pinned repositories і gists

Можна вибрати, reorder drag-and-drop і показати **до шести repositories та gists сумарно** ([Pinning items to your profile](https://docs.github.com/en/account-and-profile/how-tos/profile-customization/pinning-items-to-your-profile)).

Нетривіальні правила:

- public repository можна pin, якщо ви його owner або мали contribution за останній рік;
- commits у чужих forks не дають права pin цього fork, якщо ви ним не володієте;
- можна pin будь-який власний public gist;
- cards показують важливі дані на кшталт stars або перших рядків gist;
- після першого pin секція `Pinned` замінює автоматичний `Popular repositories`, який інакше базується на watchers ([Profile reference](https://docs.github.com/en/account-and-profile/reference/profile-reference#pinning-items-to-your-profile), [Contributions on your profile](https://docs.github.com/en/account-and-profile/concepts/contributions-on-your-profile#pinned)).

Практично pins — це curated portfolio, а README має пояснювати **роль, результат і чому ці проєкти важливі**. Gist pin добре працює для короткого reusable snippet, checklist, architecture note або live coding artifact, який не заслуговує окремого repository.

### 4.4. Contribution graph та activity

Нативний graph показує приблизно останній рік, а Activity overview додає типи contributions та найактивніші repositories/organizations у межах read access конкретного viewer. Private/internal contributions можна показати як anonymized daily counts без назв і деталей repositories ([Contributions on your profile](https://docs.github.com/en/account-and-profile/concepts/contributions-on-your-profile), [Private contributions visibility](https://docs.github.com/en/account-and-profile/how-tos/contribution-settings/manage-visibility-settings-for-private-contributions-and-achievements)).

Щоб commit зарахувався, його email має бути associated з account, repository має бути standalone, а commit — у default branch або `gh-pages`; існують також membership/collaboration conditions. Issues, PRs, reviews, discussions і answers рахуються за своїми правилами, а GitHub може не показати всі items після display limits ([Profile contributions reference](https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference)).

#### «Малювання» на contribution graph

GitHub використовує author date для розміщення commit у profile contribution history, тому backdated commits технічно можуть впливати на видиму історію; водночас це **не офіційна customization surface**, а всі звичайні contribution criteria залишаються чинними ([Profile contributions reference](https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference#how-github-uses-the-git-author-date-and-commit-date)). Вигадані commits заради картинки створюють misleading history. Легітимніша альтернатива — не підробляти native graph, а візуалізувати реальні contributions окремим generated SVG: snake, 3D calendar, isometric view або Breakout.

Graph також не слід трактувати як productivity KPI: він приховує private context, має branch/email/fork rules, не вимірює impact, review quality, mentoring чи architecture work.

### 4.5. Achievements, badges і Sponsors

Native Achievements автоматично відзначають певні events/actions; їх можна hide по одному, вимкнути повністю або не враховувати private contributions. Feature усе ще має статус public preview і може змінюватися ([Profile reference](https://docs.github.com/en/account-and-profile/reference/profile-reference#earning-achievements), [Visibility settings](https://docs.github.com/en/account-and-profile/how-tos/contribution-settings/manage-visibility-settings-for-private-contributions-and-achievements)). Їх не можна довільно «домалювати» як native achievements.

Окремо GitHub автоматично показує program badges, зокрема Developer Program Member, Pro, Security Bug Bounty Hunter, GitHub Campus Expert та accepted GitHub Advisory Database credit; точний список і правила наведені в [Profile reference](https://docs.github.com/en/account-and-profile/reference/profile-reference#displaying-badges-on-your-profile). Shields.io/skill icons/trophy cards усередині README — це звичайні images, не нативні GitHub badges.

GitHub Sponsors додає Sponsor surface; у sponsor profile можна окремо feature до шести repositories ([Editing your GitHub Sponsors profile](https://docs.github.com/en/sponsors/receiving-sponsorships-through-github-sponsors/editing-your-profile-details-for-github-sponsors)). У repositories funding links налаштовуються через `.github/FUNDING.yml` ([Displaying a sponsor button](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/displaying-a-sponsor-button-in-your-repository)).

### 4.6. Підсилення pinned repositories

Навіть найкращий pin слабкий, якщо repository не пояснює себе. Офіційні supporting surfaces:

- concise description, website/demo та topics; topics полегшують discovery, їх можна мати до 20, і topic names завжди public ([Classifying repositories with topics](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics));
- README, license, contribution guide, releases, discussions і sponsor button;
- social preview image для repository links: GitHub радить 1280×640 для найкращої якості, файл PNG/JPG/GIF до 1 MB ([Customizing social media preview](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview)).

Social preview не змінює native pin card, але покращує вигляд repository, коли ним діляться поза profile.

## 5. GitHub Pages як продовження профілю

User site створюється в repository `<username>.github.io` і публікується на `https://<username>.github.io`; його можна використовувати як portfolio, blog або résumé ([GitHub Pages quickstart](https://docs.github.com/en/pages/quickstart)). Pages підтримує custom domain і build/deploy через branch або custom GitHub Actions workflow ([Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)).

На відміну від README, Pages — це повноцінний static site з HTML/CSS/JS. Основні limits: один user/organization site на account, published site до 1 GB, deploy timeout 10 хвилин, soft bandwidth 100 GB/month і soft 10 builds/hour; Pages не призначений як безплатний hosting для online business/e-commerce/SaaS або sensitive transactions ([GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)).

Патерн: README дає 30–90 секунд огляду; Pages містить глибокі case studies, interactive demos, talks, writing archive та contact flow.

### Bonus: organization profiles

Для organization public README живе в public `.github/profile/README.md`, member-only README — у private `.github-private/profile/README.md`; для public/member views можна мати окремі pinned repositories ([Customizing your organization's profile](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/customizing-your-organizations-profile)). Це корисно для команди, OSS ecosystem або personal brand, який виріс у organization.

## 6. Каталог легітимних «трюків»

| Прийом | Як реалізується | Найкраще використання | Caveat |
| --- | --- | --- | --- |
| Theme-aware hero/cards | `<picture>` + light/dark assets | Власна візуальна система | Потрібен fallback і alt |
| Compact project tiles | Local SVG/PNG, linked to repository/demo | Portfolio з контекстом | Не ховати весь зміст у картинці |
| Dynamic blog/releases | Action замінює marker section | Maintainer, author, speaker | Schedule/cache, bot commits |
| GitHub stats cards | Remote SVG або Action-generated local SVG | Secondary activity summary | Rank/languages легко вводять в оману |
| Recent activity | REST events → Markdown | Показати поточну OSS роботу | Public Events API — не повний audit log |
| Contribution snake/3D/Breakout | Action → SVG/GIF | Playful profile | Motion, noise, maintenance |
| Typing/terminal hero | Declarative SVG або GIF | Creative developer identity | Cliché; animation accessibility |
| Visitor counter | External image endpoint | Ретро/decorative effect | Не справжня analytics |
| Spotify/WakaTime/Todoist | External API → SVG/README | Особисті hobbies/work habits | Secrets, privacy, stale states |
| Pseudo-interactive game | Links prefill Issues; Action mutates README | Memorable community toy | Не JS; attack surface і commit noise |
| Diagram/map/3D model | Native fenced `mermaid`/`geojson`/`topojson`/`stl` | Architecture, travel/OSS map, 3D work | Складність та a11y |
| Extra «pin cards» у README | Generated repository/gist cards | Показати >6 projects | Це не native pins; duplication |
| Gist as pin | Native public gist pin | Small artifact/snippet | Лише власний public gist |
| Status automation | GraphQL `changeUserStatus` | Vacation/focus/current activity | User-level token sensitivity |
| GitHub Pages | `<username>.github.io` | Повноцінне portfolio/demo | Окремий сайт треба підтримувати |

## 7. Reliability, security, privacy та accessibility

### 7.1. Security checklist для Actions

- Видавати `GITHUB_TOKEN` мінімальні permissions; для generated commit зазвичай достатньо `contents: write` ([Workflow permissions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#permissions)).
- Third-party actions pin на reviewed **full-length commit SHA** — GitHub називає це єдиним immutable release reference; також audit source і не довіряти навіть Marketplace badge як повній гарантії ([Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use#using-third-party-actions)).
- Branch names, issue titles/bodies, PR metadata та інші `github` context values вважати untrusted input; не інтерполювати прямо у shell ([Script injections](https://docs.github.com/en/actions/concepts/security/script-injections)).
- PAT, Spotify refresh token, WakaTime/Todoist keys зберігати лише в GitHub Secrets; не комітити в SVG, generated JSON, logs або sample config.
- Issue-driven game/action має allowlist команд, перевірку actor/permissions, concurrency control, timeout і мінімальний write scope.

### 7.2. Maintenance checklist

- Основні message, project names і links залишати текстом, щоб profile не зламався разом із image service.
- Для dynamic assets мати last-known-good local output; комітити тільки якщо зміст змінився.
- Якщо history важлива, generated assets тримати в окремій output branch або мінімізувати bot commit frequency.
- Моніторити schedules після 60 днів inactivity; додати `workflow_dispatch` для ручного recovery.
- Не дублювати native contribution graph, achievements і pins кількома великими dashboards без конкретної причини.
- Перевіряти profile у light/dark mode, narrow viewport і з вимкненими images.

### 7.3. Accessibility checklist

- Кожне інформаційне image має короткий meaningful alt; decorative image — порожній alt. GitHub прямо просить описовий alt у profile README quickstart, а W3C рекомендує передавати ту саму функцію/інформацію текстом ([GitHub quickstart](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/quickstart-for-writing-on-github), [W3C G94](https://www.w3.org/WAI/WCAG22/Techniques/general/G94.html)).
- Посилання називати за призначенням (`Read the case study`, не `click here`); не покладатися лише на color/icons.
- Зберігати послідовну heading hierarchy й semantic lists/tables.
- Не створювати wall of badges/GIFs: screen readers озвучують alt/emoji, а cognitive load і mobile layout швидко погіршуються.
- Auto-animation довша за 5 секунд без pause/stop/hide конфліктує з WCAG 2.2.2; для SVG підтримувати `prefers-reduced-motion` або static variant ([W3C Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), [W3C C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39)).

## 8. Showcase: живі profiles і self-named repositories

Нижче — source repositories, а не screenshots чи вторинні добірки. Стан конкретного dynamic endpoint може змінюватися; саме це інколи є корисною частиною прикладу.

| Profile/repository | Що подивитися | Чому цікавий / caveat |
| --- | --- | --- |
| [antfu/antfu](https://github.com/antfu/antfu) | Ультракороткий README: `<samp>`, одна фраза й navigation links | Сильний контрприклад dashboard-підходу: впізнаваний профіль не зобов'язаний мати cards, badges чи automation. Мінімум залежностей і майже нульова maintenance cost. |
| [simonw/simonw](https://github.com/simonw/simonw) | `Recent releases`, blog і TIL, `build_readme.py`, workflow | Profile як self-updating editorial/work feed, а не vanity dashboard. Один із найсильніших maintainer patterns. |
| [timburgan/timburgan](https://github.com/timburgan/timburgan) | Chess board, allowed-move links, leaderboard, workflows | Клік prefill-ить Issue, Action змінює README. Понад 61k commits показують ціну псевдоінтерактивності: history noise. |
| [marcizhu/marcizhu](https://github.com/marcizhu/marcizhu) + [readme-chess template](https://github.com/marcizhu/readme-chess) | Issues → moves, last moves, player table, PGN archive | Переносиміший interactive-README pattern; це навігація + automation, не JavaScript усередині README. |
| [Andrew6rant/Andrew6rant](https://github.com/Andrew6rant/Andrew6rant) | `dark_mode.svg`, `light_mode.svg`, generator scripts, workflows | Власний neofetch/ASCII profile card і `<picture>` замість generic stats endpoint; підтримка parser/API повністю на власнику. |
| [tw93/tw93](https://github.com/tw93/tw93) | Compact hero, product family, releases й aggregate signals | Приклад polished product-engineer landing page, де automation підтримує positioning. |
| [DenverCoder1/DenverCoder1](https://github.com/DenverCoder1/DenverCoder1) | `<details>`, HTML tables, cards, feed markers, YouTube, sponsors і activity | “Kitchen sink” dashboard і корисна галерея сумісних компонентів; водночас наочно показує dependency/maintenance cost та ризик надто довгого profile. |
| [Thaiane/Thaiane](https://github.com/Thaiane/Thaiane) | Увесь bio як JavaScript object | Сильний code-as-bio без зовнішнього runtime чи сервісів; декоративний код лишається readable text. |
| [sindresorhus/sindresorhus](https://github.com/sindresorhus/sindresorhus) | `welcome-header.gif`, flames, construction, counter, unicorn/Furby/cat | Навмисний GeoCities/90s anti-design як авторська впізнаваність. GIF-heavy, тому слабший по a11y/performance. |
| [abhisheknaiidu/abhisheknaiidu](https://github.com/abhisheknaiidu/abhisheknaiidu) | Marker-updated WakaTime, Todoist, stats і workflows | Класичний Actions-orchestration example; поточний `No activity tracked` добре демонструє stale/failure state third-party integrations. |
| [natemoo-re/natemoo-re](https://github.com/natemoo-re/natemoo-re) | Narrative bio + Spotify now-playing/top tracks service | Dynamic music card може бути дуже персональним; OAuth, hosting і API policy — постійне maintenance навантаження. |
| [gautamkrishnar/gautamkrishnar](https://github.com/gautamkrishnar/gautamkrishnar) | Concise OSS narrative + власний blog automation | Хороший баланс між curated human-written content і generated feed. |
| [lowlighter/lowlighter](https://github.com/lowlighter/lowlighter) | Metrics-generated profile, isometric calendar, languages, activity, music тощо | Showcase максимального automation; корисний як каталог, але не як універсальний дизайн template. |
| [Platane/Platane](https://github.com/Platane/Platane) | Contribution snake і light/dark variants | Canonical playful contribution visualization; анімація й дублювання graph можуть відволікати. |
| [navi3582/animated-github-profile](https://github.com/navi3582/animated-github-profile) + [live profile](https://github.com/navi3582) | Typing ASCII portrait, terminal card, heatmap, daily Action | Добре пояснений self-contained terminal SVG starter; потрібен static/reduced-motion fallback. |

## 9. Showcase: source repositories інструментів

### All-in-one, stats і activity

- [`lowlighter/metrics`](https://github.com/lowlighter/metrics) — великий metrics engine з plugins для calendar, languages, habits, activity, achievements, posts/RSS, WakaTime, music, Steam, LeetCode, chess і terminal template. Action дає більше features, ніж shared instance, але потребує конфігурації та іноді PAT scopes.
- [`stats-organization/github-stats-extended`](https://github.com/stats-organization/github-stats-extended) і [`github-readme-stats-action`](https://github.com/stats-organization/github-readme-stats-action) — актуальні successor/action для stats, languages і repo cards. Оригінальний [`anuraghazra/github-readme-stats`](https://github.com/anuraghazra/github-readme-stats) прямо позначено як unmaintained; його public Vercel endpoint був best-effort і сам README радить successor, self-hosting або static Action output.
- [`DenverCoder1/github-readme-streak-stats`](https://github.com/DenverCoder1/github-readme-streak-stats) — current/longest streak і total contributions; варто пам'ятати, що streak оптимізує cadence, а не impact.
- [`Readme-Workflows/recent-activity`](https://github.com/Readme-Workflows/recent-activity) — recent public GitHub events у marked README section; feed не є повним audit log.
- [`vn7n24fzkq/github-profile-summary-cards`](https://github.com/vn7n24fzkq/github-profile-summary-cards) — profile/language/productive-time cards, themes і Action-generated local output; raw/Camo cache може затримувати refresh.

### Content і telemetry

- [`gautamkrishnar/blog-post-workflow`](https://github.com/gautamkrishnar/blog-post-workflow) — RSS, Stack Overflow, YouTube та інші feeds між HTML markers. Source рекомендує daily cadence і використовує `contents: write`.
- [`anmol098/waka-readme-stats`](https://github.com/anmol098/waka-readme-stats) — languages/editors/OS/projects/time-of-day з WakaTime; це editor telemetry, а не повний обсяг професійної роботи.
- [`novatorem/novatorem`](https://github.com/novatorem/novatorem) і [`kittinan/spotify-github-profile`](https://github.com/kittinan/spotify-github-profile) — art-directed або hosted Spotify/Last.fm cards; подивитися templates, setup і secrets model.
- [`abhisheknaiidu/todoist-readme`](https://github.com/abhisheknaiidu/todoist-readme) — Todoist karma/completed/streak через Action; корисний приклад privacy/staleness trade-off.
- [`Balastrong/chess-stats-action`](https://github.com/Balastrong/chess-stats-action) — Chess.com ratings і recent games у marker section.

### Visual/creative

- [`Platane/snk`](https://github.com/Platane/snk) — canonical contribution snake, SVG/GIF, custom palettes і documented `<picture>` light/dark setup.
- [`yoshi389111/github-profile-3d-contrib`](https://github.com/yoshi389111/github-profile-3d-contrib) — 3D contribution calendar, daily Action і local SVG assets.
- [`cyprieng/github-breakout`](https://github.com/cyprieng/github-breakout) — contribution graph як Breakout SVG, окремі light/dark outputs.
- [`DenverCoder1/readme-typing-svg`](https://github.com/DenverCoder1/readme-typing-svg) — typing/deleting SVG; найкраще працює як короткий accent, а не основний зміст.
- [`williamzujkowski/svg-terminal`](https://github.com/williamzujkowski/svg-terminal) — YAML → self-contained terminal SVG, Action і explicit reduced-motion support.
- [`navi3582/animated-github-profile`](https://github.com/navi3582/animated-github-profile) — готовий terminal/ASCII profile starter із генераторами та cron.
- [`crafter-station/gh-ascii`](https://github.com/crafter-station/gh-ascii) — avatar → neofetch-style ASCII card із light/dark local files.

### Badges, counters і games

- [`badges/shields`](https://github.com/badges/shields) — canonical badges service для build/version/download/social/static labels. Badge wall швидко стає шумом; badges корисніші як 1–3 CTA/status signals.
- [`tandpfun/skill-icons`](https://github.com/tandpfun/skill-icons) — компактний themed tech-stack grid. Показує інструменти, але не рівень володіння.
- [`antonkomarev/github-profile-views-counter`](https://github.com/antonkomarev/github-profile-views-counter) — profile views badge. Автор прямо зауважує, що counts можна підробити; це decorative counter, не analytics.
- [`marcizhu/readme-chess`](https://github.com/marcizhu/readme-chess) — template для Issues + Action + Python + PGN archive.
- [`ryo-ma/github-profile-trophy`](https://github.com/ryo-ma/github-profile-trophy) — themes/ranks/layout filtering; owner README попереджає про hosting cost і можливе припинення public service, тому self-hosting — серйозний caveat.

Велика вторинна галерея для подальшого browsing — [`abhisheknaiidu/awesome-github-profile-readme`](https://github.com/abhisheknaiidu/awesome-github-profile-readme). Її варто використовувати як index, а перевіряти кожен прийом — у self-named/source repository.

## 10. Три робочі рецепти

### Професійний / senior profile

1. Сильний avatar, 160-char bio, location/time zone, 1–4 social links.
2. 3–6 pins із заповненими descriptions/topics/demo links.
3. README: one-line positioning → areas of expertise → 2–4 project case snippets → contact.
4. Максимум одна secondary stats/activity card без rank і без claims про skill level.
5. Pages для детальних case studies.

### Maintainer / author profile

1. README як editorial feed: maintained projects, latest releases, writing/talks.
2. Action оновлює marker sections не частіше, ніж це потрібно джерелу.
3. Sponsors і contributing/help guidance.
4. Pins як entry points у ecosystem.

### Creative / playful profile

1. Один центральний concept: retro terminal, chess, snake, 3D calendar або code-as-bio.
2. Local/generated assets із light/dark і reduced-motion variants.
3. Видимий textual fallback та звичайні project/contact links.
4. Якщо є issue-driven interaction — strict input validation і мінімальні permissions.

У всіх трьох випадках README має відповідати на три питання швидше, ніж завантажаться віджети: **хто ви, що будуєте, куди натиснути далі**.
