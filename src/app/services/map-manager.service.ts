import { computed, Injectable, signal, TemplateRef, ViewChild } from '@angular/core';
import { MarkerData } from '../data/types';
import { DomEvent, DomUtil, LatLng, Marker, polyline, Polyline } from 'leaflet';
import { DirectionsService } from './directions.service';
import { getLeafletMarkerFromCoords } from '../data/functions';
import { RouteOrchestrationService } from './route-orchestration.service';

@Injectable({
  providedIn: 'root'
})
export class MapManagerService {

  private polyLine = signal<Polyline[]>([]);
  private markersData = signal<MarkerData[]>([]);
  private markerCounter: number = 1;
  public _polyLine = computed<Polyline[]>(() => this.polyLine());
  public _markersData = computed<MarkerData[]>(() => this.markersData());
  public readonly markers = computed<Marker[]>(() =>
    this._markersData().map(data => {
      const m = getLeafletMarkerFromCoords(new LatLng(data.lat, data.lng));
      const btn = DomUtil.create('button', 'remove-btn') as HTMLButtonElement;
      btn.textContent = 'Remove';
      DomEvent.on(btn, 'click', () => {
        this.removeMarkerData(data);
        m.closePopup();
      });
      m.bindPopup(btn);
      return m;
    })
  );

  createMarker(coords: LatLng): void {
    this.markersData.update(m => [...m, {
      name: 'M' + this.markerCounter++,
      lat: coords.lat,
      lng: coords.lng
    }]);

  }

  createPolyline(coords: LatLng[]): void {
    this.polyLine.update(p => [...p, polyline(coords)]);
  }

  removeMarkerData(target: MarkerData) {
    this.markersData.update(arr => arr.filter(d => d.name !== target.name));
  }

  clearMarkers(): void {
    this.markersData.set([]);
    this.markerCounter = 1;
  }

  clearPolylines(): void {
    this.polyLine.set([]);
  }
}
