# Servidor de Impresión Node.js

## Requisitos

- **Impresora térmica** compatible con ESC/POS
- **Driver de impresora**: Descárgalo e instálalo desde [https://img.yfisher.com/m26549/1744267000vy4.exe](https://img.yfisher.com/m26549/1744267000vy4.exe)
- **Windows**

## Opciones de Ejecución

### 1. Ejecutar como aplicación Node.js

1. Instala [Node.js](https://nodejs.org/) en el computador.
2. Copia todo el proyecto a una carpeta local.
3. Abre una terminal en esa carpeta y ejecuta:
   ```
   npm install
   ```
4. Inicia el servidor con:
   ```
   node app.js
   ```
   o ejecuta `start-server.bat` (requiere Node.js instalado).

### 2. Ejecutar como archivo .exe (recomendado para equipos sin Node.js)

1. Genera el ejecutable en tu PC con:
   ```
   npm run build
   ```
   Esto creará `dist/print-server.exe`.
2. Copia el archivo `print-server.exe` y el archivo `.env` (si existe) al computador destino.
3. Ejecuta `print-server.exe` para iniciar el servidor.

## Configuración de la impresora
- El nombre de la impresora debe coincidir con el configurado en el sistema o en la variable de entorno `PRINTER_NAME`.
- Por defecto, el nombre es `POS-80C`.

## Uso
- El servidor escucha en `http://localhost:3000`.
- Envía las órdenes de impresión al endpoint configurado, incluyendo el campo `order_type` para que aparezca en el recibo.

## Notas
- Si usas Node.js, cada vez que modifiques el código debes reiniciar el servidor (`Ctrl+C` y luego `node app.js`).
- Si usas el .exe, debes volver a generar el ejecutable tras cada cambio en el código fuente.

---

¿Dudas? Consulta al desarrollador.