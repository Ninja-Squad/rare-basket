import { afterRenderEffect, ChangeDetectionStrategy, Component, ElementRef, input, viewChild } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'rb-chart',
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent {
  readonly configuration = input.required<ChartConfiguration<'doughnut', Array<number>>>();
  readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    afterRenderEffect(onCleanup => {
      const chart = new Chart(this.canvas().nativeElement, this.configuration());
      onCleanup(() => chart.destroy());
    });
  }
}
