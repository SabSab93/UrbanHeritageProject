import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PanierUiService {
  private _open$ = new BehaviorSubject<boolean>(false);
  readonly isSidebarOpen$ = this._open$.asObservable();

  toggleSidebar() {
    this._open$.next(!this._open$.value);
  }
  closeSidebar() {
    this._open$.next(false);
  }
  
}
