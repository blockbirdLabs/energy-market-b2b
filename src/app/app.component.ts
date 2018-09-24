import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  credentials: any;
  isPublic = false;

  constructor(private matSnackBar: MatSnackBar) {}

  goPublic() {
    if (this.isPublic) {
      console.log('Going private...');
      this.isPublic = false;
    } else {
      console.log('Going public...');
      this.isPublic = true;
    }
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, { duration: 5000 });
  }
}
