const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const cookieParser = require("cookie-parser");

const env = require("./config/env");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes");
const { success } = require("./utils/apiResponse");

const app = express();

//CLASE DE ERROR PARA CORS
class ForbiddenError extends Error {
  constructor(message = "No permitido por CORS") {
    super(message);
    this.name = "ForbiddenError";
    this.statusCode = 403;
  }
}

// Seguridad
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Configuración dinámica de CORS para soportar producción y desarrollo local
const allowedOrigins = [
  env.frontendUrl,
  "https://itea-samturtravel.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir solicitudes sin origen (como curl, postman o apps de celular)
      if (!origin) return callback(null, true);

      // Normalizar eliminando barras diagonales al final (trailing slashes)
      const cleanOrigin = origin.replace(/\/$/, "");
      const cleanAllowedOrigins = allowedOrigins.map((url) =>
        url.replace(/\/$/, ""),
      );

      const isAllowed =
        cleanAllowedOrigins.includes(cleanOrigin) ||
        cleanAllowedOrigins.includes("*") ||
        cleanOrigin.endsWith(".vercel.app"); // Permite URLs de Vercel de producción y vistas previas

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new ForbiddenError(`Origen ${origin} no permitido`));
      }
    },
    credentials: true,
  }),
);


// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: {
    success: false,
    error: { message: "Demasiadas solicitudes, intente de nuevo" },
  },
});
app.use("/api/", limiter);

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: { message: "Demasiados intentos de login" },
  },
});
app.use(["/api/v1/auth/login", "/api/auth/login"], authLimiter);

// Parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Logging
if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}



// Rutas de la API (Soporta /api y /api/v1)
app.use("/api/v1", routes);
app.use("/api", routes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, data: { status: "ok", uptime: process.uptime() } });
});

// Manejo estandar de rutas no encontradas (404 Not Found)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    },
  });
});

// Error handler
app.use(errorHandler);

// Manejo global de errores asincronos
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception", err);
  process.exit(1);
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message,
  });
});

// Iniciar servidor
const server = app.listen(env.port, () => {
  console.log(`🚀 Servidor corriendo en puerto ${env.port}`);
  console.log(`🌐 Frontend URL: ${env.frontendUrl}`);
  console.log(`⚙️  Modo: ${env.nodeEnv}`);
});

// Apagar el server de manera segura

const gracefulShutdown = () => {
  console.log("Cerrando servidor...");
  server.close(async () => {
    // await prisma.$disconnect();
    console.log("Servidor y base de datos cerrados correctamente.");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
