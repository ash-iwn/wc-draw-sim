import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, AbstractControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../data-service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Team } from '../../model';
@Component({
  selector: 'app-qualifiers',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatOptionModule],
  templateUrl: './qualifiers.component.html',
  styleUrl: './qualifiers.component.scss'
})
export class QualifiersComponent implements OnInit {
  qualifiersForm!: FormGroup;
  groupLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, 12).split(''); // A..L
  teamNames: Team[] = [];
  groupedTeams: Record<string, Team[]> = {};

  constructor(private fb: FormBuilder, private dataService: DataService) { }

  ngOnInit(): void {
    this.teamNames = this.dataService.ALL_TEAMS_DATA
      .filter(val => val.confederation === 'UEFA');

    this.groupLetters.forEach(letter => {
      this.groupedTeams[letter] = this.teamNames.filter(t => t.qGroup === letter);
    });

    // build a FormGroup per letter with pos1 & pos2 controls
    const controls: Record<string, any> = {};
    this.groupLetters.forEach(letter => {
      controls['group' + letter] = this.fb.group({
        pos1: ['', Validators.required],
        pos2: ['', Validators.required]
      }, { validators: [this.positionsDistinctValidator()] });
    });

    this.qualifiersForm = this.fb.group(controls);
  }

  // validator that ensures pos1 and pos2 are different and both set
  positionsDistinctValidator(): ValidatorFn {
    return (group: AbstractControl) => {
      const pos1 = group.get('pos1')?.value;
      const pos2 = group.get('pos2')?.value;
      if (!pos1 || !pos2) {
        return { positionsMissing: true };
      }
      return pos1 === pos2 ? { positionsSame: true } : null;
    };
  }

  onSubmit(): void {
    if (this.qualifiersForm.invalid) {
      this.qualifiersForm.markAllAsTouched();
      return;
    }
   
    //this.dataService.qual(this.qualifiersForm.value);
    console.log(this.qualifiersForm.value);
  }
}