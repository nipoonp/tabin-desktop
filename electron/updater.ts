import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
const log = require('electron-log');

autoUpdater.logger = log;

autoUpdater.autoDownload = false;

export class Updater {
    update = () => {

        console.log("I am here!");

        autoUpdater.checkForUpdates();

        autoUpdater.on('update-available', () => {
            console.log("Checking for updates...");
        });

        autoUpdater.on('update-available', (info) => {
            console.log("Update available...");
            console.log("Version", info.version)
            // setTimeout(() => {  }, 5000)
            autoUpdater.downloadUpdate();
        })

        autoUpdater.on('update-not-available', () => {
            console.log("Update not available...");
            // setTimeout(() => { autoUpdater.downloadUpdate(); }, 5000)

        })

        autoUpdater.on('update-downloaded', () => {
            console.log("Update downloaded...");
            // dialog.showMessageBox({
            //     type: "info",
            //     title: "Update Ready",
            //     message: "Install and restart now?",
            //     buttons: ['Yes', 'Later']
            // })

            // setTimeout(() => { autoUpdater.quitAndInstall(false, true); }, 5000)
            autoUpdater.quitAndInstall(false, true);

        })


        autoUpdater.on('error', (error) => {
            console.log("error...", error);
            // setTimeout(() => { autoUpdater.downloadUpdate(); }, 5000)

        })


        // autoUpdater.checkForUpdates();

        // autoUpdater.on('update-available', () => {
        //     dialog.showMessageBox({
        //         type: "info",
        //         title: "Update Available",
        //         message: "A new version of Tabin is available. Do you want to upgrade now?",
        //         buttons: ['Update', 'No']
        //     })

        //     setTimeout(() => { autoUpdater.downloadUpdate(); }, 5000)

        // })

        // autoUpdater.on('update-downloaded', () => {
        //     dialog.showMessageBox({
        //         type: "info",
        //         title: "Update Ready",
        //         message: "Install and restart now?",
        //         buttons: ['Yes', 'Later']
        //     })

        //     setTimeout(() => { autoUpdater.quitAndInstall(false, true); }, 5000)

        // })
    }

}