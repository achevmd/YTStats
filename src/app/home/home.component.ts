import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../core/services/electron/electron.service';
import { DataService } from '../core/services/data/data.service';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  channelInfo: any;
  channelInfoOld: any;
  channelIds: string[];
  username = new FormControl('');
  error: boolean = false;
  loading: boolean = true;
  math: Math = Math;

  constructor(private electron: ElectronService, private data: DataService) { }

  // Lifecycle event
  async ngOnInit() {

    const stored = await this.data.getChannelIds();
    console.log('Stored channel ids: ', stored);

    this.channelIds = stored;

    if (stored) this.getChannels();
  }

  // Close window
  closeWindow() { this.electron.window.close(); }

  // Minimize window
  minimizeWindow() { this.electron.window.minimize(); }

  // Open external link
  openExternalLink(link) { this.electron.ipcRenderer.send('open-link', link); }

  // Add channel
  async addChannel() {

    this.error = false;

    const channelId = await this.data.addChannel(this.username.value);

    if (!channelId) {
      this.error = true
      setTimeout(() => this.error = false, 2000);
      return;
    }

    console.log(`${this.username.value} added and stored as ${channelId}`);
    this.getChannels();

    this.username.setValue('');

  }

  // Remove channel
  async removeChannel(channelId) {

    this.data.removeChannel(channelId);
    await this.getChannels();

  }

  // Get channels
  async getChannels() {

    console.log('Getting channels');

    // Show loading bar
    this.loading = true;

    // Set old channel info
    if(this.channelInfoOld) this.channelInfoOld = this.channelInfo;

    // Get channels info
    this.channelInfo = await this.data.getChannelsData();

    // Hide loading bar
    this.loading = false

    // Set old channel info to channel info (first time fetching channels info)
    if (!this.channelInfoOld) this.channelInfoOld = this.channelInfo;
  }

  // Clear channels
  clearChannels(e) {

    console.log('Clearing channels');

    this.loading = true;
    setTimeout(() => this.loading = false, 500);

    this.data.clearChannels();
    this.channelInfo = null;
    this.channelIds = null;

  }

  // Show more/less channel information
  toggleMoreInfo(e: any) {

    if (e.parentElement.previousElementSibling.style.display === 'block') {
      e.innerHTML = 'Show more info'
      e.parentElement.previousElementSibling.style.display = 'none';
    } else {
      e.innerHTML = 'Show less info'
      e.parentElement.previousElementSibling.style.display = 'block';
    }
  }
}
