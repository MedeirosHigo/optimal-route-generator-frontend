import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DirectionsService {
  private API_KEY = '5b3ce3597851110001cf624898539e0d7be1485c911af477c1c9a591';
  private BASE_URL = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

  constructor(private http: HttpClient) { }

  getRoute(startCoords: number[], endCoords: number[]): Observable<any> {
    const body = { coordinates: [startCoords, endCoords] };

    return this.http.post(this.BASE_URL, body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.API_KEY
      }
    });
  }
}
