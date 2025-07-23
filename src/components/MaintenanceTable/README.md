# MaintenanceTable Component

## Descripción

El componente `MaintenanceTable` es un componente reutilizable que maneja la lógica de asignación de mantenimientos para vehículos. Se utiliza tanto en la página de registro de vehículos como en la página de edición de vehículos.

## Props

| Prop                   | Tipo                                 | Requerido | Default            | Descripción                                                |
| ---------------------- | ------------------------------------ | --------- | ------------------ | ---------------------------------------------------------- |
| `assignedMaintenances` | `Set<string>`                        | ✅        | -                  | Set de IDs de mantenimientos asignados                     |
| `onMaintenanceAssign`  | `(id: string, name: string) => void` | ✅        | -                  | Función que se ejecuta al asignar/remover un mantenimiento |
| `title`                | `string`                             | ❌        | `"Mantenimientos"` | Título de la sección                                       |
| `showAssignedInfo`     | `boolean`                            | ❌        | `true`             | Mostrar información de mantenimientos asignados            |
| `showSaveButton`       | `boolean`                            | ❌        | `false`            | Mostrar botón de guardar                                   |
| `isSaving`             | `boolean`                            | ❌        | `false`            | Estado de guardado                                         |
| `onSaveMaintenances`   | `() => void`                         | ❌        | -                  | Función para guardar mantenimientos                        |
| `width`                | `string`                             | ❌        | `"800px"`          | Ancho de la tabla                                          |
| `context`              | `"registration" \| "edit"`           | ❌        | `"registration"`   | Contexto de uso para logging                               |

## Uso en VehicleRegistration

```tsx
<MaintenanceTable
  assignedMaintenances={assignedMaintenances}
  assignedMaintenanceNames={assignedMaintenanceNames}
  onMaintenanceAssign={handleAssignMaintenance}
  title="Mantenimientos Disponibles"
  showAssignedInfo={true}
  showSaveButton={false}
  width="800px"
  context="registration"
/>
```

## Uso en VehicleEdit

```tsx
<MaintenanceTable
  assignedMaintenances={assignedMaintenances}
  assignedMaintenanceNames={assignedMaintenanceNames}
  onMaintenanceAssign={handleAssignMaintenance}
  title="Mantenimientos"
  showAssignedInfo={true}
  showSaveButton={true}
  isSaving={isSaving}
  onSaveMaintenances={handleSaveMaintenances}
  width="800px"
  context="edit"
/>
```

## Funcionalidades

1. **Tabla de mantenimientos**: Muestra todos los mantenimientos disponibles con paginación
2. **Botones de asignación**: Permite asignar/remover mantenimientos con botones + y -
3. **Información de asignados**: Muestra cuántos mantenimientos están asignados
4. **Botón de guardar**: Permite persistir los cambios (solo en contexto de edición)
5. **Logging contextual**: Usa diferentes prefijos de log según el contexto

## Estilos

Los estilos están definidos en `MaintenanceTable.css` y incluyen:

- Estilos para el contenedor principal
- Estilos para la información de mantenimientos asignados
- Estilos para el botón de guardar con estados hover y disabled
- Clases CSS reutilizables

## Dependencias

- `@mui/x-data-grid` para la tabla
- `Table` component para la lógica de paginación
- `getMaintenanceCategories` service para obtener datos
- `Maintenance` type para tipado
