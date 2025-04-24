import { TestBed } from '@angular/core/testing';

import { RouteOptimizationService } from './route-optimization.service';

describe('RouteOptimizationService', () => {
  let service: RouteOptimizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteOptimizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
