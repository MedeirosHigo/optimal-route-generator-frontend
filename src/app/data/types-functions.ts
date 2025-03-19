import { latLng, marker,Layer, Marker } from "leaflet";
import { hangarIcon } from "./customIcons";
import { filter } from "rxjs";

export const hangarMarker = marker(latLng(45.74836030216746, 4.869689941406251), { icon: hangarIcon })
  .bindPopup('Main Hangar')
  .openPopup();

export const hangarMarkerData: MarkerData = {
  name: 'M0',
  lat: hangarMarker.getLatLng().lat,
  lng: hangarMarker.getLatLng().lng
};

export type MarkerDistance = {
  x: string;
  y: string;
  distance: number;
};

export type MarkerData = {
  name: string;
  lat: number;
  lng: number;
};

export function layersToMarkers(layers: Layer[]) : Marker[]{
  let markers : Marker[] = layers.filter( layer => layer instanceof Marker); 
  return markers;
}