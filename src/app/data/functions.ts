import { Marker, TileLayer, GeoJSON, tileLayer, geoJSON, LatLng } from "leaflet";
import { customIcon } from "./customIcons";

export function getLeafletMarkerFromCoords(l: LatLng): Marker {
    return new Marker(l, { icon: customIcon });
}
export function getTileLayer(url: string): TileLayer {
    return tileLayer(url, { maxZoom: 19 });
}
export function getGeoJsonLayer(data: any): GeoJSON {
    return geoJSON(data, { style: (feature) => ({ color: 'blue', weight: 2 }) });
}