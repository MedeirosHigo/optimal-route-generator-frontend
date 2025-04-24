import { TestBed } from '@angular/core/testing';

import { RouteOrchestrationService } from './route-orchestration.service';

describe('RouteOrchestrationgeService', () => {
  let service: RouteOrchestrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteOrchestrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
