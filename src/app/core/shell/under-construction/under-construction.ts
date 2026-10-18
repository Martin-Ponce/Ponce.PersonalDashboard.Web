import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { Button } from '../../ui/components/button/button';
import { Card } from '../../ui/components/card/card';
import { PageHeader } from '../../ui/components/page-header/page-header';
import { Tag } from '../../ui/components/tag/tag';

/** Placeholder for pages that don't exist yet. */
@Component({
  selector: 'app-under-construction',
  imports: [TranslocoPipe, Button, Card, PageHeader, Tag],
  template: `
    <div class="under-construction">
      <app-page-header [header]="titleKey | transloco" />
      <app-card>
        <div class="under-construction__body">
          <div class="under-construction__notice">
            <app-tag [labelText]="'underConstruction.badge' | transloco" color="notice" />
            <span>{{
              'underConstruction.text' | transloco: { page: (titleKey | transloco).toLowerCase() }
            }}</span>
          </div>
          <app-button [text]="'underConstruction.back' | transloco" (clicked)="goToOverview()" />
        </div>
      </app-card>
    </div>
  `,
  styles: `
    .under-construction {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .under-construction__body {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 14px;
      padding: 16px;
      font-size: 14px;
    }

    .under-construction__notice {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }
  `,
})
export class UnderConstruction {
  private readonly router = inject(Router);

  protected readonly titleKey = inject(ActivatedRoute).snapshot.title ?? '';

  goToOverview(): void {
    this.router.navigate(['/overview']);
  }
}
