// Este archivo es una plantilla para el entorno de producción
// Copia este archivo como environment.prod.ts y completa los valores secretos
export const environment = {
  production: true,
  apiUrl: 'https://tu-dominio-de-produccion.com/api',
  jwtSecret: 'YOUR_JWT_SECRET_HERE', // Reemplaza con tu clave secreta
  jwtExpiresIn: '24h'
};