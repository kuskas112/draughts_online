Браузерная игра в шведские шашки. Они же шашки 2 на 2. 

Для запуска необходимо установить NodeJS и npm. 

Для работы необходимы некоторые библиотеки. Установка зависимостей производится в папке проекта командой: 
```
npm install --dev
```

Флаг --dev (или его аналог -D) нужен для установки зависимостей для разработки (devDependencies).
В частности для запуска тестов. Тесты запускаются также в папке проекта командой:
```
npm run test
```

После установки зависимостей сервер запускается командой 
```
npm run start
```