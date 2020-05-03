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

The live scripts can be found at:

- https://unpkg.com/higlass-multivec/dist/higlass-multivec.min.js

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

### ECMAScript Modules (ESM)

We also build out ES modules for usage by applications who may need to import or use `higlass-multivec` as a component.

Whenever have a statement such as the following, assuming `higlass-multivec` is in your node_modules folder:
```javascript
import { StackedBarTrack } from 'higlass-multivec';
```

Then StackedBarTrack would automatically be imported from the `./es` directory (set via package.json's `"module"` value). Can also import component(s) directly, especially if only need to use one or two, e.g.:

```javascript
import { StackedBarTrack } from 'higlass-multivec/es/StackedBarTrack';
```

To use this then along with HiGlassComponent, assuming you are developing with React either in an environment where `window` is available (client-side), use via the following:

```javascript
import React from 'react';
import { StackedBarTrack } from 'higlass-multivec/es/StackedBarTrack';
import { HiGlassComponent } from 'higlass/dist/hglib';
import { default as higlassRegister } from 'higlass-register';

// Call this sometime before we render out MyComponent below (synchronous)
higlassRegister({
    name: 'StackedBarTrack',
    track: StackedBarTrack,
    config: StackedBarTrack.config,
})

...


function MyComponent(props){
    const { viewConfig, options, width, height, ...otherProps } = props;
    return (
        <div className="container">
            <HiGlassComponent {...{ viewConfig, options, width, height }} />
        </div>
    );
}
MyComponent.defaultProps = { ... };

ReactDOM.render(
    <MyComponent {...someData} />,
    document.getElementById("root")
);

```

#### Minor Background Info

- https://dev.to/bennypowers/you-should-be-using-esm-kn3
- https://nodejs.org/api/esm.html#esm_introduction

## Development

### Testing

To run the test suite:

```
npm run test-watch
```


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
