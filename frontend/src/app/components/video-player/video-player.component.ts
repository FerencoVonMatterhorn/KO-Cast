import {Component, OnInit, OnDestroy} from '@angular/core';
import videojs from "video.js";

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  player: any;

  ngOnInit() {
    this.player = videojs('stream-player', {
      controls: true,
      autoplay: true,
      fluid: true,
      sources: [
        { src: 'https://vjs.zencdn.net/v/oceans.webm', type: 'video/webm' }
      ]
    });
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
    }
  }
}
