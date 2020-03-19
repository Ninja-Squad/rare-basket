import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HttpClientModule } from '@angular/common/http';
import { ValdemortModule } from 'ngx-valdemort';
import { ValidationDefaultsComponent } from './validation-defaults/validation-defaults.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, ValidationDefaultsComponent],
  imports: [BrowserModule, RouterModule.forRoot(APP_ROUTES), FontAwesomeModule, HttpClientModule, ValdemortModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
