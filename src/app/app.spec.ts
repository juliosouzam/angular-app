import { TestBed } from '@angular/core/testing';
import userEvent from '@testing-library/user-event';
import { provideRouter, Router } from '@angular/router';

import { ZardAlertDialogService } from '@/shared/components/alert-dialog';
import { ZardDialogService } from '@/shared/components/dialog';

import { App } from './app';
import { routes } from './app.routes';
import { UsersStore } from './users/users.store';

describe('App navigation', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<App>>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        { provide: ZardDialogService, useValue: { create: vi.fn() } },
        { provide: ZardAlertDialogService, useValue: { confirm: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    router = TestBed.inject(Router);
  });

  it('lazy-loads the users page as a feature route', () => {
    const usersRoute = routes.find((route) => route.path === 'usuarios');

    expect(usersRoute?.component).toBeUndefined();
    expect(usersRoute?.loadComponent).toEqual(expect.any(Function));
  });

  it('reaches the users navigation link with the Tab key', async () => {
    await router.navigateByUrl('/usuarios');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const usersLink = (fixture.nativeElement as HTMLElement).querySelector(
      'nav a',
    ) as HTMLAnchorElement | null;
    expect(usersLink).not.toBeNull();
    expect(usersLink?.getAttribute('href')).toBe('/usuarios');
    expect(usersLink?.hasAttribute('tabindex')).toBe(false);

    // Simulate sequential keyboard focus navigation rather than calling focus() on the target.
    await userEvent.setup().tab();
    expect(document.activeElement).toBe(usersLink);
  });

  it('declares responsive shell and mobile users layouts', async () => {
    TestBed.inject(UsersStore).create({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '123',
    });
    await router.navigateByUrl('/usuarios');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const headerLayout = compiled.querySelector('header > div');
    const navigationList = compiled.querySelector('nav ul');
    const desktopTable = compiled.querySelector('table')?.parentElement;
    const mobileCards = compiled.querySelector('main section > div.divide-y');

    // Tailwind responsive classes specify the narrow layout and its larger-screen breakpoints.
    expect(headerLayout?.classList.contains('flex-col')).toBe(true);
    expect(headerLayout?.classList.contains('sm:flex-row')).toBe(true);
    expect(navigationList?.classList.contains('flex-wrap')).toBe(true);
    expect(desktopTable?.classList.contains('hidden')).toBe(true);
    expect(desktopTable?.classList.contains('md:block')).toBe(true);
    expect(mobileCards?.classList.contains('md:hidden')).toBe(true);
  });

  it('redirects the root URL to the users page and marks its navigation link active', async () => {
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const usersLink = compiled.querySelector('nav a');
    expect(router.url).toBe('/usuarios');
    expect(compiled.querySelector('h1')?.textContent).toContain('CRUD de usuários');
    expect(usersLink?.getAttribute('aria-current')).toBe('page');
  });

  it('renders the users page on direct navigation to /usuarios', async () => {
    await router.navigateByUrl('/usuarios');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/usuarios');
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain(
      'CRUD de usuários',
    );
  });

  it('redirects unknown URLs to the users page instead of rendering an empty outlet', async () => {
    await router.navigateByUrl('/nao-existe');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/usuarios');
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain(
      'CRUD de usuários',
    );
  });
});
