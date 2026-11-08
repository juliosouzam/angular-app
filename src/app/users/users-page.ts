import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideMail,
  lucidePencil,
  lucidePhone,
  lucidePlus,
  lucideTrash2,
  lucideUsers,
} from '@ng-icons/lucide';

import { ZardAlertDialogService } from '@/shared/components/alert-dialog';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDialogService } from '@/shared/components/dialog';
import { ZardTableImports } from '@/shared/components/table';

import type { User } from './user.model';
import { UserFormDialogComponent, type UserFormDialogData } from './user-form-dialog.component';
import { UsersStore } from './users.store';

@Component({
  selector: 'app-users-page',
  imports: [NgIcon, ZardButtonComponent, ...ZardTableImports],
  templateUrl: './users-page.html',
  styleUrl: './users-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({ lucideMail, lucidePencil, lucidePhone, lucidePlus, lucideTrash2, lucideUsers }),
  ],
})
export class UsersPage {
  private readonly usersStore = inject(UsersStore);
  private readonly dialog = inject(ZardDialogService);
  private readonly alertDialog = inject(ZardAlertDialogService);

  protected readonly users = this.usersStore.users;
  protected readonly totalUsers = this.usersStore.totalUsers;

  protected openCreateDialog(): void {
    this.dialog.create<UserFormDialogComponent, UserFormDialogData>({
      zTitle: 'Criar usuário',
      zDescription: 'Preencha os dados para cadastrar um novo usuário.',
      zContent: UserFormDialogComponent,
      zData: {
        mode: 'create',
        onSubmit: (draft) => this.usersStore.create(draft),
      },
      zHideFooter: true,
      zMaskClosable: false,
      zCustomClasses: 'bg-[#ffffff] text-[#171717]',
      zWidth: 'min(92vw, 520px)',
    });
  }

  protected openEditDialog(user: User): void {
    this.dialog.create<UserFormDialogComponent, UserFormDialogData>({
      zTitle: 'Editar usuário',
      zDescription: 'Atualize os dados cadastrais do usuário.',
      zContent: UserFormDialogComponent,
      zData: {
        mode: 'edit',
        user,
        onSubmit: (draft) => this.usersStore.update(user.id, draft),
      },
      zHideFooter: true,
      zMaskClosable: false,
      zCustomClasses: 'bg-[#ffffff] text-[#171717]',
      zWidth: 'min(92vw, 520px)',
    });
  }

  protected confirmDelete(user: User): void {
    this.alertDialog.confirm({
      zTitle: 'Excluir usuário',
      zDescription: `Tem certeza que deseja excluir ${user.name}? Esta ação não pode ser desfeita.`,
      zOkText: 'Excluir',
      zCancelText: 'Cancelar',
      zOkDestructive: true,
      zCustomClasses: 'bg-[#ffffff] text-[#171717]',
      zOnOk: () => this.usersStore.delete(user.id),
    });
  }
}
