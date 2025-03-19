import { TestBed } from '@angular/core/testing';

import { BestDistanceService } from './best-distance.service';

describe('BestDistanceService', () => {
  let service: BestDistanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BestDistanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
