import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatToolbarModule,
  MatSnackBarModule,
  MatSelectModule,
  MatOptionModule,
  MatGridListModule,
  MatDialogModule,
  MatListModule,
  MatDividerModule,
  MatExpansionModule,
  MatProgressBarModule,
  MatTableModule,
  MatPaginatorModule
} from '@angular/material';
import { UtilModule } from './util/util.module';
import { OracleComponent } from './oracle/oracle.component';
import { ListOrdersComponent } from './list-orders/list.component';
import { CreateOrdersComponent } from './create-orders/create.component';
import { CreateOffersComponent } from './create-offers/create-offers.component';
import { ListOffersComponent } from './list-offers/list-offers.component';
import { AccountAddressPipe } from './account-address.pipe';

@NgModule({
  declarations: [
    AppComponent,
    OracleComponent,
    ListOrdersComponent,
    CreateOrdersComponent,
    CreateOffersComponent,
    ListOffersComponent,
    AccountAddressPipe
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatGridListModule,
    MatDialogModule,
    MatListModule,
    MatDividerModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    UtilModule
  ],
  entryComponents: [ListOffersComponent, CreateOffersComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
