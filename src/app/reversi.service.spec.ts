import { TestBed } from '@angular/core/testing';

import { ReversiService } from './reversi.service';

describe('ReversiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReversiService = TestBed.get(ReversiService);
    expect(service).toBeTruthy();
  });
});
