import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Accession } from '../../basket/basket.model';

@Component({
  selector: 'rb-accession',
  templateUrl: './accession.component.html',
  styleUrl: './accession.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessionComponent {
  readonly accession = input.required<Accession>();
}
