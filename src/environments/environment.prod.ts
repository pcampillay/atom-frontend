// Este archivo contiene valores de configuración para el entorno de producción
export const environment = {
  production: true,
  apiUrl: 'https://atom-backend-56rz.onrender.com/api',
  jwtSecret: 'Confess_Emblem_Obstruct_Hunchback', // Esta clave debe coincidir con la del backend
  jwtExpiresIn: '24h'
};