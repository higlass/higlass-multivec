# Multivec Tracks for HiGlass

Display genome-wide multivec tracks in HiGlass!

[![HiGlass](https://img.shields.io/badge/higlass-🌸-brightgreen.svg)](http://higlass.io)
[![Travis](https://img.shields.io/travis/daniellenguyen/higlass-multivec.svg)](https://travis-ci.org/daniellenguyen/higlass-multivec)


This is the source code for multivec tracks in HiGlass only; for the rest of HiGlass,
see these repositories:

 - HiGlass viewer: https://github.com/hms-dbmi/higlass
 - HiGlass server: https://github.com/hms-dbmi/higlass-server
 - HiGlass docker: https://github.com/hms-dbmi/higlass-docker

## Installation

```
npm install higlass-multivec
```
## Usage

There are three types of tracks to choose from:

```
"basic-multiple-line-chart"
"horizontal-stacked-bar"
"basic-multiple-bar-chart"
```

Configure the track in your view config; you should be all set from here!
```
[...
   {
    "type": "horizontal-stacked-bar",
    "tilesetUid": "my-multivec-db",
    "server": "http://test1.resgen.io/api/v1",
       "height": 200,
       "width": 470,
       "options": {
           "labelPosition": "topLeft",
           "labelColor": "black",
           "labelTextOpacity": 0.4,
           "valueScaling": "exponential",
           "trackBorderWidth": 0,
           "trackBorderColor": "black",
           "heatmapValueScaling": "log",
           "name": "all.KL.bed.multires.mv5",
           "scaledHeight": true,
           "backgroundColor": "white",
           "sortLargestOnTop": true,
       },
    },
]   
```
For an example, see [`src/index.html`](src/index.html).
## Development

### Installation

```bash
$ git clone https://github.com/hms-dbmi/higlass-multivec.git
$ cd higlass-multivec
$ npm install
```
If you have a local copy of higlass, you can then run this command in the higlass-multivec directory:

```bash
npm link higlass
```

### Commands

 - **Developmental server**: `npm start`
 - **Production build**: `npm run build`