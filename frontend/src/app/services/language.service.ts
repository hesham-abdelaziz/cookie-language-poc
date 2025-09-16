import { HttpClient } from "@angular/common/http";
import {
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from "@angular/core";
import { catchError, Observable, tap, throwError } from "rxjs";

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
  providedIn: "root",
})
export class LanguageService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = "http://localhost:3000/api/";

  // Signal as the single source of truth
  private readonly _currentLanguage = signal<string>("it");
  private readonly _supportedLanguages = signal<string[]>([
    "it",
    "en",
    "de",
    "fr",
    "es",
    "pt",
  ]);
  private readonly _isLoading = signal<boolean>(false);

  // Public readonly signals
  readonly currentLanguage = this._currentLanguage.asReadonly();
  readonly supportedLanguages = this._supportedLanguages.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  constructor() {
    this.initializeFromServer();
  }

  /**
   * Initialize signal state from server on service creation
   */
  private initializeFromServer(): void {
    this._isLoading.set(true);
    this.http
      .get<LanguageResponse>(`${this.apiUrl}current-language`, {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          this._currentLanguage.set(response.language);
          this._supportedLanguages.set(response.supported);
          this._isLoading.set(false);
        },
        error: (error) => {
          console.error("Failed to initialize language from server:", error);
          this._isLoading.set(false);
        },
      });
  }

  /**
   * Change language and update signal immediately
   */
  changeLanguage(language: string): Observable<any> {
    if (!this._supportedLanguages().includes(language)) {
      return throwError(() => new Error(`Unsupported language: ${language}`));
    }

    this._isLoading.set(true);

    return this.http
      .post(`${this.apiUrl}language`, { language }, { withCredentials: true })
      .pipe(
        tap(() => {
          this._currentLanguage.set(language);
          this._isLoading.set(false);
        }),
        catchError((error) => {
          this._isLoading.set(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get content - reactive to current language signal
   */
  getContent(): Observable<ContentResponse> {
    return this.http.get<ContentResponse>(`${this.apiUrl}content`, {
      withCredentials: true,
    });
  }

  getLanguageNames(): Record<string, string> {
    return {
      it: "Italiano",
      en: "English",
      de: "Deutsch",
      fr: "Français",
      es: "Español",
      pt: "Português",
    };
  }
}
