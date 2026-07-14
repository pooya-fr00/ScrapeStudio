import { LOCAL_DATA_LIMITS } from '@scrapestudio/shared';

import type { LocalHistoryEntry, ScrapeRecipe } from './model';
import { parseStoredRecipe } from './schema';

const DATABASE_NAME = 'scrapestudio-local';
const DATABASE_VERSION = 1;
const HISTORY_STORE = 'history';
const RECIPE_STORE = 'recipes';

export type LocalDataErrorCode = 'recipe_limit' | 'storage_unavailable';

export class LocalDataError extends Error {
  constructor(
    readonly code: LocalDataErrorCode,
    options?: ErrorOptions,
  ) {
    super(code, options);
    this.name = 'LocalDataError';
  }
}

export interface LocalDataStore {
  addHistory(entry: LocalHistoryEntry): Promise<void>;
  clearHistory(): Promise<void>;
  deleteRecipe(id: string): Promise<void>;
  getRecipe(id: string): Promise<ScrapeRecipe | undefined>;
  listHistory(): Promise<LocalHistoryEntry[]>;
  listRecipes(): Promise<ScrapeRecipe[]>;
  saveRecipe(recipe: ScrapeRecipe): Promise<void>;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.addEventListener('success', () => resolve(request.result), { once: true });
    request.addEventListener(
      'error',
      () => reject(request.error ?? new Error('IndexedDB request failed.')),
      { once: true },
    );
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.addEventListener('complete', () => resolve(), { once: true });
    transaction.addEventListener(
      'abort',
      () => reject(transaction.error ?? new Error('IndexedDB transaction aborted.')),
      { once: true },
    );
    transaction.addEventListener(
      'error',
      () => reject(transaction.error ?? new Error('IndexedDB transaction failed.')),
      { once: true },
    );
  });
}

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new LocalDataError('storage_unavailable'));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.addEventListener(
      'upgradeneeded',
      () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(RECIPE_STORE)) {
          database.createObjectStore(RECIPE_STORE, { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains(HISTORY_STORE)) {
          database.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
        }
      },
      { once: true },
    );
    request.addEventListener('success', () => resolve(request.result), { once: true });
    request.addEventListener(
      'error',
      () => reject(new LocalDataError('storage_unavailable', { cause: request.error })),
      { once: true },
    );
    request.addEventListener('blocked', () => reject(new LocalDataError('storage_unavailable')), {
      once: true,
    });
  });
}

function byNewest<T extends { timestamp: string }>(left: T, right: T): number {
  return right.timestamp.localeCompare(left.timestamp);
}

function recipesByNewest(left: ScrapeRecipe, right: ScrapeRecipe): number {
  return right.updatedAt.localeCompare(left.updatedAt);
}

export class IndexedDbLocalDataStore implements LocalDataStore {
  private databasePromise: Promise<IDBDatabase> | undefined;

  private database(): Promise<IDBDatabase> {
    this.databasePromise ??= openDatabase();
    return this.databasePromise;
  }

  async addHistory(entry: LocalHistoryEntry): Promise<void> {
    const database = await this.database();
    const write = database.transaction(HISTORY_STORE, 'readwrite');
    const writeDone = transactionToPromise(write);
    write.objectStore(HISTORY_STORE).put(entry);
    await writeDone;

    const entries = await this.listHistory();
    const expired = entries.slice(LOCAL_DATA_LIMITS.historyEntries);
    if (expired.length === 0) {
      return;
    }
    const cleanup = database.transaction(HISTORY_STORE, 'readwrite');
    const cleanupDone = transactionToPromise(cleanup);
    for (const candidate of expired) {
      cleanup.objectStore(HISTORY_STORE).delete(candidate.id);
    }
    await cleanupDone;
  }

  async clearHistory(): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(HISTORY_STORE, 'readwrite');
    const done = transactionToPromise(transaction);
    transaction.objectStore(HISTORY_STORE).clear();
    await done;
  }

  async deleteRecipe(id: string): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(RECIPE_STORE, 'readwrite');
    const done = transactionToPromise(transaction);
    transaction.objectStore(RECIPE_STORE).delete(id);
    await done;
  }

  async getRecipe(id: string): Promise<ScrapeRecipe | undefined> {
    const database = await this.database();
    const transaction = database.transaction(RECIPE_STORE, 'readonly');
    const value = await requestToPromise(transaction.objectStore(RECIPE_STORE).get(id));
    return parseStoredRecipe(value);
  }

  async listHistory(): Promise<LocalHistoryEntry[]> {
    const database = await this.database();
    const transaction = database.transaction(HISTORY_STORE, 'readonly');
    const entries = await requestToPromise<LocalHistoryEntry[]>(
      transaction.objectStore(HISTORY_STORE).getAll(),
    );
    return entries.sort(byNewest);
  }

  async listRecipes(): Promise<ScrapeRecipe[]> {
    const database = await this.database();
    const transaction = database.transaction(RECIPE_STORE, 'readonly');
    const values = await requestToPromise<unknown[]>(
      transaction.objectStore(RECIPE_STORE).getAll(),
    );
    return values
      .map(parseStoredRecipe)
      .filter((recipe): recipe is ScrapeRecipe => recipe !== undefined)
      .sort(recipesByNewest);
  }

  async saveRecipe(recipe: ScrapeRecipe): Promise<void> {
    const existing = await this.getRecipe(recipe.id);
    if (!existing && (await this.listRecipes()).length >= LOCAL_DATA_LIMITS.recipes) {
      throw new LocalDataError('recipe_limit');
    }

    const database = await this.database();
    const transaction = database.transaction(RECIPE_STORE, 'readwrite');
    const done = transactionToPromise(transaction);
    transaction.objectStore(RECIPE_STORE).put(recipe);
    await done;
  }
}

export class MemoryLocalDataStore implements LocalDataStore {
  private readonly history = new Map<string, LocalHistoryEntry>();
  private readonly recipes = new Map<string, ScrapeRecipe>();

  async addHistory(entry: LocalHistoryEntry): Promise<void> {
    this.history.set(entry.id, structuredClone(entry));
    const expired = (await this.listHistory()).slice(LOCAL_DATA_LIMITS.historyEntries);
    for (const candidate of expired) {
      this.history.delete(candidate.id);
    }
  }

  async clearHistory(): Promise<void> {
    this.history.clear();
  }

  async deleteRecipe(id: string): Promise<void> {
    this.recipes.delete(id);
  }

  async getRecipe(id: string): Promise<ScrapeRecipe | undefined> {
    const recipe = this.recipes.get(id);
    return recipe ? structuredClone(recipe) : undefined;
  }

  async listHistory(): Promise<LocalHistoryEntry[]> {
    return Array.from(this.history.values(), (entry) => structuredClone(entry)).sort(byNewest);
  }

  async listRecipes(): Promise<ScrapeRecipe[]> {
    return Array.from(this.recipes.values(), (recipe) => structuredClone(recipe)).sort(
      recipesByNewest,
    );
  }

  async saveRecipe(recipe: ScrapeRecipe): Promise<void> {
    if (!this.recipes.has(recipe.id) && this.recipes.size >= LOCAL_DATA_LIMITS.recipes) {
      throw new LocalDataError('recipe_limit');
    }
    this.recipes.set(recipe.id, structuredClone(recipe));
  }
}

export const localDataStore: LocalDataStore = new IndexedDbLocalDataStore();
