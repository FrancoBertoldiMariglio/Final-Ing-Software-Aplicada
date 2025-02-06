import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { ILibro } from '../libro.model';

@Component({
  standalone: true,
  selector: 'jhi-libro-detail',
  templateUrl: './libro-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class LibroDetailComponent {
  libro = input<ILibro | null>(null);

  previousState(): void {
    window.history.back();
  }
}
