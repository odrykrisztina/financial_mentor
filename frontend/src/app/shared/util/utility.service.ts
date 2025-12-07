import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {

  capitalize(str: string, isLowerEnd: boolean = true): string {
    if (str.length <= 1) return str.toUpperCase();
    const restOfString = str.slice(1); 
    return  str.charAt(0).toUpperCase() + (isLowerEnd ?
            restOfString.toLowerCase() : restOfString);
  }

  elapsedTimeInSec(startTime: number): string {
    return ((new Date().getTime() - startTime) / 1000).toFixed(2);
  }
}
