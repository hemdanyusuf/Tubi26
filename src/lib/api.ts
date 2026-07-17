export type UserProfile = {
  id: number;
  username: string;
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female' | 'other';
  activity_level: string;
  daily_calories: number;
  preferences: string[];
};

export type Food = {
  id: number;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
};

export type InventoryItem = {
  id: number;
  food_id: number;
  name: string;
  category: string;
  quantity: number;
  expiry_date: string | null;
  added_at: string;
  calories: number;
};

export type RecipeIngredient = {
  food_id: number;
  name: string;
  required: number;
  available: number;
  unit: string;
  shortage?: number;
};

export type Recipe = {
  id: number;
  name: string;
  description: string;
  calories_per_serving: number;
  prep_time: number;
  cook_time: number;
  difficulty: string;
  category: string;
  can_make: boolean;
  matching_count: number;
  ingredient_count: number;
  available_ingredients: RecipeIngredient[];
  missing_ingredients: RecipeIngredient[];
};

export type ShoppingItem = {
  id: number;
  food_id: number;
  name: string;
  category: string;
  quantity: number;
  reason: string;
  checked: boolean;
  source: 'manual' | 'recipe';
};

export type DashboardData = {
  profile: UserProfile;
  calories: { target: number; consumed: number; burned: number; remaining: number };
  inventory: { item_count: number; expiring_count: number; categories: Record<string, number> };
  recommended_recipe: Recipe | null;
};

type ApiEnvelope<T> = T & { ok: true };

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');

  const response = await fetch(`/api${path}`, { ...init, headers });
  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | { ok: false; error?: string }
    | null;

  if (!response.ok || !payload || payload.ok !== true) {
    const message = payload && 'error' in payload ? payload.error : undefined;
    throw new Error(message || `İstek tamamlanamadı (HTTP ${response.status}).`);
  }
  const { ok: _ok, ...data } = payload;
  return data as T;
}

export type SaveUserInput = Omit<UserProfile, 'id' | 'daily_calories'> & { id?: number };

export const apiSaveUser = (data: SaveUserInput) =>
  requestJson<{ user: UserProfile }>('/user', { method: 'POST', body: JSON.stringify(data) });
export const apiGetUser = (userId: number) => requestJson<{ user: UserProfile }>(`/user/${userId}`);
export const apiGetFoods = () => requestJson<{ foods: Food[] }>('/foods');
export const apiGetInventory = (userId: number) => requestJson<{ items: InventoryItem[] }>(`/inventory/${userId}`);
export const apiAddInventory = (data: { user_id: number; food_id: number; quantity: number; expiry_date?: string }) =>
  requestJson<{ item_id: number }>('/inventory', { method: 'POST', body: JSON.stringify(data) });
export const apiDeleteInventory = (itemId: number, userId: number) =>
  requestJson<Record<string, never>>(`/inventory/${itemId}?user_id=${userId}`, { method: 'DELETE' });
export const apiGetRecipes = (userId: number) => requestJson<{ recipes: Recipe[] }>(`/recipes/${userId}`);
export const apiGetShopping = (userId: number) => requestJson<{ items: ShoppingItem[] }>(`/shopping/${userId}`);
export const apiAddShopping = (data: { user_id: number; food_id: number; quantity: number; reason?: string }) =>
  requestJson<{ item_id: number }>('/shopping', { method: 'POST', body: JSON.stringify(data) });
export const apiUpdateShopping = (itemId: number, userId: number, checked: boolean) =>
  requestJson<Record<string, never>>(`/shopping/${itemId}`, { method: 'PATCH', body: JSON.stringify({ user_id: userId, checked }) });
export const apiDeleteShopping = (itemId: number, userId: number) =>
  requestJson<Record<string, never>>(`/shopping/${itemId}?user_id=${userId}`, { method: 'DELETE' });
export const apiGetDashboard = (userId: number) => requestJson<DashboardData>(`/dashboard/${userId}`);
export const apiAddMeal = (data: { user_id: number; name: string; calories: number; meal_type: string }) =>
  requestJson<{ id: number }>('/meals', { method: 'POST', body: JSON.stringify(data) });
export const apiAddActivity = (data: { user_id: number; name: string; burned_calories: number }) =>
  requestJson<{ id: number }>('/activities', { method: 'POST', body: JSON.stringify(data) });
export const apiChat = (userId: number, message: string) =>
  requestJson<{ text: string; source: 'gemini' | 'local' }>('/chat', { method: 'POST', body: JSON.stringify({ user_id: userId, message }) });
