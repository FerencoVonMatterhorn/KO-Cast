import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{

  ngOnInit(): void {
    let pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302"
        }
      ]
    });

    pc.ontrack = function (event: RTCTrackEvent) {
      console.log("Track received");
      if (event.track.kind === 'audio') {
        console.log("Audio track received");
        return;
      }

      let el = document.getElementById("video-player") as HTMLMediaElement;
      el.srcObject = event.streams[0];
      el.autoplay = true;
      el.controls = true;
      document.getElementById('remoteVideos')?.appendChild(el);

      event.track.onmute = function () {
        el.play().then(r => console.log("Playing")).catch(e => console.log("Failed to play"));
      };

      event.streams[0].onremovetrack = ({ track }) => {
        let stream = (document.getElementById("video-player") as HTMLMediaElement).srcObject;
        let trackList = (<MediaStream>stream).getTracks();

        if (trackList.length == 0) {
          console.log("Stream has ended");
        }
      };
    };


    let ws =  new WebSocket("wss://api.feren.co/websocket");

    pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {

      if (!e.candidate) {
        return;
      }
      console.log("ICE Candidate: " + e.candidate.candidate);
      ws.send(JSON.stringify({ event: 'candidate', data: JSON.stringify(e.candidate) }));
    };

    pc.onicecandidateerror = (e) => {
      console.log(e);
    }

    pc.onconnectionstatechange = function () {
      console.log("Connection state: " + pc.connectionState)
    }

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
        case 'offer': {
          let offer: RTCSessionDescriptionInit;
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
        }

        case 'candidate': {
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
      }
    };

    ws.onerror = function (evt: Event) {
      console.log("ERROR: " + (evt as ErrorEvent).message);
    };
  };
}

