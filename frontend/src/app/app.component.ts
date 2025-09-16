import { Component, DestroyRef, inject } from "@angular/core";
import { LanguageService } from "./services/language.service";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { HomeComponent } from "./components/home/home.component";

@Component({
  selector: "app-root",
  imports: [HomeComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  private readonly langService = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);

  // Remove all local state - use service signals directly
  readonly currentLanguage = this.langService.currentLanguage;
  readonly supportedLanguages = this.langService.supportedLanguages;
  readonly isChangingLanguage = this.langService.isLoading;

  readonly languageNames = this.langService.getLanguageNames();

  onLanguageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newLanguage = selectElement.value;

    if (newLanguage === this.currentLanguage()) return;

    this.langService
      .changeLanguage(newLanguage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log(`Language changed to ${newLanguage}`);
        },
        error: (error) => {
          console.error("Error changing language:", error);
          // Revert selection on error
          selectElement.value = this.currentLanguage();
        },
      });
  }
}
