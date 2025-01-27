import { Inject, Injectable } from '@angular/core'

import {
  ROUTER_CONFIG,
  ROUTER_ROUTE_DATASET,
  ROUTER_ROUTE_SEARCH,
  RouterConfigModel,
} from './'
import { Router, Routes } from '@angular/router'

@Injectable({
  providedIn: 'root',
})
export class RouterInitService {
  constructor(
    @Inject(ROUTER_CONFIG) private routerConfig: RouterConfigModel,
    private router: Router
  ) {}

  initRoutes() {
    this.router.resetConfig(this.buildRoutes())
  }

  buildRoutes(): Routes {
    return [
      { path: '', redirectTo: `/${ROUTER_ROUTE_SEARCH}`, pathMatch: 'full' },
      {
        path: ROUTER_ROUTE_SEARCH,
        component: this.routerConfig.searchRouteComponent,
      },
      {
        path: `${ROUTER_ROUTE_DATASET}/:metadataUuid`,
        component: this.routerConfig.recordRouteComponent,
      },
    ]
  }
}
