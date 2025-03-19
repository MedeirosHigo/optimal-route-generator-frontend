
import { ChangeDetectionStrategy, Component, computed, signal, TemplateRef, ViewChild } from '@angular/core';
import { tileLayer, latLng, polyline, marker, LeafletMouseEvent, Layer, Marker, Map, LatLng,Polyline } from 'leaflet';
import { RoutingService } from './services/routing.service';
import { DistanceService } from './services/distance.service';
import { BestDistanceService } from './services/best-distance.service';
import { hangarMarker, hangarMarkerData, layersToMarkers, MarkerData, MarkerDistance } from './data/types-functions';
import { customIcon } from './data/customIcons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent {

  mapLayers = signal<Layer[]>([]);
  selectedMarker = signal<Marker | null>(null);
  markerDistances = signal<MarkerDistance[]>([]);
  markers = signal<MarkerData[]>([]);
  kruskalCalculated = signal<MarkerDistance[]>([]);
  markerCounter: number = 1;
  mapInstance: Map | undefined;
  removeSelectedLatLng = signal<LatLng>(latLng(0, 0));
  @ViewChild('popupTemplate', { static: true }) popupTemplate!: TemplateRef<any>;

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

  constructor(
    private routingService: RoutingService,
    private distanceService: DistanceService,
    private bestDistanceService: BestDistanceService
  ) { }

  onMapReady(event: Map) {
    this.mapInstance = event;
    this.addMarker(hangarMarker, hangarMarkerData);
  }

  onMapDoubleClick(event: LeafletMouseEvent) {

    const newMarker = marker(event.latlng, { icon: customIcon })
      .on('click', (e) => { this.removeSelectedLatLng.set(e.latlng); })
      .bindPopup(this.createEmbeddedButton())
      .openPopup();

    this.addMarker(newMarker, {
      name: 'M' + this.markerCounter++,
      lat: newMarker.getLatLng().lat,
      lng: newMarker.getLatLng().lng
    });

  }

  createEmbeddedButton(): any {
    const embeddedView = this.popupTemplate.createEmbeddedView(null);
    embeddedView.detectChanges();
    const popupContent = embeddedView.rootNodes[0] as HTMLElement;
    return popupContent;
  }

  removeLayer(e: LatLng) {
    let markerToRemove = layersToMarkers(this.mapLayers()).find(marker => marker.getLatLng().lat === e.lat);
    let markerToRemoveData = this.markers().find(marker => marker.lat === e.lat);
    if (markerToRemove)
      this.mapLayers.update(layers => layers.filter(layer => layer !== markerToRemove));
    this.markers.update(marker => marker.filter(marker => marker !== markerToRemoveData));
  }

  private addMarker(markerToAdd: Marker, markerData: MarkerData) {
    this.mapLayers.update(layers => [...layers, markerToAdd]);
    this.markers.update(markers => [...markers, markerData]);
  }

  calculateAndDisplayRoutes() {
    this.clearRoutes();
    this.kruskalCalculated().forEach(edge => {
      const markerStart = this.markers().find(m => m.name === edge.x);
      const markerEnd = this.markers().find(m => m.name === edge.y);
      if (markerStart && markerEnd) {
        this.generateRoute(markerStart,markerEnd);
      }
    });

    window.alert('ok');
  }

  generateRoute(markerStart: MarkerData, markerEnd: MarkerData) {
    const startCoords = [markerStart.lng, markerStart.lat];
    const endCoords = [markerEnd.lng, markerEnd.lat];
    this.routingService.getRoute(startCoords, endCoords).subscribe(response => {
      console.log(response);
      const coords = response.features[0].geometry.coordinates.map((c: number[]) => latLng(c[1], c[0]));
      this.mapLayers.update(layers => [...layers, polyline(coords)]);
    });
  }


  calculateDistance() {
    this.markerDistances.set([]);
    const markerLayers = this.mapLayers().filter(layer => layer instanceof Marker) as Marker[];
    const coordinates: number[][] = markerLayers.map(markerLayer => [
      markerLayer.getLatLng().lng,
      markerLayer.getLatLng().lat
    ]);

    this.distanceService.getDistance(coordinates).subscribe(response => {
      const distances = response.distances;

      for (let i = 0; i < this.markers().length; i++) {
        for (let j = 0; j < distances.length; j++) {
          if (i !== j) {
            this.markerDistances.update(markerDistances => [
              ...markerDistances,
              {
                x: this.markers()[i].name,
                y: this.markers()[j].name,
                distance: distances[i][j]
              }
            ]);
          }
        }
      }
      console.log("Marker Distances:", this.markerDistances());
    });
    window.alert('ok');
  }
  generateRoutesWithoutKruskal() {
    this.clearRoutes();
    const markersList = this.markers();
    for (let i = 0; i < markersList.length; i++) {
      for (let j = i + 1; j < markersList.length; j++) {
        this.generateRoute(markersList[i], markersList[j]);
      }
    }
    window.alert('Routes generated without using Kruskal');
  }
  calculateOptimizedRoutes () {
    this.kruskalCalculated.set([]);
    const edges = this.markerDistances();
    this.bestDistanceService.getBestDistanceKruskal(edges).subscribe(response => {
      this.kruskalCalculated.update(kruskal => [...kruskal, ...response]);
      
      console.log("Marker Distances with Kruskal:", this.kruskalCalculated());
    });
    window.alert('ok');
  }
  clearRoutes(){
    this.mapLayers.update(layers => layers.filter(layer => !(layer instanceof Polyline)));
  }
}
