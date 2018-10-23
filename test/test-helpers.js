import {
  mount,
  configure
} from 'enzyme';

import {
  HiGlassComponent,
  waitForJsonComplete,
  waitForTilesLoaded,
  getTrackObjectFromHGC,
} from 'higlass';

import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

/**
 * Mount a new HiGlassComponent and unmount the previously visible one.
 *
 * @param {HTML Element} div A div element to detach and recreate for the component
 * @param {Enzyme wrapped HiGlass component} prevHgc An already mounted
 *  hgc component
 * @param {function} done The callback to call when the component is fully loaded
 */
export const mountHGComponent = (prevDiv, prevHgc, viewConf, done, options) => {
  if (prevHgc) {
    prevHgc.unmount();
    prevHgc.detach();
  }

  if (prevDiv) {
    global.document.body.removeChild(prevDiv);
  }

  const style = (options && options.style) || 'width:800px; background-color: lightgreen;';
  const bounded = (options && options.bounded) || false;

  console.log('options', options, 'style:', style);
  
  const div = global.document.createElement('div');
  global.document.body.appendChild(div);

  div.setAttribute('style', style);
  div.setAttribute('id', 'simple-hg-component');

  const hgc = mount(<HiGlassComponent
    options={{ bounded }}
    viewConfig={viewConf}
  />, { attachTo: div });

  hgc.update();
  waitForTilesLoaded(hgc.instance(), () => {
    waitForJsonComplete(done);
  });

  return [div, hgc];
};