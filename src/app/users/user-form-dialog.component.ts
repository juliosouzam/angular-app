import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDialogRef, Z_MODAL_DATA } from '@/shared/components/dialog';
import { ZardInputDirective } from '@/shared/components/input';

import type { User, UserDraft } from './user.model';

type UserFormControlName = 'name' | 'email' | 'phone';
type UserFormMode = 'create' | 'edit';

export interface UserFormDialogData {
  mode: UserFormMode;
  user?: User;
  onSubmit: (draft: UserDraft) => void;
}

@Component({
  selector: 'app-user-form-dialog',
  imports: [ReactiveFormsModule, ZardButtonComponent, ZardInputDirective],
  template: `
    <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <div class="grid gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium leading-none text-[#171717]" for="user-name"
            >Nome</label
          >
          <input
            id="user-name"
            z-input
            class="border-[#d4d4d4] bg-[#ffffff] text-[#171717] placeholder:text-[#737373]"
            type="text"
            formControlName="name"
            autocomplete="name"
            placeholder="Ada Lovelace"
            [attr.aria-invalid]="isInvalid('name')"
            [attr.aria-describedby]="isInvalid('name') ? 'user-name-error' : null"
          />

          @if (isInvalid('name')) {
            <p id="user-name-error" class="text-sm font-medium text-[#b91c1c]">
              {{ errorMessage('name') }}
            </p>
          }
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium leading-none text-[#171717]" for="user-email"
            >E-mail</label
          >
          <input
            id="user-email"
            z-input
            class="border-[#d4d4d4] bg-[#ffffff] text-[#171717] placeholder:text-[#737373]"
            type="email"
            formControlName="email"
            autocomplete="email"
            placeholder="ada@example.com"
            [attr.aria-invalid]="isInvalid('email')"
            [attr.aria-describedby]="isInvalid('email') ? 'user-email-error' : null"
          />

          @if (isInvalid('email')) {
            <p id="user-email-error" class="text-sm font-medium text-[#b91c1c]">
              {{ errorMessage('email') }}
            </p>
          }
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium leading-none text-[#171717]" for="user-phone"
            >Telefone</label
          >
          <input
            id="user-phone"
            z-input
            class="border-[#d4d4d4] bg-[#ffffff] text-[#171717] placeholder:text-[#737373]"
            type="tel"
            formControlName="phone"
            autocomplete="tel"
            placeholder="+55 85 99999-9999"
            [attr.aria-invalid]="isInvalid('phone')"
            [attr.aria-describedby]="isInvalid('phone') ? 'user-phone-error' : null"
          />

          @if (isInvalid('phone')) {
            <p id="user-phone-error" class="text-sm font-medium text-[#b91c1c]">
              {{ errorMessage('phone') }}
            </p>
          }
        </div>
      </div>

      <div class="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <button
          type="button"
          z-button
          zType="outline"
          class="border-[#d4d4d4] bg-[#ffffff] text-[#171717] hover:bg-[#f5f5f5]"
          (click)="close()"
        >
          Cancelar
        </button>
        <button type="submit" z-button class="bg-[#171717] text-[#ffffff] hover:bg-[#262626]">
          {{ submitLabel }}
        </button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormDialogComponent {
  private readonly data = inject<UserFormDialogData>(Z_MODAL_DATA);
  private readonly dialogRef = inject<ZardDialogRef<UserFormDialogComponent>>(ZardDialogRef);

  protected readonly submitLabel =
    this.data.mode === 'edit' ? 'Salvar alterações' : 'Criar usuário';

  protected readonly form = new FormGroup({
    name: new FormControl(this.data.user?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl(this.data.user?.email ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl(this.data.user?.phone ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[+()\-\s\d.]{8,}$/)],
    }),
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.data.onSubmit(this.form.getRawValue());
    this.close();
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected isInvalid(controlName: UserFormControlName): boolean {
    const control = this.form.controls[controlName];

    return control.invalid && (control.touched || control.dirty);
  }

  protected errorMessage(controlName: UserFormControlName): string {
    const control = this.form.controls[controlName];

    if (control.hasError('required')) {
      return 'Campo obrigatório.';
    }

    if (controlName === 'name' && control.hasError('minlength')) {
      return 'Informe pelo menos 2 caracteres.';
    }

    if (controlName === 'email' && control.hasError('email')) {
      return 'Informe um e-mail válido.';
    }

    if (controlName === 'phone' && control.hasError('pattern')) {
      return 'Informe um telefone válido.';
    }

    return 'Valor inválido.';
  }
}
