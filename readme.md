# Wittr App

## What is it?

An app showing you if there are any other Wittertainees leaving close to you.

An email request was read out in the Feb 12 2016 Kermode and Mayo Film Review podcast, seeing if there was an app to connect fellow listeners (well Colonial Commoners, but I'll allow British Empire citizens as well). So here we are! It's very simple, not entirely accurate (on purpose.... for peace of mind), contains the code of conduct and is just a bit of fun.

## Requirements

 - Ionic Framework - http://ionicframework.com/ - (and all of it's documented requirements)
 - CMDER - http://cmder.net/ - (I use it for linux like commands in Windows, and it's so much nicer to use than cmd.exe)

## Installation

On Windows, use CMDER to run the following commands. On Linux/OSX alter as required and use a standard terminal window

```
mkdir c:\dev
cd c:\dev
ionic start wittrApp blank
cd wittrApp
rm -r www
git clone user@domain.com:me/repo.git www
cd www/js
cp global-settings.example.js global-settings.js
```

### Plugins

When building for devices, you need to run the following to install the required cordova plugins:

```
cd c:\dev\wittrApp
ionic plugin add cordova-plugin-geolocation
ionic plugin add cordova-plugin-inappbrowser
ionic plugin add onesignal-cordova-plugin
```

#### Cordova Google Maps

One final plugin is required, Cordova Google Maps. The installation for this is a bit more involved, so please follow their provided install guide here : https://github.com/mapsplugin/cordova-plugin-googlemaps

### Javascript API Key

Update `googleMapsJavascriptAPIKey` in the newly created `js/global-settings.js` file (NOT `js/global-settings-example.js`) with your own Google Maps Javascript API key

## Running the app in dev

```
cd c:\dev\wittrApp
ionic serve
```

It should open in a web browser. If it's Chrome be sure to go into Developer mode and enable the "device emulator"

## With thanks to

 - NodeJS
 - Cordova
 - AngularJS
 - Ionic Framework
 - All Cordova plugin developers
 - One Signal
 - Google Maps




## Hello to

- Jason Isaacs

## Please note


```
 _    _  _  _    _           _                      _    _      _
| |  | |(_)| |  | |         (_)                    | |  | |    (_)
| |  | | _ | |_ | |_  _ __   _  ___   _ __    ___  | |_ | |__   _  _ __    __ _
| |/\| || || __|| __|| '__| | |/ __| | '_ \  / _ \ | __|| '_ \ | || '_ \  / _` |
\  /\  /| || |_ | |_ | |    | |\__ \ | | | || (_) || |_ | | | || || | | || (_| |
 \/  \/ |_| \__| \__||_|    |_||___/ |_| |_| \___/  \__||_| |_||_||_| |_| \__, |
 _                _                    _  _    _       _    _              __/ |
| |              | |                  (_)| |  | |     | |  | |            |___/
| |_   ___     __| |  ___   __      __ _ | |_ | |__   | |_ | |__    ___
| __| / _ \   / _` | / _ \  \ \ /\ / /| || __|| '_ \  | __|| '_ \  / _ \
| |_ | (_) | | (_| || (_) |  \ V  V / | || |_ | | | | | |_ | | | ||  __/
 \__| \___/   \__,_| \___/    \_/\_/  |_| \__||_| |_|  \__||_| |_| \___|
______ ______  _____  _
| ___ \| ___ \/  __ \| |
| |_/ /| |_/ /| /  \/| |
| ___ \| ___ \| |    | |
| |_/ /| |_/ /| \__/\|_|
\____/ \____/  \____/(_)
```
