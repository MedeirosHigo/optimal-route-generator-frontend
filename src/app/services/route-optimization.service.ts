import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MarkerDistance } from '../data/types';

@Injectable({
  providedIn: 'root'
})
export class RouteOptimizationService {
  private API_URL = 'https://optimal-route-generator-backend.onrender.com/api/kruskal/mst';
  constructor(private http: HttpClient) { }

  getBestDistanceKruskal(edges: MarkerDistance[]): Observable<any> {
    return this.http.post(this.API_URL, edges);
  }

}
