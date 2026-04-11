import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileAddress } from './profile-address';

describe('ProfileAddress', () => {
  let component: ProfileAddress;
  let fixture: ComponentFixture<ProfileAddress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileAddress]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileAddress);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
