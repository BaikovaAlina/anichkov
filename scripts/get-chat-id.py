#!/usr/bin/env python3
"""Find the teacher's own Telegram chat ID without putting the token in a file or shell history.
Run locally: python3 scripts/get-chat-id.py. Never commit or send the token to anyone.
"""
import getpass
import json
import urllib.error
import urllib.request

print('1. Откройте СВОЕГО бота в Telegram и отправьте /start, затем любое новое сообщение.')
print('2. Введите перевыпущенный токен ниже. Он не отображается и не сохраняется.')
token = getpass.getpass('Токен бота: ').strip()
if not token or ':' not in token:
    raise SystemExit('Токен не похож на токен Telegram. Ничего не отправлено.')
try:
    request = urllib.request.Request('https://api.telegram.org/bot' + token + '/getUpdates?limit=100', headers={'User-Agent': 'Anichkov-local-setup/1.0'})
    with urllib.request.urlopen(request, timeout=15) as response:
        data = json.load(response)
    chats = {}
    for update in data.get('result', []):
        message = update.get('message') or update.get('edited_message') or update.get('channel_post') or {}
        chat = message.get('chat', {})
        if 'id' in chat:
            chats[chat['id']] = {'id': chat['id'], 'type': chat.get('type'), 'name': chat.get('title') or chat.get('first_name', '')}
    if not chats:
        print('Новых сообщений не найдено. Напишите боту ещё раз и повторите запуск. Если у бота уже есть webhook, getUpdates недоступен: не отключайте действующую интеграцию без проверки.')
    else:
        print('\nНайденные чаты (выберите свой, а не чат ученика):')
        for chat in chats.values():
            print('CHAT_ID:', chat['id'], '|', chat['type'], '|', chat['name'])
        print('\nСохраните выбранный ID в Cloudflare как TELEGRAM_CHAT_ID. Сам токен — только в TELEGRAM_BOT_TOKEN.')
except urllib.error.HTTPError as error:
    print('Telegram вернул HTTP', error.code, '— проверьте токен. При 409 у бота уже работает webhook или другой получатель getUpdates.')
except Exception:
    print('Не удалось связаться с Telegram. Проверьте интернет и повторите позже.')
finally:
    token = None
