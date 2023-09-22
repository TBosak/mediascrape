import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{
  searchText: string = '';
  images: {title: string, value: MatListOption[], selectAll: boolean} = {title: 'Images', value: [], selectAll: false}
  videos: {title: string, value: MatListOption[], selectAll: boolean} = {title: 'Videos', value: [], selectAll: false}
  audios: {title: string, value: MatListOption[], selectAll: boolean} = {title: 'Audio', value: [], selectAll: false}
  @ViewChild('Images', {static: false}) imageSelect: ElementRef<MatSelectionList> | undefined;
  @ViewChild('Videos', {static: false}) videoSelect: ElementRef<MatSelectionList> | undefined;
  @ViewChild('Audio', {static: false}) audioSelect: ElementRef<MatSelectionList> | undefined;
  tabId: number = 0;
  timeRetrieved: string = '';

  ngOnInit(){
    chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
      console.log(tabs);
      this.tabId = tabs[0].id as number;
    })

    interval(500).subscribe(()=>{
      this.displayInfo();
    });
  }

  getInfo() {
    console.log('getInfo')
      chrome.scripting.executeScript({
        target : {tabId : this.tabId},
        func : ()=>{
          function setInStorage(tag:string, attribute: string, key: string):void {
            const value: string[] = [];
                  document.body.querySelectorAll(tag).forEach((el: any)=>{
                    if (el[attribute] != '')
                    value.push(el[attribute]);
                  })
            chrome.storage.local.set({[key]: value});
          }
          // setInStorage('a', 'href', 'links');
          setInStorage('img', 'src', 'images');
          setInStorage('video', 'src', 'videos');
          setInStorage('audio', 'src', 'audios');
          // setInStorage('script', 'src', 'scripts');
          // setInStorage('link', 'href', 'stylesheets');
          chrome.storage.local.set({'timeRetrieved': new Date(Date.now()).toLocaleTimeString()});
        }});
    }

  displayInfo(){
    chrome.storage.local.get(['timeRetrieved'], (result) => {
      if(result['timeRetrieved'] !== this.timeRetrieved){
        this.timeRetrieved = result['timeRetrieved'];
        ['images', 'videos', 'audios'].forEach((key)=>{
          this.collectFromStorage(key);
        });
      }
    });
  }

  collectFromStorage(key: string){
    const self = this as Record<string, any>;

    chrome.storage.local.get([key], (result) => {
      if (self[key] !== result[key]) {
        self[key].value = [...new Set(result[key])].map((value)=>{
          return {value: value as string, selected: true} as MatListOption;
        });
      }
    });
  }

  copyToClipboard(text: string){
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  }

  selected(id: string){
    const selectedList = document.getElementById(id);
    return selectedList?.querySelectorAll('mat-list-option[aria-selected="true"]');
  }

  download(id: string){
    switch(id){
      case 'Images':
    this.images.value.forEach((opt)=>{
        if (opt.selected){
          chrome.runtime.sendMessage(opt.value);
        }
      });
      break;
      case 'Videos':
    this.videos.value.forEach((opt)=>{
        if (opt.selected){
          chrome.runtime.sendMessage(opt.value);
        }
      });
      break
      case 'Audio':
    this.audios.value.forEach((opt)=>{
        if (opt.selected){
          chrome.runtime.sendMessage(opt.value);
        }
      });
      break;
    }
  }
}
