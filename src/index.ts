import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './scss/style.scss';
import * as _ from 'lodash';
import renderMap from './ts/map';
import { initialPlayerRender, players } from './ts/player'
  
const render = () =>  {
    // Map rendering
    renderMap()

    // Players initialization
    initialPlayerRender();
}

render();