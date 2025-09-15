import { HttpClient } from '@angular/common/http';
import {
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { Observable, tap } from 'rxjs';

interface LanguageResponse {
  language: string;
  supported: string[];
  default: string;
}

export interface ContentResponse {
  language: string;
  content: {
    title: string;
    subtitle: string;
    welcomeMessage: string;
    currentLanguage: string;
    instructions: string;
  };
  timestamp: string;
}
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/';
  private langSignal: WritableSignal<string> = signal('it');

  /**
   * Get current language from server cookies
   */
  getCurrentLanguage(): Observable<LanguageResponse> {
    return this.http.get<LanguageResponse>(`${this.apiUrl}current-language`, {
      withCredentials: true,
    });
  }

  /**
   * Change language by setting cookie on server
   */
  changeLanguage(language: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}language`,
      { language },
      { withCredentials: true }
    );
  }

  /**
   * Get localized content based on current language cookie
   */
  getContent(): Observable<ContentResponse> {
    return this.http.get<ContentResponse>(`${this.apiUrl}content`, {
      withCredentials: true,
    });
  }

  setLanguage(lang: string): Observable<any> {
    return this.changeLanguage(lang).pipe(tap(() => this.langSignal.set(lang)));
  }

  getLanguage(): Signal<string> {
    return this.langSignal.asReadonly();
  }

  getLanguageNames(): { [key: string]: string } {
    return {
      it: 'Italiano',
      en: 'English',
      de: 'Deutsch',
      fr: 'Français',
      es: 'Español',
      pt: 'Português',
    };
  }
}
