import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Reduction } from "../models/reduction.model";
import { environment } from "../../environments/environment";



@Injectable({ providedIn: "root" })
export class ReductionService {
 private readonly baseUrl = `${environment.apiUrl}/reduction/public/actives`;
 
  constructor(private http: HttpClient) {}

  getActiveReductions(): Observable<Reduction[]> {
    return this.http.get<Reduction[]>(this.baseUrl);
  }
}