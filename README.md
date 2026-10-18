# Cassette for sale — GitHub Pages

Источник данных: `data/catalog.json` (не markdown). Обложки: `images/covers/`.

## Локально

```bash
python3 -m http.server 8080
```

http://localhost:8080

## Синк + деплой

Из корня jarvis:

```bash
python3 catalog/publish.py          # Discogs for sale → JSON + covers → Pages
# или по отдельности:
python3 catalog/sync_discogs.py
python3 catalog/deploy.py
```

Дифф синка: удаляет снятые с продажи, добавляет новые, перечитывает цены из заметок.

## GitHub Pages

Репо: `kaihotapes/kaiho-tapes` → https://kaihotapes.github.io/kaiho-tapes/

Чтобы деплой из Cursor не спрашивал PAT каждый раз: один раз `gh auth login` под `kaihotapes`, плюс allowlist на `catalog/publish.py`.
