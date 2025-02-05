import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CastComponent } from './cast.component';

describe('VideoPlayerComponent', () => {
  let component: CastComponent;
  let fixture: ComponentFixture<CastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CastComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
