
import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { tileLayer, latLng, LeafletMouseEvent, Layer, Map } from 'leaflet';
import { MapManagerService } from './services/map-manager.service';
import { RouteOrchestrationService } from './services/route-orchestration.service';
import { LastRouteType } from './data/types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent {

  private initialLayer: Layer = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '', });
  private prevLengthMarker!: number;
  private lastRouteType: LastRouteType = undefined;
  public _mapLayers = computed<Layer[]>(() => [this.initialLayer, ...this.mapManagerService.markers(), ...this.mapManagerService._polyLine()]);

  constructor(
    private mapManagerService: MapManagerService,
    private routeOrchestrationService: RouteOrchestrationService
  ) {
    this.watchMarkerRemovalAndRegenRoutes();
  }

  mapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ''
      })
    ],
    zoom: 10,
    center: latLng(45.764043, 4.835659),
    doubleClickZoom: false
  };

  onMapDoubleClick(event: LeafletMouseEvent) {
    this.mapManagerService.createMarker(event.latlng);
  }

  generateWithoutKruskal() {
    this.mapManagerService.clearPolylines();
    this.routeOrchestrationService.generateRoutesWithoutKruskal();
    this.lastRouteType = 'withoutKruskal';
  }
  generateWithKruskal() {
    this.mapManagerService.clearPolylines();
    this.routeOrchestrationService.generateRoutesWithKruskal();
    this.lastRouteType = 'withoutKruskal';
  }

  watchMarkerRemovalAndRegenRoutes() {
    effect(() => {
      const currentLengthMarker = this.mapManagerService._markersData().length;
      if (currentLengthMarker < this.prevLengthMarker) {
        if (this.mapManagerService._polyLine().length > 1 && this.lastRouteType === 'withKruskal') {
          this.generateWithKruskal();
        } if (this.mapManagerService._polyLine().length > 1 && this.lastRouteType === 'withoutKruskal') {
          this.generateWithoutKruskal();
        }
      }
      this.prevLengthMarker = this.mapManagerService._markersData().length;
    })
  }

  clearMap() {
    this.mapManagerService.clearMarkers();
    this.mapManagerService.clearPolylines();
  }
}
