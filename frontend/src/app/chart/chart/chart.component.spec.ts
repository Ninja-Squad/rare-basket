import { ChartComponent } from './chart.component';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ArcElement, Chart, ChartConfiguration, DoughnutController } from 'chart.js';
import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, test } from 'vitest';

@Component({
  template: '<rb-chart [configuration]="configuration()" />',
  imports: [ChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
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

    TestBed.configureTestingModule({});
  });

  test('should display a chart', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();

    const canvas = page.elementLocator(fixture.nativeElement).getByCss('canvas').element() as HTMLCanvasElement;
    expect(canvas.toDataURL().length).toBeGreaterThan(0);
    const chartComponent: ChartComponent = fixture.debugElement.query(By.directive(ChartComponent)).componentInstance;
    expect(chartComponent.configuration()).toBe(fixture.componentInstance.configuration());
  });

  test('should display a different chart when input changes', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();

    const canvas = page.elementLocator(fixture.nativeElement).getByCss('canvas').element() as HTMLCanvasElement;
    const firstImage = canvas.toDataURL();
    const chartComponent: ChartComponent = fixture.debugElement.query(By.directive(ChartComponent)).componentInstance;

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
    fixture.componentInstance.configuration.set(newConfiguration);
    await fixture.whenStable();

    expect(canvas.toDataURL()).not.toBe(firstImage);
    expect(chartComponent.configuration()).toBe(newConfiguration);
  });
});
