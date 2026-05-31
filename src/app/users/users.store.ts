import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { ulid } from 'ulid';

import type { User, UserDraft } from './user.model';

const STORAGE_KEY = 'angular-app.users';

@Injectable({
  providedIn: 'root',
})
export class UsersStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly usersState = signal<User[]>(this.loadUsers());

  readonly users = this.usersState.asReadonly();
  readonly totalUsers = computed(() => this.usersState().length);

  create(draft: UserDraft): void {
    const user: User = {
      id: ulid(),
      ...this.normalizeDraft(draft),
    };

    this.save([...this.usersState(), user]);
  }

  update(id: string, draft: UserDraft): void {
    const updated = this.usersState().map((user) =>
      user.id === id
        ? {
            ...user,
            ...this.normalizeDraft(draft),
          }
        : user,
    );

    this.save(updated);
  }

  delete(id: string): void {
    this.save(this.usersState().filter((user) => user.id !== id));
  }

  private normalizeDraft(draft: UserDraft): UserDraft {
    return {
      name: draft.name.trim(),
      email: draft.email.trim().toLowerCase(),
      phone: draft.phone.trim(),
    };
  }

  private save(users: User[]): void {
    this.usersState.set(users);

    const storage = this.getStorage();

    if (!storage) {
      return;
    }

    storage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  private loadUsers(): User[] {
    const storage = this.getStorage();

    if (!storage) {
      return [];
    }

    const storedUsers = storage.getItem(STORAGE_KEY);

    if (!storedUsers) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(storedUsers);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(isUser);
    } catch {
      return [];
    }
  }

  private getStorage(): Storage | null {
    if (!isPlatformBrowser(this.platformId) || typeof globalThis.localStorage === 'undefined') {
      return null;
    }

    const storage = globalThis.localStorage;

    if (typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
      return null;
    }

    return storage;
  }
}

function isUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const maybeUser = value as Record<string, unknown>;

  return (
    typeof maybeUser['id'] === 'string' &&
    typeof maybeUser['name'] === 'string' &&
    typeof maybeUser['email'] === 'string' &&
    typeof maybeUser['phone'] === 'string'
  );
}
