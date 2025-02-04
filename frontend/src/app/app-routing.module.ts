import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import {HomeComponent} from "./components/home/home.component";
import {LiveStreamComponent} from "./components/live-stream/live-stream.component";
import {UserProfileComponent} from "./components/user-profile/user-profile.component";

const routes: Routes = [
  { path: 'watch', component: VideoPlayerComponent },
  { path: 'home', component: HomeComponent },
  { path: 'live-stream', component: LiveStreamComponent },
  {path: 'user-profile', component: UserProfileComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
