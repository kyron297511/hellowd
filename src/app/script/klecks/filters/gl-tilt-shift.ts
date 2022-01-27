import {BB} from '../../bb/bb';
import {eventResMs} from './filters-consts';
import {PcSlider} from '../ui/base-components/slider';
import {KlCanvasPreview} from '../canvas-ui/canvas-preview';
import {getSharedFx} from './shared-gl-fx';

export const glTiltShift = {

    getDialog(params) {
        let context = params.context;
        let canvas = params.canvas;
        if (!context || !canvas) {
            return false;
        }

        let layers = canvas.getLayers();
        let selectedLayerIndex = canvas.getLayerIndex(context.canvas);

        let fit = BB.fitInto(280, 200, context.canvas.width, context.canvas.height, 1);
        let displayW = parseInt('' + fit.width), displayH = parseInt('' + fit.height);
        let w = Math.min(displayW, context.canvas.width);
        let h = Math.min(displayH, context.canvas.height);

        let tempCanvas = BB.canvas(w, h);
        {
            const ctx = tempCanvas.getContext("2d");
            ctx.save();
            if (w > context.canvas.width) {
                ctx.imageSmoothingEnabled = false;
            }
            ctx.drawImage(context.canvas, 0, 0, w, h);
            ctx.restore();
        }
        let previewFactor = w / context.canvas.width;
        let displayPreviewFactor = displayW / context.canvas.width;

        let div = document.createElement("div");
        let result: any = {
            element: div
        };

        let pointerListenerArr = [];

        function finishInit() {
            let blur = 20, gradient = 200;
            div.innerHTML = "Applies tilt shift on the selected layer.<br/><br/>";

            let glCanvas = getSharedFx();
            if (!glCanvas) {
                return; // todo throw?
            }
            let texture = glCanvas.texture(tempCanvas);
            let fa, fb; // focus line
            function update() {
                try {
                    glCanvas.draw(texture).tiltShift(
                        fa.x / displayPreviewFactor * previewFactor,
                        fa.y / displayPreviewFactor * previewFactor,
                        fb.x / displayPreviewFactor * previewFactor,
                        fb.y / displayPreviewFactor * previewFactor,
                        blur * previewFactor,
                        gradient * previewFactor
                    ).update();
                    klCanvasPreview.render();
                } catch(e) {
                    (div as any).errorCallback(e);
                }
            }

            function nob(x, y) {
                let nobSize = 14;
                let div = document.createElement("div");
                (div as any).x = x;
                (div as any).y = y;
                div.style.width = nobSize + "px";
                div.style.height = nobSize + "px";
                div.style.backgroundColor = "#fff";
                div.style.boxShadow = "inset 0 0 0 2px #000";
                div.style.borderRadius = nobSize + "px";
                div.style.position = "absolute";
                div.style.cursor = "move";
                div.style.left = (x - nobSize / 2) + "px";
                div.style.top = (y - nobSize / 2) + "px";
                BB.css(div, {
                    userSelect: 'none'
                });
                let pointerListener = new BB.PointerListener({
                    target: div,
                    maxPointers: 1,
                    onPointer: function(event) {
                        if (event.button === 'left' && event.type === 'pointermove') {
                            (div as any).x += event.dX;
                            (div as any).y += event.dY;
                            div.style.left = ((div as any).x - nobSize / 2) + "px";
                            div.style.top = ((div as any).y - nobSize / 2) + "px";
                            update();
                        }
                    }
                });
                pointerListenerArr.push(pointerListener);
                return div;
            }

            fa = nob(parseInt('' + (displayW / 6)), parseInt('' + (displayH / 2)));
            fb = nob(parseInt('' + (displayW - displayW / 6)), parseInt('' + (displayH - displayH / 3)));

            let blurSlider = new PcSlider({
                label: 'Blur Radius',
                width: 300,
                height: 30,
                min: 0,
                max: 200,
                initValue: blur,
                eventResMs: eventResMs,
                onChange: function (val) {
                    blur = val;
                    update();
                }
            });
            blurSlider.getElement().style.marginBottom = "10px";
            div.appendChild(blurSlider.getElement());
            let gradientSlider = new PcSlider({
                label: 'Gradient Radius',
                width: 300,
                height: 30,
                min: 0,
                max: 1000,
                initValue: gradient,
                eventResMs: eventResMs,
                onChange: function (val) {
                    gradient = val;
                    update();
                }
            });
            div.appendChild(gradientSlider.getElement());


            let previewWrapper = document.createElement("div");
            previewWrapper.oncontextmenu = function () {
                return false;
            };
            BB.css(previewWrapper, {
                width: "340px",
                marginLeft: "-20px",
                height: "220px",
                backgroundColor: "#9e9e9e",
                marginTop: "10px",
                boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset",
                overflow: "hidden",
                position: "relative",
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            });

            let previewLayerArr = [];
            {
                for(let i = 0; i < layers.length; i++) {
                    previewLayerArr.push({
                        canvas: i === selectedLayerIndex ? glCanvas : layers[i].context.canvas,
                        opacity: layers[i].opacity,
                        mixModeStr: layers[i].mixModeStr
                    });
                }
            }
            let klCanvasPreview = new KlCanvasPreview({
                width: parseInt('' + displayW),
                height: parseInt('' + displayH),
                layerArr: previewLayerArr
            });

            let previewInnerWrapper = BB.el({
                css: {
                    position: 'relative',
                    boxShadow: '0 0 5px rgba(0,0,0,0.5)',
                    width: parseInt('' + displayW) + 'px',
                    height: parseInt('' + displayH) + 'px'
                }
            });
            previewInnerWrapper.appendChild(klCanvasPreview.getElement());
            previewWrapper.appendChild(previewInnerWrapper);

            previewInnerWrapper.appendChild(fa);
            previewInnerWrapper.appendChild(fb);


            div.appendChild(previewWrapper);
            update();
            result.destroy = () => {
                for(let i = 0; i < pointerListenerArr.length; i++) {
                    pointerListenerArr[i].destroy();
                }
                blurSlider.destroy();
                gradientSlider.destroy();
                texture.destroy();
            };
            result.getInput = function () {
                result.destroy();
                return {
                    a: {x: fa.x / displayPreviewFactor, y: fa.y / displayPreviewFactor},
                    b: {x: fb.x / displayPreviewFactor, y: fb.y / displayPreviewFactor},
                    blur: blur,
                    gradient: gradient
                };
            };
        }

        setTimeout(finishInit, 1);


        return result;
    },

    apply(params) {
        let context = params.context;
        let history = params.history;
        let a = params.input.a;
        let b = params.input.b;
        let blur = params.input.blur;
        let gradient = params.input.gradient;
        if (!context || !history)
            return false;
        history.pause();
        let glCanvas = getSharedFx();
        if (!glCanvas) {
            return false; // todo more specific error?
        }
        let texture = glCanvas.texture(context.canvas);
        let w = context.canvas.width;
        let h = context.canvas.height;
        glCanvas.draw(texture).tiltShift(a.x, a.y, b.x, b.y, blur, gradient).update();
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.drawImage(glCanvas, 0, 0);
        texture.destroy();
        history.pause(false);
        history.add({
            tool: ["filter", "glTiltShift"],
            action: "apply",
            params: [{
                input: params.input
            }]
        });
        return true;
    }

};