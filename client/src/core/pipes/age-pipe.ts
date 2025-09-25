import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'age'
})
export class AgePipe implements PipeTransform {

  transform(value: string): number {
    const today = new Date();
    const dob = new Date(value);

    let age = today.getFullYear() - dob.getFullYear();
    const monthDif = today.getMonth() - dob.getMonth();

    if(monthDif < 0 || (monthDif === 0 && today.getDay() < dob.getDay())){
      age--;
    }
    return age;
  }

}
