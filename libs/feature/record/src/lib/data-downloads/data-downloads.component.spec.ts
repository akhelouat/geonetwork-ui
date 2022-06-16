import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing'
import { BehaviorSubject, of, throwError } from 'rxjs'
import { MdViewFacade } from '../state'
import { DataDownloadsComponent } from './data-downloads.component'
import { MetadataLink } from '@geonetwork-ui/util/shared'
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core'
import { By } from '@angular/platform-browser'
import { DataService } from '../service/data.service'

class MdViewFacadeMock {
  downloadLinks$ = new BehaviorSubject([])
}

class DataServiceMock {
  getDownloadLinksFromWfs = jest.fn((link) =>
    link.url.indexOf('error') > -1
      ? throwError(new Error('would not fetch links'))
      : of([
          {
            ...link,
            format: 'geojson',
          },
          {
            ...link,
            format: 'csv',
          },
          {
            ...link,
            format: 'gml',
          },
        ])
  )
  getDownloadLinksFromEsriRest = jest.fn((link) => [
    {
      ...link,
      format: 'REST:json',
      url: `${link.url}/query?f=json&where=1=1&outFields=*`,
    },
    {
      ...link,
      format: 'REST:geojson',
      url: `${link.url}/query?f=geojson&where=1=1&outFields=*`,
    },
  ])
}

@Component({
  selector: 'gn-ui-download-item',
  template: '<div></div>',
})
export class MockDownloadsListItemComponent {
  @Input() link: MetadataLink
}

@Component({
  selector: 'gn-ui-popup-alert',
  template: '<div></div>',
})
export class MockPopupAlertComponent {}

