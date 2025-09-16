import {
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from "@angular/core";
import {
  ContentResponse,
  LanguageService,
} from "../../services/language.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-home",
  imports: [DatePipe],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent {
  private readonly langService = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);

  // Signal-based reactive content loading
  readonly contentSignal = signal<ContentResponse | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.setupReactiveContent();
  }

  private setupReactiveContent(): void {
    // React to language changes automatically using effect
    effect(() => {
      const currentLang = this.langService.currentLanguage();
      if (currentLang) {
        this.loadContentForLanguage(currentLang);
      }
    });
  }

  private loadContentForLanguage(language: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.langService
      .getContent()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (content) => {
          this.contentSignal.set(content);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error("Error fetching content:", error);
          this.error.set(
            "Failed to load content. Please check if the backend server is running."
          );
          this.isLoading.set(false);
        },
      });
  }

  getCurrentTimestamp(): string {
    return new Date().toLocaleString();
  }
}
