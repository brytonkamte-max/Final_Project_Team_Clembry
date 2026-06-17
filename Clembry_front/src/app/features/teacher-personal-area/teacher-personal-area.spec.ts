import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherPersonalArea } from './teacher-personal-area';

describe('TeacherPersonalArea', () => {
  let component: TeacherPersonalArea;
  let fixture: ComponentFixture<TeacherPersonalArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherPersonalArea],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherPersonalArea);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
