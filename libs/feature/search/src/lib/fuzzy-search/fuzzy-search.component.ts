import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core'
import { SearchApiService } from '@geonetwork-ui/data-access/gn4'
import {
  AutcompleteItem,
  AutocompleteComponent,
} from '@geonetwork-ui/ui/inputs'
import {
  ElasticsearchService,
  EsSearchResponse,
  MetadataRecord,
} from '@geonetwork-ui/util/shared'
import { map } from 'rxjs/operators'
import { SearchFacade } from '../state/search.facade'
import { ElasticsearchMapper } from '../utils/mapper'
import { SearchService } from '../utils/service/search.service'

@Component({
  selector: 'gn-ui-fuzzy-search',
  templateUrl: './fuzzy-search.component.html',
  styleUrls: ['./fuzzy-search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FuzzySearchComponent {
  @Input() value?: MetadataRecord
  @ViewChild(AutocompleteComponent) autocomplete: AutocompleteComponent
  @Output() itemSelected = new EventEmitter<MetadataRecord>()
  @Output() inputSubmited = new EventEmitter<string>()
  displayWithFn: (MetadataRecord) => string = (record) => record?.title

  autoCompleteAction = (query) =>
    this.searchApiService
      .search(
        'bucket',
        JSON.stringify(this.esService.buildAutocompletePayload(query))
      )
      .pipe(
        map((response: EsSearchResponse) => this.esMapper.toRecords(response))
      )

  constructor(
    private searchFacade: SearchFacade,
    private searchApiService: SearchApiService,
    private searchService: SearchService,
    private esMapper: ElasticsearchMapper,
    private esService: ElasticsearchService
  ) {}

  /**
   * Emit the event if the parent component has subscribed to it, so it
   * can define the correct behavior. If no component is listening to that
   * event, then apply the default behavior
   * @param item
   */
  handleItemSelection(item: AutcompleteItem) {
    const record = item as MetadataRecord
    if (this.itemSelected.observers.length > 0) {
      this.itemSelected.emit(record)
    } else {
      this.searchFacade.setFilters({ any: record.title })
    }
  }

  handleInputSubmission(any: string) {
    this.searchService.updateSearch({ any })
  }
}
