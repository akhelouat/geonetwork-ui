import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule } from '@angular/material/table'
import { TableComponent } from './table/table.component'
import { FigureComponent } from './figure/figure.component'
import { ScrollingModule } from '@angular/cdk/scrolling'
import { TableVirtualScrollModule } from 'ng-table-virtual-scroll'
import { TranslateModule } from '@ngx-translate/core'
import { ExpandablePanelComponent } from './expandable-panel/expandable-panel.component'
import { StickyHeaderComponent } from './sticky-header/sticky-header.component'
import { AnchorLinkDirective } from './anchor-link/anchor-link.directive'

@NgModule({
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    TableVirtualScrollModule,
    ScrollingModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    TableComponent,
    FigureComponent,
    ExpandablePanelComponent,
    StickyHeaderComponent,
    AnchorLinkDirective,
  ],
  exports: [
    TableComponent,
    FigureComponent,
    ExpandablePanelComponent,
    StickyHeaderComponent,
    AnchorLinkDirective,
  ],
})
export class UiLayoutModule {}
