# Backend AppPlayPulse

API sencilla en Express + MongoDB para conectar la app Android con MongoDB Compass/Atlas.

## Requisitos
- Node.js 18+
- MongoDB en local (Compass) o Atlas. La URI se configura por `.env`.

## Configuración
1. Copia el ejemplo de variables de entorno:
   ```bash
   cp .env.example .env
   ```
2. Edita `.env` y coloca tu URI de MongoDB. Para Compass local, algo como:
   ```
   MONGODB_URI=mongodb://localhost:27017/appplaypulse
   PORT=3000
   ```

## Ejecutar
```bash
npm install
npm run dev   # recarga en caliente con nodemon
# o
npm start
```

La API queda en `http://localhost:3000` (en emulador Android usar `http://10.0.2.2:3000`).

## Endpoints principales
- `POST /api/auth/register` — registro (nombre, apellido, edad, email, phone, username, password)
- `POST /api/auth/login` — login con username/email/phone + password
- `GET /api/posts` — feed
- `POST /api/posts` — crear post (userId, username, content, location?, link?, imageUri?)

Respuestas devuelven `user` o `item/items` y siempre omiten la contraseña.
