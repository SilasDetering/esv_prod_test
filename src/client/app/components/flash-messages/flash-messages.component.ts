import { Component, OnInit, OnDestroy } from '@angular/core';
import { FlashMessage, FlashMessageService } from '../../services/flashMessageServices/flash-message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-flash-messages',
  templateUrl: './flash-messages.component.html',
  styleUrls: ['./flash-messages.component.css']
})
export class FlashMessagesComponent implements OnInit, OnDestroy {
  message: FlashMessage | null = null;
  private subscription: Subscription | undefined;

  constructor(private flashMessageService: FlashMessageService) { }

  ngOnInit() {
    this.subscription = this.flashMessageService.message.subscribe(msg => {
      this.message = msg;
      if (msg) {
        setTimeout(() => this.message = null, msg.timeout);
      }
    });
  }

  ngOnDestroy() {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }
}