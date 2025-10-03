import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
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

  private subs = new Subscription();
  UefaQualifiersForm!: FormGroup;
  AfcQualifiersForm!: FormGroup;
  CafQualifiersForm!: FormGroup;
  UefaGroupLetters = 'ABCDEFGHIJKL'.split(''); 
  AfcGroupLetters = 'AB'.split('');
  CafGroupLetters = 'ABCDEFGHI'.split(''); 
  UefaTeamNames: Team[] = [];
  AfcTeamNames: Team[] = [];
  CafTeamNames: Team[] = [];

  selectedAfcRunner: Team | null = null;



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
    });

     this.AfcGroupLetters.forEach(letter => {
      this.AfcGroupedTeams[letter] = this.AfcTeamNames.filter(t => t.qGroup === letter);
    });

     this.CafGroupLetters.forEach(letter => {
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
    this.CafQualifiersForm = this.fb.group(CafControls);

    const wireUpPair = (form: FormGroup, letters: string[], grouped: Record<string, Team[]>) => {
    letters.forEach(letter => {
      const groupName = 'group' + letter;
      const group = form.get(groupName) as FormGroup | null;
      if (!group) { return; }

      const pos1 = group.get('pos1')!;
      const pos2 = group.get('pos2')!;

      const pickAlternate = (excluded: string) => {
        const opts = grouped[letter] || [];
        // prefer the first option that's not the excluded one
        return opts.find(o => o.name !== excluded)?.name ?? '';
      };

      this.subs.add(pos1.valueChanges.subscribe(val => {
        const other = pos2.value;
        if (!val) { return; }
        if (val === other) {
          const alt = pickAlternate(val);
          pos2.setValue(alt, { emitEvent: false });
          group.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
      }));

      this.subs.add(pos2.valueChanges.subscribe(val => {
        const other = pos1.value;
        if (!val) { return; }
        if (val === other) {
          const alt = pickAlternate(val);
          pos1.setValue(alt, { emitEvent: false });
          group.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
      }));
    });
  };

  wireUpPair(this.UefaQualifiersForm, this.UefaGroupLetters, this.UefaGroupedTeams);
  wireUpPair(this.AfcQualifiersForm, this.AfcGroupLetters, this.AfcGroupedTeams);
  wireUpPair(this.CafQualifiersForm, this.CafGroupLetters, this.CafGroupedTeams);



    const initialAfcPos2 = this.afcPos2List; // getter will populate selectedAfcRunner
    if (this.UefaQualifiersForm.valid) {
      this.processUefaSelections(this.UefaQualifiersForm.value);
    }
    if (this.AfcQualifiersForm.valid) {
      // ensure selectedAfcRunner is set (afcPos2List already called above)
      this.selectedAfcRunner = initialAfcPos2[0] ?? this.selectedAfcRunner;
      this.processAfcSelections(this.AfcQualifiersForm.value);
    }

    this.subs.add(
      this.UefaQualifiersForm.valueChanges.subscribe(val => {
        // optionally only process when form is valid
        if (this.UefaQualifiersForm.valid) {
          this.processUefaSelections(val);
        } else {
          // keep UI/state consistent (remove previous UEFA entries if partially changed)
          this.resetConfederationQualifiedTeams('UEFA');
        }
      })
    );

    this.subs.add(
      this.AfcQualifiersForm.valueChanges.subscribe(val => {
        if (this.AfcQualifiersForm.valid) {
          this.processAfcSelections(val);
        } else {
          this.resetConfederationQualifiedTeams('AFC');
        }
      })
    );

   

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
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


      if (team && ( !this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === team) || this.dataService.UEFA_PLAYOFF_TEAMS.length > 0)  && !this.dataService.QUALIFIED_TEAMS.find(qt => qt.name === team)) {
        this.dataService.UEFA_PLAYOFF_TEAMS.push(this.dataService.ALL_TEAMS_DATA.find(at => at.name === team) as Team);
      
        count++;
      }
      index++;
    
    }

    
  }

  submitAfcForm(): void {
    if (this.AfcQualifiersForm.invalid) {
      this.AfcQualifiersForm.markAllAsTouched();
      return;
    }
    
    this.resetConfederationQualifiedTeams('AFC');

     let res = this.AfcQualifiersForm.value;
      Object.keys(res).forEach(key => {
      const teams = res[key];
      this.dataService.QUALIFIED_TEAMS.push(this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos1) as Team);
      //this.dataService.AFC_PLAYOFF_TEAMS.push(this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos2) as Team);
      
      
    });

    if(this.selectedAfcRunner) {
      this.dataService.INTERCONTINENTAL_PLAYOFF_TEAMS.push(this.selectedAfcRunner);
    }
   

    
  }


  submitCafForm(): void {}

  private processUefaSelections(res: any): void {
    this.resetConfederationQualifiedTeams('UEFA');

    // add group winners to qualified teams, runners-up to playoff teams
    Object.keys(res).forEach(key => {
      const teams = res[key];
      this.dataService.QUALIFIED_TEAMS.push(this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos1) as Team);
      this.dataService.UEFA_PLAYOFF_TEAMS.push(this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos2) as Team);
    });

    // add nations league playoff teams if not already qualified or in playoffs.
    let count = 0;
    let index = 0;
    while (count < 4 && index < this.dataService.UEFA_NATIONS_LEAGUE_PRIORITY.length) {
      let team = this.dataService.UEFA_NATIONS_LEAGUE_PRIORITY[index];

      if (team && (!this.dataService.UEFA_PLAYOFF_TEAMS.find(t => t.name === team) || this.dataService.UEFA_PLAYOFF_TEAMS.length > 0) && !this.dataService.QUALIFIED_TEAMS.find(qt => qt.name === team)) {
        this.dataService.UEFA_PLAYOFF_TEAMS.push(this.dataService.ALL_TEAMS_DATA.find(at => at.name === team) as Team);
        count++;
      }
      index++;
    }

    console.log(this.dataService.QUALIFIED_TEAMS);
  }

  private processAfcSelections(res: any): void {
    this.resetConfederationQualifiedTeams('AFC');

    Object.keys(res).forEach(key => {
      const teams = res[key];
      this.dataService.QUALIFIED_TEAMS.push(this.dataService.ALL_TEAMS_DATA.find(t => t.name === teams.pos1) as Team);
      // runners-up can be handled elsewhere; keep consistent with previous behavior
    });

    if (this.selectedAfcRunner) {
      this.dataService.INTERCONTINENTAL_PLAYOFF_TEAMS.push(this.selectedAfcRunner);
    }
    console.log(this.dataService.QUALIFIED_TEAMS);
  }


  resetConfederationQualifiedTeams(conf:string): void {
    if(this.dataService.QUALIFIED_TEAMS.length > 0) {
      this.dataService.QUALIFIED_TEAMS = this.dataService.QUALIFIED_TEAMS.filter(t => t.confederation !== conf || (t.confederation === conf && t.qualified === true));
      this.dataService.INTERCONTINENTAL_PLAYOFF_TEAMS = this.dataService.INTERCONTINENTAL_PLAYOFF_TEAMS.filter(t => t.confederation !== conf || (t.confederation === conf && t.qualified === true));
    }

  }

  get afcPos2List(): Team[] {
    if (!this.AfcQualifiersForm) { return []; }

    let teamNames:string[] = this.AfcGroupLetters
      .map(letter => this.AfcQualifiersForm.get('group' + letter + '.pos2')?.value);

    let res:Team[] = [];

    teamNames.forEach(team => {
      res.push(this.dataService.ALL_TEAMS_DATA.find(t=> t.name === team) as Team);
    })

    this.selectedAfcRunner = res[0];

    return res;
  }

  
}