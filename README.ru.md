# Решение проблем детектора Chunqiu / Chunqiu Detector Problem Solution

[English](README.md) | [中文](README.zh-CN.md) | **Русский** | [Español](README.es.md) | [日本語](README.ja.md)

> Выберите язык ниже, чтобы прочитать документ, или откройте нашу интерактивную онлайн-документацию (с поиском по ключевым словам в реальном времени).

## 🌐 Онлайн-документация (GitHub Pages)

👉 **[https://mingzun09.github.io/Chunqiu-Detector-Problem-solution/](https://mingzun09.github.io/Chunqiu-Detector-Problem-solution/)**

Сайт собран на **Docsify** (чистый фронтенд, одна страница, без этапа сборки): точка входа — `index.html` в корне репозитория, навигация и боковая панель берутся из `_navbar.md` / `_sidebar.md`, а основной текст читается напрямую из файлов каталога `language/` (**править файлы сайта не нужно** — содержимое обновляется сразу после коммита).

- Светлая/тёмная тема следует настройкам браузера / системы (`prefers-color-scheme`), ручной переключатель не требуется
- Строка поиска сверху индексирует **только заголовки пунктов** и раскрывает найденный пункт
- Текст документа по-прежнему ведётся в файлах каталога `language/`

Локальный предпросмотр (Docsify загружает Markdown через XHR, поэтому нужен HTTP-сервер — двойной клик по `index.html` не сработает):

```bash
python -m http.server 8000    # или любой статический сервер, например npx serve
# открыть http://localhost:8000/
```

> Публикация: `.github/workflows/pages.yml` выкладывает корень репозитория на GitHub Pages при каждом push в `main`.

---

## Выбор языка

Выберите один из языков, чтобы открыть файл с решениями.

- [中文解决方案 / Китайский](/language/answer_zh.md)
- [English Solutions / Английский](/language/answer_en.md)
- [Русское решение](/language/answer_ru.md)
- [Solución en español / Испанский](/language/answer_es.md)
- [日本語の解決策 / Японский](/language/answer_ja.md)

> В документе много встроенных ссылок (выделены синим). Нажмите на них, чтобы перейти к соответствующему проекту или файлу.

> Китайская версия — оригинал, остальные языки переведены с неё; при неоднозначности приоритет у китайской версии.

---

## Файлы и вложения

В репозитории есть набор автоматических скриптов исправления и KPM-модулей в каталоге `/File/`:

- `/File/Found property.sh` — исправляет детект свойства Found property
- `/File/Tampered Attestation Key(26)Pass.sh` — исправляет аномальный тег Patch в сертификате
- `/File/shamiko_Plus.sh` — скрывает изменения «дыры» в области свойств
- `/File/Bin/Nohello-v1.8.2.9-83-b3e7d87-release.kpm` — KPM-модуль скрытия для APatch
- `/File/Doc/ksu_kp_sidechannel_zh.md` — описание принципа обнаружения через побочный канал KSU/APatch
- [`/File/Doc/thanks.md`](File/Doc/thanks.md) — список благодарностей (полные указания авторства)

---

## Обратная связь и участие

Будем рады Issues и Pull Requests с новыми пунктами обнаружения и решениями!

Можете форкнуть репозиторий, внести изменения и открыть Pull Request — я проверю и смержу.

---

## Благодарности

Полный список — в **[`File/Doc/thanks.md`](File/Doc/thanks.md)**: авторы документации, особая благодарность и инструменты автоматизации, с подтверждением коммитами/PR.

- **Авторы документации:** 铭鐏 ([@mingzun09](https://github.com/mingzun09)) · [@YiJieqwq](https://github.com/YiJieqwq) · 741afb7 · huoyan1231 · juanma0511 · Young-Six-6 · HongSir6 · Lljjcc625 · [Met-AUG](https://github.com/Met-AUG)
- **Особая благодарность:** [Matsuzaka Yuki](https://github.com/matsuzaka-yuki) · [JeTeeZnTmax](https://github.com/jeteezntmax)
- **Инструменты и автоматизация:** google-labs-jules[bot]

> [@JeTeeZnTmax](https://github.com/jeteezntmax) собрал материалы и зацепки по **16 пунктам обнаружения**, но не коммитил их в этот репозиторий, поэтому его нет в списке контрибьюторов GitHub — он указан в файле благодарностей.

---

## Сопровождающие

- [@mingzun09](https://github.com/mingzun09) — владелец репозитория
- [@YiJieqwq](https://github.com/YiJieqwq) — сопровождающий
