// Utilidades para transformar parámetros
export function camelToKebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export function kebabToCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function transformObjectKeys(
  obj: Record<string, any>, 
  transformer: (key: string) => string
): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      result[transformer(key)] = value;
    }
  });
  
  return result;
}

// Transformar parámetros de camelCase a kebab-case (para enviar al backend)
export function transformParamsToKebabCase(params: Record<string, any>): Record<string, any> {
  return transformObjectKeys(params, camelToKebabCase);
}

// Transformar parámetros de kebab-case a camelCase (para recibir del backend)
export function transformParamsToCamelCase(params: Record<string, any>): Record<string, any> {
  return transformObjectKeys(params, kebabToCamelCase);
}
