import { Pipe, PipeTransform } from '@angular/core';
import { BaseEnumPipe } from '../shared/base-enum-pipe';
import { DocumentType } from './order.model';

@Pipe({
  name: 'documentTypeEnum',
  standalone: true
})
export class DocumentTypeEnumPipe extends BaseEnumPipe<DocumentType> implements PipeTransform {
  constructor() {
    super('document-type');
  }
}
