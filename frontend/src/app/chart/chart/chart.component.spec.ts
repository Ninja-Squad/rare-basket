import { ChartComponent } from './chart.component';
import { Component } from '@angular/core';
import { ArcElement, Chart, ChartConfiguration, DoughnutController } from 'chart.js';
import { TestBed } from '@angular/core/testing';
import { ComponentTester } from 'ngx-speculoos';

@Component({
  template: '<rb-chart [configuration]="configuration"></rb-chart>',
  standalone: true,
  imports: [ChartComponent]
})
class TestComponent {
  configuration: ChartConfiguration<'doughnut'> = {
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
  };
}

describe('ChartComponent', () => {
  beforeEach(() => {
    Chart.register(DoughnutController, ArcElement);

    TestBed.configureTestingModule({});
  });

  it('should display a chart', () => {
    const tester = new ComponentTester(TestComponent);
    tester.detectChanges();

    const canvas: HTMLCanvasElement = tester.element('canvas').nativeElement;
    expect(canvas.toDataURL().length).toBeGreaterThan(0);
    const chartComponent: ChartComponent = tester.component(ChartComponent);
    expect(chartComponent.configuration).toBe(tester.componentInstance.configuration);
  });

  it('should display a different chart when input changes', () => {
    const tester = new ComponentTester(TestComponent);
    tester.detectChanges();

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
    tester.componentInstance.configuration = newConfiguration;
    tester.detectChanges();

    expect(canvas.toDataURL()).not.toBe(firstImage);
    expect(chartComponent.configuration).toBe(newConfiguration);
  });
});
