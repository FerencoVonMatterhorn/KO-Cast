import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-video-player',
  templateUrl: './cast.component.html',
  styleUrls: ['./cast.component.scss']
})
export class CastComponent implements OnInit {

  ngOnInit(): void {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream: MediaStream) => {
        let pc = new RTCPeerConnection();

        pc.ontrack = function (event: RTCTrackEvent) {
          if (event.track.kind === 'audio') {
            return;
          }

          let el = document.createElement(event.track.kind) as HTMLMediaElement;
          el.srcObject = event.streams[0];
          el.autoplay = true;
          el.controls = true;
          document.getElementById('remoteVideos')?.appendChild(el);

          event.track.onmute = function () {
            el.play();
          };

          event.streams[0].onremovetrack = ({ track }) => {
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          };
        };

        const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
        if (localVideo) {
          localVideo.srcObject = stream;
        }

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        let ws = new WebSocket("ws://localhost:8080/websocket");

        pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
          if (!e.candidate) {
            return;
          }
          ws.send(JSON.stringify({ event: 'candidate', data: JSON.stringify(e.candidate) }));
        };

        ws.onclose = function () {
          window.alert("WebSocket has closed");
        };

        ws.onmessage = function (evt: MessageEvent) {
          let msg: { event: string, data: string } | null;
          try {
            msg = JSON.parse(evt.data);
          } catch {
            return console.log('Failed to parse message');
          }

          if (!msg) {
            return;
          }

          switch (msg.event) {
            case 'offer':
              let offer: RTCSessionDescriptionInit | null;
              try {
                offer = JSON.parse(msg.data);
              } catch {
                return console.log('Failed to parse offer');
              }
              if (!offer) {
                return;
              }

              pc.setRemoteDescription(new RTCSessionDescription(offer));
              pc.createAnswer().then(answer => {
                pc.setLocalDescription(answer);
                ws.send(JSON.stringify({ event: 'answer', data: JSON.stringify(answer) }));
              });
              return;

            case 'candidate':
              let candidate: RTCIceCandidateInit | null;
              try {
                candidate = JSON.parse(msg.data);
              } catch {
                return console.log('Failed to parse candidate');
              }
              if (!candidate) {
                return;
              }

              pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        };

        ws.onerror = function (evt: Event) {
          console.log("ERROR: " + (evt as ErrorEvent).message);
        };
      })
      .catch((error: Error) => {
        console.error("Error accessing display media:", error);
      });
  }
}
