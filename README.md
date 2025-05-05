# Test ATOM - Frontend Angular

Este proyecto es una aplicación web desarrollada con Angular que proporciona una interfaz de usuario para gestionar tareas. Implementa autenticación de usuarios, gestión de tareas y soporte para temas claro/oscuro.

## Tecnologías Utilizadas

- **Angular**: Versión 19.2.9
- **Angular Material**: Componentes de UI modernos y responsivos
- **RxJS**: Para programación reactiva
- **Firestore**: Integración con Firebase/Firestore para la persistencia de datos
- **JWT**: Implementación de JSON Web Tokens para comunicación segura con el backend

## Estructura del Proyecto

La aplicación sigue una arquitectura modular y está organizada de la siguiente manera:

```
src/
├── app/
│   ├── core/                 # Servicios y utilidades centrales
│   │   ├── auth/             # Autenticación y manejo de sesiones
│   │   ├── http/             # Interceptores HTTP y servicios base
│   │   └── theme/            # Servicio de gestión de temas
│   ├── modules/              # Módulos de funcionalidades
│   │   ├── login/            # Componentes relacionados con la autenticación
│   │   └── tasks/            # Gestión de tareas (listado, creación, edición)
│   └── shared/               # Componentes y modelos compartidos
├── environments/             # Configuraciones de entorno
└── styles/                   # Estilos globales y temas
```

## Características Principales

1. **Autenticación de usuarios**: Sistema de login simple basado en correo electrónico
2. **Gestión de tareas**: Crear, editar, eliminar y marcar tareas como completadas
3. **Tema claro/oscuro**: Soporte para cambiar entre temas claro y oscuro
4. **Diseño responsivo**: Adaptable a diferentes tamaños de pantalla
5. **Componentes modulares**: Arquitectura basada en componentes reutilizables

## Requisitos Previos

Antes de iniciar el proyecto, asegúrate de tener instalado:

- **Node.js**: Versión 18 o superior
- **npm o pnpm**: Gestor de paquetes para JavaScript
- **Angular CLI**: Para ejecutar los comandos de Angular

## Instalación

1. Clona el repositorio:

   ```bash
   git clone <url-del-repositorio>
   cd atom-frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   # o si prefieres usar pnpm
   pnpm install
   ```

## Configuración del Entorno

La aplicación utiliza variables de entorno para la configuración. Para configurar correctamente tu entorno de desarrollo:

1. En el directorio `src/environments/` encontrarás archivos de plantilla:

   - `environment.template.ts` (para desarrollo)
   - `environment.prod.template.ts` (para producción)

2. Copia estos archivos y renómbralos eliminando `.template` del nombre:

   ```bash
   cp src/environments/environment.template.ts src/environments/environment.ts
   cp src/environments/environment.prod.template.ts src/environments/environment.prod.ts
   ```

3. Edita los archivos creados y actualiza las variables con tus propios valores:
   ```typescript
   // src/environments/environment.ts o environment.prod.ts
   export const environment = {
     production: false, // true para environment.prod.ts
     apiUrl: "http://tu-api-url/api",
     jwtSecret: "TU_CLAVE_JWT_SECRETA", // Reemplaza con tu clave secreta
     jwtExpiresIn: "24h",
   };
   ```

> ⚠️ **IMPORTANTE**: Los archivos `environment.ts` y `environment.prod.ts` contienen información sensible y están configurados en `.gitignore` para que no se incluyan en el control de versiones. Nunca los subas al repositorio.

## Desarrollo Local

Para iniciar el servidor de desarrollo:

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200/`. Los cambios que realices en el código fuente se recargarán automáticamente.

## Construir para Producción

Para generar una versión de producción:

```bash
ng build --configuration production
```

Los archivos compilados se almacenarán en el directorio `dist/`.

## Usando la Aplicación

1. **Iniciar sesión**: La aplicación comienza en la pantalla de login donde puedes ingresar con tu correo electrónico.
2. **Gestión de tareas**: Después de iniciar sesión, puedes:
   - Ver tu lista de tareas
   - Crear nuevas tareas con el botón "Nueva Tarea"
   - Editar tareas existentes
   - Marcar tareas como completadas
   - Eliminar tareas (con confirmación)
3. **Cambiar tema**: Usa el botón flotante en la esquina superior derecha para alternar entre tema claro y oscuro.

## Pruebas

### Pruebas Unitarias

Para ejecutar las pruebas unitarias:

```bash
ng test
```

### Pruebas End-to-End

Para pruebas e2e (requiere configuración adicional):

```bash
ng e2e
```

## Estructura de Componentes Principales

- **LoginComponent**: Maneja la autenticación de usuarios
- **TasksComponent**: Contenedor principal para la gestión de tareas
- **TasksListComponent**: Muestra la lista de tareas ordenadas por fecha (más recientes primero)
- **TaskCardComponent**: Representa cada tarea individual con sus acciones
- **TaskDialogComponent**: Formulario para crear/editar tareas
- **ConfirmDialogComponent**: Diálogo de confirmación para acciones destructivas

## Optimización de Listas de Tareas

La aplicación implementa un sistema avanzado de renderizado para manejar eficientemente grandes volúmenes de tareas, garantizando un rendimiento óptimo incluso con miles de elementos:

### Virtualización con CDK Virtual Scroll

Se utiliza el módulo `ScrollingModule` de Angular CDK para implementar virtualización, una técnica que renderiza únicamente los elementos visibles en la pantalla:

```typescript
import { ScrollingModule, CdkVirtualScrollViewport } from "@angular/cdk/scrolling";

