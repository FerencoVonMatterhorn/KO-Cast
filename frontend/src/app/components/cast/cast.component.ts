import {Component} from '@angular/core';
// @ts-ignore
import SimplePeer = require("simple-peer");


@Component({
  selector: 'app-video-player',
  templateUrl: './cast.component.html',
  styleUrls: ['./cast.component.scss']
})
export class CastComponent {
  async startScreenShare() {
    const stream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: true});
    const peer = new SimplePeer({initiator: true, stream});

    peer.on('signal', async (offer) => {
      const response = await fetch("http://localhost:8080/session", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(offer),
      });
      const data = await response.json();
      peer.signal(data.answer);
    });
  }

  async getActiveScreens() {
    const response = await fetch("http://localhost:8080/screens");
    const data = await response.json();
    console.log("Active Screens:", data.screens);
  }
}
