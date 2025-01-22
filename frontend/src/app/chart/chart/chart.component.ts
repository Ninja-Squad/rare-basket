import { Component, ElementRef, NgZone, inject, input, viewChild, afterRenderEffect, ChangeDetectionStrategy } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'rb-chart',
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent {
  private readonly zone = inject(NgZone);

  readonly configuration = input.required<ChartConfiguration<'doughnut', Array<number>>>();
  readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    afterRenderEffect(onCleanup => {
      this.zone.runOutsideAngular(() => {
        const chart = new Chart(this.canvas().nativeElement, this.configuration());
        onCleanup(() => chart.destroy());
      });
    });
  }
}
