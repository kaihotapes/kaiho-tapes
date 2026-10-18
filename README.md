# Cassette for sale — GitHub Pages

Статичная витрина из `../for-sale.md`. Обложки лежат в `images/covers/`.

## Локально

Из этой папки:

```bash
python3 -m http.server 8080
```

Открыть http://localhost:8080

## Пересборка данных

Из `catalog/`:

```bash
python3 build_site.py
```

## GitHub Pages

1. Залить содержимое этой папки в корень отдельного публичного репозитория (лучше с анонимного аккаунта).
2. Settings → Pages → Deploy from branch → `main` / `/ (root)`.
3. Сайт будет на `https://<user>.github.io/<repo>/`.
