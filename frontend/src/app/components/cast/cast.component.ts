import {Component} from '@angular/core';

@Component({
  selector: 'app-video-player',
  templateUrl: './cast.component.html',
  styleUrls: ['./cast.component.scss']
})
export class CastComponent {
  private pc: RTCPeerConnection | null = null;

  startScreenShare(): void {
    navigator.mediaDevices.getDisplayMedia({video: true, audio: true})
      .then((stream: MediaStream) => {
        this.pc = new RTCPeerConnection({
          iceServers: [
            {
              urls: "stun:stun.l.google.com:19302"
            }
          ]
        });

        const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
        if (localVideo) {
          localVideo.srcObject = stream;
        }

        stream.getTracks().forEach(track => {
          console.log('Adding track:', track);
          this.pc!.addTrack(track, stream)
        });

        // Handle negotiationneeded event
        this.pc.onnegotiationneeded = async () => {
          console.log("Negotiation needed");

          try {
            // Create an offer when negotiation is needed
            const offer = await this.pc!.createOffer();
            await this.pc!.setLocalDescription(offer);
            console.log("Offer created and local description set");

            // Send the offer to the remote peer through WebSocket
            if (ws) {
              ws.onopen = () => ws.send(JSON.stringify({ event: 'offer', data: JSON.stringify(offer) }));
            }
          } catch (err) {
            console.error("Error creating offer:", err);
          }
        };

        let ws = new WebSocket("wss://api.feren.co/websocket");

        this.pc.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
          if (!e.candidate) {
            return;
          }
          ws.onopen = () => ws.send(JSON.stringify({event: 'candidate', data: JSON.stringify(e.candidate)}));
        };

        ws.onclose = function () {
          window.alert("WebSocket has closed");
        };

        ws.onmessage = (evt: MessageEvent) =>{
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

              this.pc!.setRemoteDescription(new RTCSessionDescription(offer));
              this.pc!.createAnswer().then(answer => {
                this.pc!.setLocalDescription(answer);
                ws.send(JSON.stringify({event: 'answer', data: JSON.stringify(answer)}));
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

              this.pc!.addIceCandidate(new RTCIceCandidate(candidate));
          }
        };

        ws.onerror = function (evt: Event) {
          console.log("ERROR: " + (evt as ErrorEvent).message);
        };
      })
      .catch((error: Error) => {
        console.error("Error accessing display media:", error);
        this.stopScreenShare();
      });
  }

  stopScreenShare() {
    if (this.pc) {
      this.pc.ontrack = null;
      this.pc.onicecandidate = null;
      this.pc.oniceconnectionstatechange = null;
      this.pc.onsignalingstatechange = null;
      this.pc.onicegatheringstatechange = null;
      this.pc.onnegotiationneeded = null;

      const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
      if (localVideo.srcObject) {
        (<MediaStream>localVideo.srcObject).getTracks().forEach(track => track.stop());
      }

      this.pc.close();
      this.pc = null;
    }
  }
}
