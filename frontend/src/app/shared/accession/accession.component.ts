import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Accession } from '../../basket/basket.model';

@Component({
  selector: 'rb-accession',
  templateUrl: './accession.component.html',
  styleUrls: ['./accession.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AccessionComponent {
  @Input()
  accession: Accession;
}
