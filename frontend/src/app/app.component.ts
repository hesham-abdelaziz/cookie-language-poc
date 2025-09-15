import { Component, DestroyRef, inject } from '@angular/core';
import { LanguageService } from './services/language.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { HomeComponent } from './components/home/home.component';

@Component({
  selector: 'app-root',
  imports: [HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'frontend';
  private readonly destroyRef = inject(DestroyRef);
  public readonly langService = inject(LanguageService);
  public readonly languages = ['it', 'en', 'de', 'fr', 'es', 'pt'];

  currentLanguage = 'it';
  supportedLanguages = ['it', 'en', 'de', 'fr', 'es', 'pt'];
  languageNames: Record<string, string> = {};
  isChangingLanguage = false;

  constructor() {
    this.languageNames = this.langService.getLanguageNames();
    toObservable(this.langService.getLanguage())
      .pipe(takeUntilDestroyed())
      .subscribe((lang) => {
        this.currentLanguage = lang;
      });
  }
  ngOnInit() {
    // Get current language from server
    this.langService
      .getCurrentLanguage()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('Current language from server:', response);
          setTimeout(() => {
            this.currentLanguage = response.language;
            this.supportedLanguages = response.supported;
          }, 2000);
        },
        error: (error) => {
          console.error('Error getting current language:', error);
        },
      });
  }

  onLanguageChange(event: any) {
    const newLanguage = event.target.value;

    if (newLanguage === this.currentLanguage) return;

    this.isChangingLanguage = true;

    this.langService
      .setLanguage(newLanguage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('Language changed successfully:', response);
          this.currentLanguage = newLanguage;
          setTimeout(() => {
            this.isChangingLanguage = false;
            // Optional: Show success message
            this.showNotification(
              `Language changed to ${this.languageNames[newLanguage]}`,
              'success'
            );
          }, 2000);
        },
        error: (error) => {
          console.error('Error changing language:', error);
          this.isChangingLanguage = false;

          // Revert selection on error
          const selectElement = event.target;
          selectElement.value = this.currentLanguage;

          this.showNotification('Error changing language', 'error');
        },
      });
  }

  private showNotification(message: string, type: 'success' | 'error') {
    // Simple notification - in a real app you might use a toast service
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      border-radius: 5px;
      color: white;
      background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
      z-index: 1000;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}
