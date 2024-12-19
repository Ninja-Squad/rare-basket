import { ChartComponent } from './chart.component';
import { Component, signal } from '@angular/core';
import { ArcElement, Chart, ChartConfiguration, DoughnutController } from 'chart.js';
import { TestBed } from '@angular/core/testing';
import { ComponentTester, provideAutomaticChangeDetection } from 'ngx-speculoos';

@Component({
  template: '<rb-chart [configuration]="configuration()" />',
  imports: [ChartComponent]
})
class TestComponent {
  readonly configuration = signal<ChartConfiguration<'doughnut'>>({
    type: 'doughnut',
    data: {
      datasets: [
        {
          data: [1, 2, 3]
        }
      ]
    },
    options: {
      animation: {
        duration: 0
      }
    }
  });
}

describe('ChartComponent', () => {
  beforeEach(() => {
    Chart.register(DoughnutController, ArcElement);

    TestBed.configureTestingModule({
      providers: [provideAutomaticChangeDetection()]
    });
  });

  it('should display a chart', async () => {
    const tester = new ComponentTester(TestComponent);
    await tester.change();

    const canvas: HTMLCanvasElement = tester.element('canvas').nativeElement;
    expect(canvas.toDataURL().length).toBeGreaterThan(0);
    const chartComponent: ChartComponent = tester.component(ChartComponent);
    expect(chartComponent.configuration()).toBe(tester.componentInstance.configuration());
  });

  it('should display a different chart when input changes', async () => {
    const tester = new ComponentTester(TestComponent);
    await tester.change();

    const canvas: HTMLCanvasElement = tester.element('canvas').nativeElement;
    const firstImage = canvas.toDataURL();
    const chartComponent: ChartComponent = tester.component(ChartComponent);

    const newConfiguration: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: [4, 5, 6]
          }
        ]
      },
      options: {
        animation: {
          duration: 0
        }
      }
    };
    tester.componentInstance.configuration.set(newConfiguration);
    await tester.change();

    expect(canvas.toDataURL()).not.toBe(firstImage);
    expect(chartComponent.configuration()).toBe(newConfiguration);
  });
});
