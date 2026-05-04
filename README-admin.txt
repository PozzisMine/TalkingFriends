# Админ-панель для Talking Tom Stats

Файл `admin.html` нужен только тебе.

## Как использовать

1. Открой `admin.html` в браузере.
2. Выбери Excel-файл `.xlsx`.
3. Нажми `Проверить Excel`.
4. Если ошибок нет, нажми `Скачать data.json`.
5. Загрузи новый `data.json` в GitHub.

## Формат Excel

Столбцы:

date | channel | channelId | subscribers | views | videos

Пример:

2026-05-01 | Talking Tom & Friends | UCxxxx | 1200000 | 500000000 | 350

## Важно

GitHub Pages не может сам сохранять файл `data.json`.
Поэтому админка делает безопасно:

Excel → data.json → ты сам загружаешь в GitHub.

Посетители сайта не смогут изменить статистику, если у них нет доступа к твоему GitHub-репозиторию.
