import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-video-player',
  templateUrl: './cast.component.html',
  styleUrls: ['./cast.component.scss']
})
export class CastComponent implements OnInit {
  private peerConnection!: RTCPeerConnection;
  private ws!: WebSocket;
  private readonly iceCandidatesQueue: RTCIceCandidateInit[] = [];
  private localStream!: MediaStream | null;

  ngOnInit(): void {
    this.initializeWebSocket();
  }

  initializeWebSocket() {
    this.ws =new WebSocket("wss://api.feren.co/websocket");

    this.ws.onmessage = async (message) => {
      const data = JSON.parse(message.data);

      console.log("Received WebRTC message:", data);

      // Ensure PeerConnection is initialized
      if (!this.peerConnection) {
        console.log("PeerConnection not initialized. Initializing now...");
        this.setupWebRTC();
      }

      if (data.event === 'offer') {
        if (!this.peerConnection.remoteDescription) {
          let offer: RTCSessionDescriptionInit;
          try {
            offer = JSON.parse(data.data);
          } catch {
            return console.log('Failed to parse offer');
          }
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          this.ws.send(JSON.stringify({ event: 'answer', data: JSON.stringify(answer) }));

          // Add any ICE candidates that were received before remote description was set
          this.processQueuedCandidates();
        }
      }

      if (data.event === 'answer') {
        let answer: RTCSessionDescriptionInit;
        try {
          answer = JSON.parse(data.data);
        }
        catch {
          return console.log('Failed to parse answer');
        }
        await this.peerConnection.setRemoteDescription(answer);
        this.processQueuedCandidates();
      }

      if (data.event === 'candidate') {
        let candidate: RTCIceCandidateInit;
        try {
          candidate = JSON.parse(data.data);
        } catch {
          return console.log('Failed to parse candidate');
        }
        if (this.peerConnection.remoteDescription) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          console.log("Remote description not set yet. Queuing ICE candidate.");
          this.iceCandidatesQueue.push(new RTCIceCandidate(candidate));
        }
      }
    };
  }

  async startScreenShare() {
    try {
      this.localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

      const videoElement = document.querySelector('video');
      if (videoElement) videoElement.srcObject = this.localStream;

      this.setupWebRTC();
    } catch (error) {
      console.error('Error accessing screen share:', error);
    }
  }

  setupWebRTC() {
    if (!this.peerConnection) {
      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream!);
        });
      } else {
        console.error("Local stream is not initialized yet!");
      }

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.ws.send(JSON.stringify({ event: 'candidate', data: JSON.stringify(event.candidate) }));
        }
      };

      this.peerConnection.onnegotiationneeded = async () => {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        this.ws.send(JSON.stringify({ event: 'offer', data: JSON.stringify(offer) }));
      };
    }
  }

  processQueuedCandidates() {
    while (this.iceCandidatesQueue.length > 0) {
      this.peerConnection.addIceCandidate(this.iceCandidatesQueue.shift());
    }
  }
}
