const API_URL = 'https://pokeapi.co/api/v2';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, 'No pudimos conectarnos con PokéAPI.');
  }
  if (!response.ok) throw new ApiError(response.status, `PokéAPI respondió ${response.status}.`);
  return response.json() as Promise<T>;
}
