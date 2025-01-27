import { ChangeDetectionStrategy, Component } from '@angular/core'
import { SupportedType, SupportedTypes } from '@geonetwork-ui/data-fetcher'
import { MetadataLinkValid } from '@geonetwork-ui/util/shared'
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  throwError,
} from 'rxjs'
import {
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators'
import { MdViewFacade } from '../state'
import { getFileFormat, LinkHelperService } from '@geonetwork-ui/feature/search'
import { DataService } from '../service/data.service'

@Component({
  selector: 'gn-ui-data-view-table',
  templateUrl: './data-view-table.component.html',
  styleUrls: ['./data-view-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataViewTableComponent {
  selectionId = 0
  compatibleDataLinks$ = combineLatest([
    this.mdViewFacade.dataLinks$,
    this.mdViewFacade.geoDataLinks$,
  ]).pipe(map(([dataLinks, geoDataLinks]) => [...dataLinks, ...geoDataLinks]))
  dropdownChoices$ = this.compatibleDataLinks$.pipe(
    map((links) =>
      links.map((link, index) => ({
        label: this.linkHelper.getLinkLabelWithFormat(link),
        value: index,
      }))
    )
  )
  selectedLinkIndex$ = new BehaviorSubject(0)

  loading = false
  error = null

  tableData$ = combineLatest([
    this.compatibleDataLinks$,
    this.selectedLinkIndex$.pipe(distinctUntilChanged()),
  ]).pipe(
    map(([links, index]) => links[index]),
    switchMap((link) => {
      this.loading = true
      this.error = null
      return link
        ? this.fetchData(link).pipe(
            catchError((error) => {
              this.error = error.message
              return of([])
            }),
            finalize(() => {
              this.loading = false
            })
          )
        : of([])
    }),
    shareReplay(1)
  )

  constructor(
    private mdViewFacade: MdViewFacade,
    private linkHelper: LinkHelperService,
    private dataService: DataService
  ) {}

  fetchData(link: MetadataLinkValid): Observable<{ id: string | number }[]> {
    if (this.linkHelper.isWfsLink(link)) {
      return this.dataService
        .getGeoJsonDownloadUrlFromWfs(link.url, link.name)
        .pipe(
          switchMap((url) =>
            this.dataService.readGeoJsonDataset(url).pipe(
              map((featureCollection) =>
                featureCollection.features.map((f) => ({
                  id: f.id,
                  ...f.properties,
                }))
              )
            )
          )
        )
    } else if (this.linkHelper.hasProtocolDownload(link)) {
      const format = getFileFormat(link)
      const supportedType =
        SupportedTypes.indexOf(format as any) > -1
          ? (format as SupportedType)
          : undefined
      return this.dataService.readDataset(link.url, supportedType).pipe(
        map((featureCollection) =>
          featureCollection.features.map((f) => ({
            id: f.id,
            ...f.properties,
          }))
        )
      )
    } else if (this.linkHelper.isEsriRestFeatureServer(link)) {
      const url = this.dataService.getGeoJsonDownloadUrlFromEsriRest(link.url)
      return this.dataService.readGeoJsonDataset(url).pipe(
        map((featureCollection) =>
          featureCollection.features.map((f) => ({
            id: f.id,
            ...f.properties,
          }))
        )
      )
    }
    return throwError('protocol not supported')
  }

  selectLinkToDisplay(link: number) {
    this.selectedLinkIndex$.next(link)
  }

  onTableSelect(event) {
    console.log(event)
  }
}
