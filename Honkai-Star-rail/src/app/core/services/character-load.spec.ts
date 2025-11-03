import { TestBed } from '@angular/core/testing';

import { CharacterLoad } from './character-load';

describe('CharacterLoad', () => {
  let service: CharacterLoad;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CharacterLoad);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
