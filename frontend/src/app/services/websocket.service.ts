import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocket | null = null;
  private readonly messagesSubject = new Subject<string>();

  constructor() {}

  connect(url: string) {
    if (!this.socket$ || this.socket$.readyState !== WebSocket.OPEN) {
      this.socket$ = new WebSocket(url);
      this.socket$.onmessage = (message) => {
        this.messagesSubject.next(message.data);
      };
    }
  }

  getMessages(): Observable<string> {
    return this.messagesSubject.asObservable();
  }
}
