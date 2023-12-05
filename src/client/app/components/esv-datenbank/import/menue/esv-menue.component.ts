import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-esv-menue',
  templateUrl: './esv-menue.component.html',
  styleUrls: ['./esv-menue.component.css']
})
export class EsvMenueComponent implements OnInit {

  constructor(private titleService: Title) {
    this.titleService.setTitle('ESV - Importe');
  }

  ngOnInit(): void {
  }

}
