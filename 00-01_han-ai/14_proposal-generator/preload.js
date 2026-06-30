'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  openJson:         ()       => ipcRenderer.invoke('open-json'),
  generateProposal: (data)   => ipcRenderer.invoke('generate-proposal', data),
  generatePdfs:     (payload) => ipcRenderer.invoke('generate-pdfs', payload)
});
