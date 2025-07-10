const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000"; // Ajusta el puerto si es necesario


export interface User {
  id: number;
  name: string;
  email: string;
 
}

export interface GetUsersParams {
  email?: string;
  dni?: string;
  "first-name"?: string;
  "last-name"?: string;
  page?: number;
  limit?: number;
}

export async function getUsers(params?: GetUsersParams): Promise<User[]> {
  const query = params
    ? "?" +
      Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    : "";

  const response = await fetch(`${API_URL}/users${query}`);
  if (!response.ok) throw new Error("Error al obtener usuarios");
  return response.json();
}