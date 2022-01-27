import {BB} from '../../bb/bb';
import {brushes} from '../brushes/brushes';
import {eventResMs} from './brushes-consts';
import {klHistory} from '../history/kl-history';
import {PcSlider} from '../ui/base-components/slider';
import {penPressureToggle} from '../ui/base-components/pen-pressure-toggle';
import {checkBox} from '../ui/base-components/check-box';
// @ts-ignore
import brushIconImg from 'url:~/src/app/img/ui/brush-eraser.svg';

export const eraserBrushUi = (function () {
    let brushInterface: any = {
        image: brushIconImg,
        tooltip: 'Eraser',
        sizeSlider: {
            min: 0.5,
            max: 200,
            curve: BB.quadraticSplineInput(0.5, 200, 0.1)
        },
        opacitySlider: {
            min: 1 / 100,
            max: 1
        }
    };

    /**
     * @param p = {onSizeChange: function(size), onOpacityChange: function(opacity)}
     * @constructor
     */
    brushInterface.Ui = function (p) {
        let div = document.createElement("div"); // the gui
        let brush = new brushes.eraser();
        brush.setHistory(klHistory);
        p.onSizeChange(brush.getSize());

        let sizeSlider;
        let opacitySlider;
        let isTransparentBg = false;

        function setSize(size) {
            brush.setSize(size);
        }

        function init() {
            sizeSlider = new PcSlider({
                label: 'Size',
                width: 225,
                height: 30,
                min: brushInterface.sizeSlider.min,
                max: brushInterface.sizeSlider.max,
                initValue: 30,
                eventResMs: eventResMs,
                onChange: function (val) {
                    setSize(val);
                    p.onSizeChange(val);
                },
                curve: brushInterface.sizeSlider.curve,
                formatFunc: function (v) {
                    v *= 2;
                    if (v < 10) {
                        return Math.round(v * 10) / 10;
                    } else {
                        return Math.round(v);
                    }
                }
            });
            opacitySlider = new PcSlider({
                label: 'Opacity',
                width: 225,
                height: 30,
                min: brushInterface.opacitySlider.min,
                max: brushInterface.opacitySlider.max,
                initValue: 1,
                eventResMs: eventResMs,
                onChange: function (val) {
                    brush.setOpacity(val);
                    p.onOpacityChange(val);
                },
                formatFunc: function(v) {
                    return Math.round(v * 100);
                }
            });

            let pressureSizeToggle = penPressureToggle(true, function (b) {
                brush.sizePressure(b);
            });
            let pressureOpacityToggle = penPressureToggle(false, function (b) {
                brush.opacityPressure(b);
            });

            div.appendChild(pressureSizeToggle);
            div.appendChild(sizeSlider.getElement());
            BB.el({
                parent: div,
                css: {
                    clear: 'both',
                    marginBottom: '10px'
                }
            });
            div.appendChild(pressureOpacityToggle);
            div.appendChild(opacitySlider.getElement());

            let transparencyToggle = checkBox({
                init: false,
                label: 'Transparent Background',
                callback: function (b) {
                    isTransparentBg = b;
                    brush.setTransparentBG(b);
                }
            });
            transparencyToggle.style.marginTop = "10px";
            div.appendChild(transparencyToggle);
        }

        init();

        function drawDot(x, y) {
            brush.drawDot(x, y);
        }

        this.increaseSize = function (f) {
            if (!brush.isDrawing()) {
                sizeSlider.increaseValue(f);
            }
        };
        this.decreaseSize = function (f) {
            if (!brush.isDrawing()) {
                sizeSlider.decreaseValue(f);
            }
        };
        this.getSize = function () {
            return brush.getSize();
        };
        this.setSize = function(size) {
            setSize(size);
            sizeSlider.setValue(size);
        };
        this.getOpacity = function () {
            return brush.getOpacity();
        };
        this.setOpacity = function(opacity) {
            brush.setOpacity(opacity);
            opacitySlider.setValue(opacity);
        };
        this.setColor = function (c) {
            //brush.setColor(c);
        };
        this.setContext = function (c) {
            brush.setContext(c);
        };
        this.startLine = function (x, y, p) {
            brush.startLine(x, y, p);
        };
        this.goLine = function (x, y, p) {
            brush.goLine(x, y, p);
        };
        this.endLine = function () {
            brush.endLine();
        };
        this.getBrush = function () {
            return brush;
        };
        this.getIsTransparentBg = function () {
            return isTransparentBg;
        };
        this.isDrawing = function () {
            return brush.isDrawing();
        };
        this.getElement = function () {
            return div;
        }
    };

    return brushInterface;
})();