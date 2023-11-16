import { AfterViewInit, Component, ElementRef, Input, NgZone, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'rb-chart',
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
  standalone: true
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() configuration: ChartConfiguration<any>;
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;

  private chart: Chart;

  constructor(private zone: NgZone) {}

  ngOnChanges() {
    this.createChart();
  }

  ngAfterViewInit() {
    this.createChart();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createChart() {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.canvas) {
      const ctx = this.canvas.nativeElement;
      this.zone.runOutsideAngular(() => {
        this.chart = new Chart(ctx, this.configuration);
      });
    }
  }
}