@Component({
  // ...
  imports: [
    // ...
    ScrollingModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksListComponent {
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  // Altura aproximada de cada elemento de tarea
  readonly itemSize = 220;
}
```

En el template HTML:

```html
<cdk-virtual-scroll-viewport [itemSize]="itemSize" class="virtual-scroll-viewport" (scrolledIndexChange)="onScrolledIndexChange($event)">
  <div class="tasks-grid">
    <ng-container *cdkVirtualFor="let task of sortedTasks; trackBy: trackByTaskId">
      <app-task-card [task]="task"></app-task-card>
    </ng-container>
  </div>
</cdk-virtual-scroll-viewport>
```

### Scroll Infinito Automático

El sistema implementa carga dinámica que detecta automáticamente cuando el usuario se acerca al final de la lista:

```typescript
onScrolledIndexChange(index: number): void {
  if (!this.viewport || this.isLoading) return;

  const end = this.viewport.getRenderedRange().end;
  const total = this.sortedTasks.length;

  // Si estamos cerca del final, cargamos más elementos
  if (end > 0 && total > 0 && end >= total - this.scrollEndThreshold) {
    this.loadMore.emit();
  }
}
```

### Ventajas del Enfoque Implementado

1. **Rendimiento Optimizado**:

   - Solo se renderizan los elementos visibles en el viewport
   - Los componentes DOM se reciclan al hacer scroll
   - Reducción drástica del uso de memoria para listas grandes

2. **Experiencia de Usuario Mejorada**:

   - Scroll fluido incluso con miles de elementos
   - Carga progresiva sin interrupciones
   - Indicadores visuales durante la carga de nuevos elementos

3. **Ordenamiento Eficiente**:

   - Las tareas se ordenan automáticamente por fecha de creación (más recientes primero)
   - Soporte para diferentes formatos de fecha, incluyendo Timestamps de Firestore

4. **Eficiencia en la Detección de Cambios**:
   - Implementa `ChangeDetectionStrategy.OnPush` para minimizar ciclos de detección
   - Utiliza `trackBy` para optimizar actualizaciones del DOM

Este sistema permite a la aplicación manejar eficientemente escenarios con grandes volúmenes de datos, manteniendo una experiencia de usuario fluida y un rendimiento óptimo independientemente del número de tareas.

## Seguridad e Implementación JWT

La aplicación implementa un sistema de autenticación y protección de datos usando JSON Web Tokens (JWT) tanto en el frontend como en el backend.

### Implementación JWT en el Frontend

La aplicación utiliza un servicio específico (`JwtService`) para manejar todas las comunicaciones seguras con el backend:

```typescript
// Ejemplo de uso del servicio JWT
this.jwtService.postWithJwt<ApiResponse<LoginResponse>, LoginRequest>("auth/login", { email: email }).subscribe((response) => {
  // Procesar respuesta...
});
```

#### Características principales:

1. **Encriptación de datos**: Todos los datos enviados al servidor se encriptan utilizando JWT antes de la transmisión.
2. **Métodos HTTP seguros**: El servicio proporciona wrappers para los métodos HTTP que automáticamente manejan la encriptación:
   - `postWithJwt()`: Para peticiones POST con payload encriptado
   - `putWithJwt()`: Para peticiones PUT con payload encriptado
   - `patchWithJwt()`: Para peticiones PATCH con payload encriptado
3. **Métodos estándar**: Para operaciones que no requieren encriptación (como GET y DELETE), se puede acceder a través de `jwtService.http.get()` y `jwtService.http.delete()`
4. **Biblioteca jose**: Utiliza la biblioteca 'jose' para manejo seguro de encriptación JWT

### Implementación JWT en el Backend

El backend implementa un conjunto de middlewares de seguridad para procesar y validar los tokens JWT:

1. **Encriptación de datos de solicitud**:

   - El middleware `encryptRequestData` encripta automáticamente los datos para solicitudes POST, PUT y PATCH
   - Los datos se firman con una clave secreta definida en las variables de entorno

2. **Desencriptación de datos**:

   - El middleware `decryptRequestData` verifica y desencripta los tokens JWT recibidos
   - Valida la firma y la expiración del token
   - Expone los datos originales para su procesamiento en los controladores

3. **Seguridad adicional**:
   - Implementa protección contra XSS mediante sanitización de entradas
   - Control de tasa de solicitudes para prevenir ataques de fuerza bruta
   - Utiliza Helmet para configurar cabeceras HTTP seguras
   - Protección contra contaminación de parámetros HTTP con HPP

### Configuración

Las claves y tiempos de expiración de JWT se configuran mediante variables de entorno:

- **Frontend**:

  - `environment.jwtSecret`: Clave secreta para firmar tokens
  - `environment.jwtExpiresIn`: Tiempo de expiración de tokens (ej: '1h', '30m')

- **Backend**:
  - `JWT_SECRET`: Variable de entorno con la clave secreta
  - `JWT_EXPIRES_IN`: Variable de entorno con el tiempo de expiración

### Flujo de autenticación

1. El usuario se autentica mediante su correo electrónico
2. El frontend encripta los datos de login con JWT
3. El backend verifica y desencripta el token
4. Si la autenticación es exitosa, se devuelve un token de sesión
5. El frontend almacena el token de sesión y lo utiliza para solicitudes posteriores
6. Las solicitudes subsiguientes están protegidas por el middleware JWT

Esta implementación asegura que todos los datos transmitidos entre el cliente y el servidor estén encriptados, proporcionando una capa adicional de seguridad para la aplicación.