describe('DataDownloadsComponent', () => {
  let component: DataDownloadsComponent
  let fixture: ComponentFixture<DataDownloadsComponent>
  let facade

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DataDownloadsComponent,
        MockDownloadsListItemComponent,
        MockPopupAlertComponent,
      ],
      providers: [
        {
          provide: MdViewFacade,
          useClass: MdViewFacadeMock,
        },
        {
          provide: DataService,
          useClass: DataServiceMock,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()
    facade = TestBed.inject(MdViewFacade)
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(DataDownloadsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('download links', () => {
    describe('when the WFS service fails', () => {
      beforeEach(() => {
        facade.downloadLinks$.next([
          {
            description: 'Lieu de surveillance (point)',
            name: 'surval_parametre_point.csv',
            protocol: 'WWW:DOWNLOAD',
            url: 'https://www.ifremer.fr/surval_parametre_point.csv',
          },
          {
            description: 'Lieu de surveillance (ligne)',
            name: 'surval_parametre_ligne',
            protocol: 'OGC:WFS',
            url: 'https://error/wfs/surveillance_littorale',
          },
        ])
        fixture.detectChanges()
      })
      it('emits the other links', fakeAsync(() => {
        let downloadLinks = []
        component.links$.subscribe((links: MetadataLink[]) => {
          downloadLinks = links
        })
        tick(200)
        expect(downloadLinks).toEqual([
          {
            description: 'Lieu de surveillance (point)',
            name: 'surval_parametre_point.csv',
            format: 'csv',
            protocol: 'WWW:DOWNLOAD',
            url: 'https://www.ifremer.fr/surval_parametre_point.csv',
          },
        ])
      }))
      // disable error handling in UI
      it.skip('shows an error', () => {
        const popup = fixture.debugElement.query(
          By.directive(MockPopupAlertComponent)
        )
        expect(popup).toBeTruthy()
      })
    })

    describe('with no link compatible with DOWNLOAD usage', () => {
      beforeEach(() => {
        facade.downloadLinks$.next([])
        fixture.detectChanges()
      })
      it('emits no links', () => {
        component.links$.subscribe((links: MetadataLink[]) => {
          expect(links).toEqual([])
        })
      })
    })

    describe('with links compatible with DOWNLOAD usage', () => {
      beforeEach(() => {
        facade.downloadLinks$.next([
          {
            description: 'Lieu de surveillance (point)',
            name: 'surval_parametre_point.csv',
            protocol: 'WWW:DOWNLOAD',
            url: 'https://www.ifremer.fr/surval_parametre_point.csv',
          },
          {
            description: 'Lieu de surveillance (polygone)',
            name: 'surval_parametre_polygone.geojson',
            protocol: 'WWW:DOWNLOAD',
            url: 'https://www.ifremer.fr/surval_parametre_polygone.geojson',
          },
          {
            description: 'Lieu de surveillance (ligne)',
            name: 'surval_parametre_ligne',
            protocol: 'OGC:WFS',
            url: 'https://www.ifremer.fr/services/wfs/surveillance_littorale',
          },
          {
            protocol: 'ESRI:REST',
            name: 'mes_hdf',
            format: 'arcgis geoservices rest api',
            description: 'ArcGIS GeoService Wfs',
            mediaType: 'application/json',
            url: 'https://services8.arcgis.com/rxZzohbySMKHTNcy/arcgis/rest/services/mes_hdf/WFSServer/0',
          },
          {
            protocol: 'ESRI:REST',
            name: 'mes_hdf_journalier_poll_princ',
            format: 'arcgis geoservices rest api',
            description: 'ArcGIS GeoService',
            mediaType: 'application/json',
            url: 'https://services8.arcgis.com/rxZzohbySMKHTNcy/arcgis/rest/services/mes_hdf_journalier_poll_princ/FeatureServer/0',
          },
        ])
        fixture.detectChanges()
      })
      it('emits download links once per format', fakeAsync(() => {
        let downloadLinks = []
        component.links$.subscribe((links: MetadataLink[]) => {
          downloadLinks = links
        })
        tick(200)
        expect(downloadLinks).toEqual([
          {
            description: 'Lieu de surveillance (point)',
            format: 'csv',
            name: 'surval_parametre_point.csv',
            protocol: 'WWW:DOWNLOAD',
            url: 'https://www.ifremer.fr/surval_parametre_point.csv',
          },
          {
            description: 'Lieu de surveillance (ligne)',
            format: 'WFS:csv',
            name: 'surval_parametre_ligne',
            protocol: 'OGC:WFS',
            url: 'https://www.ifremer.fr/services/wfs/surveillance_littorale',
          },
          {
            description: 'ArcGIS GeoService Wfs',
            format: 'WFS:csv',
            mediaType: 'application/json',
            name: 'mes_hdf',
            protocol: 'ESRI:REST',
            url: 'https://services8.arcgis.com/rxZzohbySMKHTNcy/arcgis/rest/services/mes_hdf/WFSServer/0',
          },
          {
            description: 'Lieu de surveillance (polygone)',
            format: 'geojson',
            name: 'surval_parametre_polygone.geojson',
            protocol: 'WWW:DOWNLOAD',
            url: 'https://www.ifremer.fr/surval_parametre_polygone.geojson',
          },
          {
            description: 'Lieu de surveillance (ligne)',
            format: 'WFS:geojson',
            name: 'surval_parametre_ligne',
            protocol: 'OGC:WFS',
            url: 'https://www.ifremer.fr/services/wfs/surveillance_littorale',
          },
          {
            description: 'ArcGIS GeoService Wfs',
            format: 'WFS:geojson',
            mediaType: 'application/json',
            name: 'mes_hdf',
            protocol: 'ESRI:REST',
            url: 'https://services8.arcgis.com/rxZzohbySMKHTNcy/arcgis/rest/services/mes_hdf/WFSServer/0',
          },
          {
            description: 'ArcGIS GeoService',
            format: 'REST:json',
            mediaType: 'application/json',
            name: 'mes_hdf_journalier_poll_princ',
            protocol: 'ESRI:REST',
            url: 'https://services8.arcgis.com/rxZzohbySMKHTNcy/arcgis/rest/services/mes_hdf_journalier_poll_princ/FeatureServer/0/query?f=json&where=1=1&outFields=*',
          },
          {
            description: 'ArcGIS GeoService',
            format: 'REST:geojson',
            mediaType: 'application/json',
            name: 'mes_hdf_journalier_poll_princ',
            protocol: 'ESRI:REST',
            url: 'https://services8.arcgis.com/rxZzohbySMKHTNcy/arcgis/rest/services/mes_hdf_journalier_poll_princ/FeatureServer/0/query?f=geojson&where=1=1&outFields=*',
          },
        ])
      }))
    })
  })
})
