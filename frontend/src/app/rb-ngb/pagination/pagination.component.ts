import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Page } from '../../shared/page.model';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'rb-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  standalone: true,
  imports: [NgbPagination]
})
export class PaginationComponent {
  @Input({ required: true }) page!: Page<unknown>;
  @Output() readonly pageChanged = new EventEmitter<number>();

  @Input() navigate = false;

  private router = inject(Router, { optional: true });
  private route = inject(ActivatedRoute, { optional: true });

  onPageChanged($event: number) {
    const newPage = $event - 1;
    this.pageChanged.emit(newPage);

    if (this.navigate && this.router && this.route) {
      this.router.navigate(['.'], { relativeTo: this.route, queryParams: { page: newPage }, queryParamsHandling: 'merge' });
    }
  }
}
