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
  UefaQualifiersForm!: FormGroup;
  AfcQualifiersForm!: FormGroup;
  CafQualifiersForm!: FormGroup;
  UefaGroupLetters = 'ABCDEFGHIJKL'.split(''); 
  AfcGroupLetters = 'AB'.split('');
  CafGroupLetters = 'ABCDEFGHI'.split(''); 
  UefaTeamNames: Team[] = [];
  AfcTeamNames: Team[] = [];
  CafTeamNames: Team[] = [];

  // teams grouped by letter for easier access in template
  UefaGroupedTeams: Record<string, Team[]> = {};
  AfcGroupedTeams: Record<string, Team[]> = {};
  CafGroupedTeams: Record<string, Team[]> = {};

  constructor(private fb: FormBuilder, private dataService: DataService) { }

  ngOnInit(): void {
    this.UefaTeamNames = this.dataService.ALL_TEAMS_DATA
      .filter(val => val.confederation === 'UEFA');

    this.AfcTeamNames = this.dataService.ALL_TEAMS_DATA
      .filter(val => val.confederation === 'AFC');

    this.CafTeamNames = this.dataService.ALL_TEAMS_DATA
      .filter(val => val.confederation === 'CAF');

    this.UefaGroupLetters.forEach(letter => {
      this.UefaGroupedTeams[letter] = this.UefaTeamNames.filter(t => t.qGroup === letter);

      this.AfcGroupedTeams[letter] = this.AfcTeamNames.filter(t => t.qGroup === letter);

      this.CafGroupedTeams[letter] = this.CafTeamNames.filter(t => t.qGroup === letter);
    });

    // build a FormGroup per letter with pos1 & pos2 controls
    const UefaControls: Record<string, any> = {};
    const AfcControls: Record<string, any> = {};
    const CafControls: Record<string, any> = {};
    
    this.UefaGroupLetters.forEach(letter => {
      const options = this.UefaGroupedTeams[letter] || [];
      const first = options[0]?.name ?? '';
      const second = options[1]?.name ?? '';
      UefaControls['group' + letter] = this.fb.group({
        pos1: [first, Validators.required],
        pos2: [second, Validators.required]
      }, { validators: [this.positionsDistinctValidator()] });
    });

    this.AfcGroupLetters.forEach(letter => {
      const options = this.AfcGroupedTeams[letter] || [];
      const first = options[0]?.name ?? '';
      const second = options[1]?.name ?? '';
      AfcControls['group' + letter] = this.fb.group({
        pos1: [first, Validators.required],
        pos2: [second, Validators.required]
      }, { validators: [this.positionsDistinctValidator()] });
    });

    this.CafGroupLetters.forEach(letter => {
      const options = this.CafGroupedTeams[letter] || [];
      const first = options[0]?.name ?? '';
      const second = options[1]?.name ?? '';
      CafControls['group' + letter] = this.fb.group({
        pos1: [first, Validators.required],
        pos2: [second, Validators.required]
      }, { validators: [this.positionsDistinctValidator()] });
    });


    this.UefaQualifiersForm = this.fb.group(UefaControls);
    this.AfcQualifiersForm = this.fb.group(AfcControls);
    // this.CafQualifiersForm = this.fb.group(CafControls);
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

  submitUefaForm(): void {
    if (this.UefaQualifiersForm.invalid) {
      this.UefaQualifiersForm.markAllAsTouched();
      return;
    }

    this.resetConfederationQualifiedTeams('UEFA');
   
   
    console.log(this.UefaQualifiersForm.value);

    let res = this.UefaQualifiersForm.value;


    // add group winners to qualified teams, runners-up to playoff teams
    Object.keys(res).forEach(key => {
      const teams = res[key];
      this.dataService.QUALIFIED_TEAMS.push(this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos1) as Team);
      this.dataService.UEFA_PLAYOFF_TEAMS.push(this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos2) as Team);  
    });


    // add nations league playoff teams if not already qualified or in playoffs.
    let count = 0;
    let index = 0;
    while(count <4 && index < this.dataService.UEFA_NATIONS_LEAGUE_PRIORITY.length) {
      let team = this.dataService.UEFA_NATIONS_LEAGUE_PRIORITY[index];
      console.log(team);

      if (team && ( !this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === team) || this.dataService.UEFA_PLAYOFF_TEAMS.length > 0)  && !this.dataService.QUALIFIED_TEAMS.find(qt => qt.name === team)) {
        this.dataService.UEFA_PLAYOFF_TEAMS.push(this.dataService.ALL_TEAMS_DATA.find(at => at.name === team) as Team);
        console.log(team+' didnt qualify via top 2, added to UEFA playoffs because of nations league ranking');
        count++;
      }
      index++;
    
    }

      console.log(this.dataService.QUALIFIED_TEAMS);
      console.log(this.dataService.UEFA_PLAYOFF_TEAMS); 
  }

  submitAfcForm(): void {
    if (this.AfcQualifiersForm.invalid) {
      this.AfcQualifiersForm.markAllAsTouched();
      return;
    }

    this.resetConfederationQualifiedTeams('AFC');
  }


  resetConfederationQualifiedTeams(conf:string): void {
    if(this.dataService.QUALIFIED_TEAMS.length > 0) {
      this.dataService.QUALIFIED_TEAMS = this.dataService.QUALIFIED_TEAMS.filter(t => t.confederation !== conf);
    }

  }

  
}