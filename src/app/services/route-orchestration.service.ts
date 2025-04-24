import { computed, Injectable, signal } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { latLng, LatLng } from 'leaflet';

import { MapManagerService } from './map-manager.service';
import { DistanceService } from './distance.service';
import { RouteOptimizationService } from './route-optimization.service';
import { DirectionsService } from './directions.service';
import type { MarkerDistance } from '../data/types';

@Injectable({ providedIn: 'root' })
export class RouteOrchestrationService {

  private markerDistances = signal<MarkerDistance[]>([]);
  public _markerDistances = computed<MarkerDistance[]>(() => this.markerDistances());

  constructor(
    private mapManagerService: MapManagerService,
    private distanceService: DistanceService,
    private routeOptimizationService: RouteOptimizationService,
    private directionsService: DirectionsService
  ) { }

  calculateDistance(): Observable<MarkerDistance[]> {
    const markers = this.mapManagerService._markersData();
    const coords = markers.map(m => [m.lng, m.lat] as [number, number]);

    return this.distanceService.getDistance(coords).pipe(
      map(matrix => {
        const md: MarkerDistance[] = [];
        for (let i = 0; i < markers.length; i++) {
          for (let j = i + 1; j < markers.length; j++) {
            md.push({
              x: markers[i].name,
              y: markers[j].name,
              distance: matrix[i][j]
            });
          }
        }
        return md;
      }),
      tap(md => this.markerDistances.set(md))
    );
  }

  calculateOptimizedRoutes(): Observable<MarkerDistance[]> {
    return this.calculateDistance().pipe(
      switchMap(md => this.routeOptimizationService.getBestDistanceKruskal(md)),
      tap(mst => this.markerDistances.set(mst))
    );
  }

  generateRoutesWithoutKruskal(): void {
    this.calculateDistance()
      .pipe(
        switchMap(md => {
          const calls = md.map(edge => {
            const s = this.mapManagerService._markersData().find(m => m.name === edge.x)!;
            const e = this.mapManagerService._markersData().find(m => m.name === edge.y)!;
            return this.directionsService
              .getRoute([s.lng, s.lat], [e.lng, e.lat])
              .pipe(tap(geo => this.drawPolyline(geo)));
          });
          return forkJoin(calls);
        })
      )
      .subscribe({
        error: err => console.error('Error without Kruskal:', err)
      });
  }

  generateRoutesWithKruskal(): void {
    this.calculateOptimizedRoutes()
      .pipe(
        switchMap(mst => {
          const calls = mst.map(edge => {
            const s = this.mapManagerService._markersData().find(m => m.name === edge.x)!;
            const e = this.mapManagerService._markersData().find(m => m.name === edge.y)!;
            return this.directionsService
              .getRoute([s.lng, s.lat], [e.lng, e.lat])
              .pipe(tap(geo => this.drawPolyline(geo)));
          });
          return forkJoin(calls);
        })
      )
      .subscribe({
        error: err => console.error('Error with Kruskal:', err)
      });
  }

  private drawPolyline(geo: any) {
    const coords: LatLng[] = geo.features[0].geometry.coordinates
      .map((c: [number, number]) => latLng(c[1], c[0]));
    this.mapManagerService.createPolyline(coords);
  }
}
