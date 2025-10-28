import { Component, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RegisterCredits, User } from '../../../types/users';
import { AccountService } from '../../../core/services/account-service';
import { TextInput } from "../../../shared/text-input/text-input";
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, TextInput],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register{
  
  private accountService = inject(AccountService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  cancelRegister = output<boolean>();
  protected cred = {} as RegisterCredits;
  protected credentialsForm: FormGroup;
  protected profileForm: FormGroup;
  protected currentStep = signal(1);
  protected validationErrors = signal<string[]>([]);

  constructor(){
    this.credentialsForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      displayName: ['', Validators.required],
      password: ['', [Validators.required, 
                                    Validators.minLength(4), 
                                    Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    });

    this.profileForm = this.fb.group({
      gender: ['male', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
    });

    this.credentialsForm.controls['password'].valueChanges.subscribe(()=>{
      this.credentialsForm.controls['confirmPassword'].updateValueAndValidity();
    })
  
  }

  matchValues(matchTo: string): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null =>{
      const parent = control.parent;
      if(!parent) return null;

      const matchValue = parent.get(matchTo)?.value;
      return control.value === matchValue ? null : {passwordMismatch: true}
    }
  }

  nextStep(){
    if(this.credentialsForm.valid){
      this.currentStep.update(prevStep => prevStep + 1);
    }
  }

  prevStep(){
    if(this.credentialsForm.valid){
      this.currentStep.update(prevStep => prevStep - 1);
    }
  }

  getMaxDate(){
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0];
  }

  register(){

    if(this.profileForm.valid && this.credentialsForm.valid){
      const formData = {...this.credentialsForm.value, ...this.profileForm.value};
      console.log(formData);
      this.accountService.register(formData).subscribe({
        next: () => {
          this.router.navigateByUrl('/members');
        },
        error: error => {
          console.log(error);
          this.validationErrors.set(error);
        }
      })
    }
    
  }

  cancel(){
    this.cancelRegister.emit(false);
  }
}
