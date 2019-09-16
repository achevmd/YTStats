import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ElectronService } from '../electron/electron.service';
import { get } from 'http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  channelIds: string[];

  constructor(private http: HttpClient, private electron: ElectronService) { }


  async getChannelIds(): Promise<any> {
    return new Promise((res, rej) => {

      this.electron.ipcRenderer.send('get-channels');

      this.electron.ipcRenderer.on('channels', (event, channelIds) => {
        console.log('Getting channel ids: ', channelIds);
        this.channelIds = channelIds;
        res(channelIds)
      });

      // this.channelIds = ['UC-lHJZR3Gqxm24_Vd_AJ5Yw']; // UCkin59aR57-RgqvN04jHSIg
      // return this.channelIds;

    });
  }

  addChannel(username) {

    return new Promise((res, rej) => {

      // Channel id
      let channelId: string;

      // Fetch data by username
      this.http.get<any>(`https://www.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&forUsername=${username}&key=AIzaSyBNe0gjXBZfeEwJZNk6PsF99b8gBOSjhCk`)
        .subscribe(data => {

          if (data.items.length)
            channelId = data.items[0].id;

          // Fetch data by ID
          this.http.get<any>(`https://www.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=${username}&key=AIzaSyBNe0gjXBZfeEwJZNk6PsF99b8gBOSjhCk`)
            .subscribe(data => {

              if (data.items.length)
                channelId = data.items[0].id;

              if (channelId)
                this.electron.ipcRenderer.send('add-channel', channelId);

              console.log('Channel id: ', channelId);
              res(channelId);
            });
        });
    })
  }

  removeChannel(channelId) {
    this.electron.ipcRenderer.send('remove-channel', channelId);
  }

  clearChannels() {
    this.electron.ipcRenderer.send('clear-channels');
  }

  async getChannelsData(): Promise<any> {

    return new Promise(async (res, rej) => {

      try {

        await this.getChannelIds();
        this.http.get(`https://www.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=${this.channelIds.join(',')}&key=AIzaSyBNe0gjXBZfeEwJZNk6PsF99b8gBOSjhCk`)
          .subscribe(data => res(data));
      }

      catch (e) {
        rej(e);
      }
    });


    // // Make request every minute
    // return interval(30000).pipe(
    //   startWith(0),
    //   switchMap(() => this.http.get(`https://www.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=${this.usernames.join(',')}&key=AIzaSyBNe0gjXBZfeEwJZNk6PsF99b8gBOSjhCk`)),
    //   map(res => res)
    // );
  }
}
