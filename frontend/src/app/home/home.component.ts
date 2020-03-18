import { Component, OnInit } from '@angular/core';
import { faSeedling } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'rb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  seed = faSeedling;

  constructor() {}

  ngOnInit(): void {}
}
