import {
  Component,
  DestroyRef,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { switchMap } from 'rxjs';
import {
  ContentResponse,
  LanguageService,
} from '../../services/language.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly langService = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);
  contentSignal: WritableSignal<ContentResponse | null> = signal(null);
  isLoading = false;
  error: string | null = null;

  constructor() {
    this.fetchContent();
  }

  handleContent() {
    return toObservable(this.langService.getLanguage()).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap((lang) => this.langService.getContent())
    );
  }

  fetchContent() {
    this.isLoading = true;
    this.error = null;
    this.handleContent()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          setTimeout(() => {
            this.contentSignal.set(res);
            this.isLoading = false;
          }, 2000);
        },
        error: (error) => {
          console.error('Error fetching content:', error);
          this.error =
            'Failed to load content. Please check if the backend server is running.';
          this.isLoading = false;
        },
      });
  }

  getCurrentTimestamp(): string {
    return new Date().toLocaleString();
  }
}
