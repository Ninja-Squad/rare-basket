import { Pipe, PipeTransform } from '@angular/core';
import { BaseEnumPipe } from '../shared/base-enum-pipe';
import { TranslateService } from '@ngx-translate/core';
import { DocumentType } from './order.model';

@Pipe({
  name: 'documentTypeEnum',
  standalone: true
})
export class DocumentTypeEnumPipe extends BaseEnumPipe<DocumentType> implements PipeTransform {
  constructor(translateService: TranslateService) {
    super(translateService, 'document-type');
  }
}
