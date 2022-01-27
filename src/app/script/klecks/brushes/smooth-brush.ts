import {BB} from '../../bb/bb';

export function smoothBrush() {
    let debugStr = '';
    let color;
    let context;
    let size = 29, spacing = 1 / 3, opacity = 0.6, blending = 0.65;
    let realsize = size;
    let lastDot;
    let settingLockLayerAlpha = false;
    let blendCol = {r: 0, g: 0, b: 0, a: 1}, blendMix = 0.45, mixr, mixg, mixb;
    let localColOld;
    let isDrawing = false;
    let lastInput = {x: 0, y: 0, pressure: 0};
    let lastInput2 = {x: 0, y: 0, pressure: 0};
    let sizePressure = true, opacityPressure = false;
    let lastPressure = 0;
    let history = {
        add: function (p?) {
        }
    };
    this.setHistory = function (l) {
        history = l;
    };
    let historyEntry;

    let bezierLine;


    function getAverage(x, y, size) {
        let width = Math.max(1, parseInt('' + (size * 1.5), 10));

        //determine bounds
        let x0 = Math.round(x - width / 2);
        let y0 = Math.round(y - width / 2);
        let x1 = Math.round(x + width / 2);
        let y1 = Math.round(y + width / 2);


        let imdat = context.getImageData(x0, y0, x1 - x0, y1 - y0);
        let stepSize = Math.pow(size * 1.5, 2) / 60;
        stepSize = Math.max(1, parseInt('' + (stepSize + 0.5), 10));
        let ar = 0, ag = 0, ab = 0, aa = 0, alpha;
        for (let i = 0; i < imdat.data.length; i += 4 * stepSize) {
            alpha = imdat.data[i + 3];
            ar += imdat.data[i] * alpha;
            ag += imdat.data[i + 1] * alpha;
            ab += imdat.data[i + 2] * alpha;
            aa += alpha;
        }
        if (aa !== 0) {
            ar /= aa;
            ag /= aa;
            ab /= aa;
            aa = Math.min(1, aa);
        }
        return {
            r: ar,
            g: ag,
            b: ab,
            a: aa
        };
    }


    function drawDot(x, y, size, opacity, pressure?) {

        if (mixr === null || mixg === null || mixb === null) {
            return;
        }

        context.save();
        if (settingLockLayerAlpha) {
            context.globalCompositeOperation = "source-atop";
        }
        size = Math.max(1, size);
        let radgrad = context.createRadialGradient(size, size, 0, size, size, size);
        let sharpness = Math.pow(opacity, 2) * 0.8;
        let oFac = Math.max(0, Math.min(1, opacity));
        let localOpacity = 2 * oFac - oFac * oFac;
        radgrad.addColorStop(sharpness, "rgba(" + parseInt(mixr) + ", " + parseInt(mixg) + ", " + parseInt(mixb) + ", " + localOpacity + ")");

        radgrad.addColorStop(1, "rgba(" + parseInt(mixr) + ", " + parseInt(mixg) + ", " + parseInt(mixb) + ", 0)");
        context.fillStyle = radgrad;
        context.translate(x - size, y - size);
        context.fillRect(0, 0, size * 2, size * 2);
        context.restore();
    }

    function continueLine(x, y, p, avrg, isCoalesced) {

        let average;
        let localPressure;
        let localOpacity;
        let localSize = (sizePressure) ? Math.max(1, p * size) : Math.max(1, size);

        let bdist = BB.mix(
            (localSize * 2) / 2, // until size 5.3
            (localSize * 2) / 9, // at size 24
            BB.clamp((localSize - 2.7) / (12 - 2.7), 0, 1)
        );

        let avgX = x;
        let avgY = y;
        if (x === null) {
            avgX = lastInput.x;
            avgY = lastInput.y;
        }

        let localColNew;

        if (blending === 0) {
            mixr = parseInt(color.r);
            mixg = parseInt(color.g);
            mixb = parseInt(color.b);
            average = {r: color.r, g: color.g, b: color.b};
        } else {

            if (avrg != undefined) {
                average = {r: avrg.r, g: avrg.g, b: avrg.b, a: avrg.a};
            } else if (isCoalesced) {
                average = {r: localColOld.r, g: localColOld.g, b: localColOld.b, a: 0};
            } else {
                average = getAverage(avgX, avgY, ((sizePressure) ? Math.max(0.1, p * size) : Math.max(0.1, size)));
            }
            localColNew = {r: 0, g: 0, b: 0, a: 0};

            if (average.a > 0 && blendCol.a === 0) {
                blendCol.r = average.r;
                blendCol.g = average.g;
                blendCol.b = average.b;
                blendCol.a = average.a;
                localColNew.r = BB.mix(color.r, blendCol.r, blending);
                localColNew.g = BB.mix(color.g, blendCol.g, blending);
                localColNew.b = BB.mix(color.b, blendCol.b, blending);
                localColNew.a = blendCol.a;

            } else {
                blendCol.r = BB.mix(blendCol.r, BB.mix(blendCol.r, average.r, blendMix), average.a);
                blendCol.g = BB.mix(blendCol.g, BB.mix(blendCol.g, average.g, blendMix), average.a);
                blendCol.b = BB.mix(blendCol.b, BB.mix(blendCol.b, average.b, blendMix), average.a);
                blendCol.a = Math.min(1, blendCol.a + average.a);

                localColNew.r = BB.mix(color.r, BB.mix(color.r, blendCol.r, blending), blendCol.a);
                localColNew.g = BB.mix(color.g, BB.mix(color.g, blendCol.g, blending), blendCol.a);
                localColNew.b = BB.mix(color.b, BB.mix(color.b, blendCol.b, blending), blendCol.a);
                localColNew.a = blendCol.a;
            }

        }


        function bezierCallback(val) {
            if (blending >= 1 && blendCol.a <= 0) {
                return;
            }
            let factor = val.t;
            localPressure = lastInput2.pressure * (1 - factor) + p * factor;
            localOpacity = (opacityPressure) ? (opacity * localPressure * localPressure) : opacity;
            localSize = (sizePressure) ? Math.max(0.1, localPressure * size) : Math.max(0.1, size);
            if (blending != 0) {
                mixr = parseInt('' + BB.mix(localColOld.r, localColNew.r, factor));
                mixg = parseInt('' + BB.mix(localColOld.g, localColNew.g, factor));
                mixb = parseInt('' + BB.mix(localColOld.b, localColNew.b, factor));
            }
            if (blending === 1 && localColOld.a === 0) {
                mixr = localColNew.r;
                mixg = localColNew.g;
                mixb = localColNew.b;
            }
            drawDot(val.x, val.y, localSize, localOpacity, p);
        }

        if (x === null) {
            bezierLine.addFinal(bdist, bezierCallback);
        } else {
            bezierLine.add(x, y, bdist, bezierCallback);
        }


        localColOld = localColNew;

        return average;
    }


    // --- interface ---

    this.setSize = function (s) {
        size = s;
    };
    this.getSize = function () {
        return size;
    };
    this.getOpacity = function () {
        return opacity;
    };
    this.setOpacity = function (o) {
        opacity = o;
    };
    this.setBlending = function (b) {
        blending = b;
    };
    this.getBlending = function () {
        return blending;
    };
    this.setColor = function (c) {
        color = c;
    };
    this.setSpacing = function (s) {
        spacing = s;
    };
    this.setContext = function (c) {
        context = c;
    };
    this.sizePressure = function (b) {
        sizePressure = b;
    };
    this.opacityPressure = function (b) {
        opacityPressure = b;
    };
    this.startLine = function (x, y, p, avrg) {
        historyEntry = {
            tool: ["brush", "smoothBrush"],
            actions: []
        };
        historyEntry.actions.push({
            action: "opacityPressure",
            params: [opacityPressure]
        });
        historyEntry.actions.push({
            action: "sizePressure",
            params: [sizePressure]
        });
        historyEntry.actions.push({
            action: "setSize",
            params: [size]
        });
        historyEntry.actions.push({
            action: "setOpacity",
            params: [opacity]
        });
        historyEntry.actions.push({
            action: "setColor",
            params: [color]
        });
        historyEntry.actions.push({
            action: "setBlending",
            params: [blending]
        });
        historyEntry.actions.push({
            action: "setLockAlpha",
            params: [settingLockLayerAlpha]
        });


        isDrawing = true;

        p = Math.max(0, Math.min(1, p));
        let localOpacity = (opacityPressure) ? (opacity * p * p) : opacity;
        let localSize = (sizePressure) ? Math.max(0.1, p * size) : Math.max(0.1, size);
        let average;
        if (blending === 0) {
            mixr = parseInt(color.r);
            mixg = parseInt(color.g);
            mixb = parseInt(color.b);
            average = {r: color.r, g: color.g, b: color.b};
        } else {
            if (avrg != undefined) {
                average = {r: avrg.r, g: avrg.g, b: avrg.b, a: avrg.a};
            } else {
                average = getAverage(x, y, ((sizePressure) ? Math.max(0.1, p * size) : Math.max(0.1, size)));
            }

            blendCol = {
                r: average.r,
                g: average.g,
                b: average.b,
                a: average.a
            };

            mixr = color.r * (1 - blendCol.a) + (blending * blendCol.r + color.r * (1 - blending)) * blendCol.a;
            mixg = color.g * (1 - blendCol.a) + (blending * blendCol.g + color.g * (1 - blending)) * blendCol.a;
            mixb = color.b * (1 - blendCol.a) + (blending * blendCol.b + color.b * (1 - blending)) * blendCol.a;
            mixr = parseInt(mixr);
            mixg = parseInt(mixg);
            mixb = parseInt(mixb);
        }

        localColOld = {r: mixr, g: mixg, b: mixb, a: blendCol.a};

        if (blending < 1 || blendCol.a > 0) {
            drawDot(x, y, localSize, localOpacity);
        }

        bezierLine = new BB.BezierLine();
        bezierLine.add(x, y, 0, function () {
        });

        lastInput.x = x;
        lastInput.y = y;
        lastInput.pressure = p;
        lastInput2 = BB.copyObj(lastInput);
        lastDot = realsize * spacing;
        historyEntry.actions.push({
            action: "startLine",
            params: [x, y, p, {r: average.r, g: average.g, b: average.b, a: average.a}]
        });
    };
    this.goLine = function (x, y, p, avrg, isCoalesced) {
        if (!isDrawing) {
            return;
        }

        let average = continueLine(x, y, lastInput.pressure, avrg, isCoalesced);

        lastInput2 = BB.copyObj(lastInput);
        lastInput.x = x;
        lastInput.y = y;
        lastInput.pressure = p;

        historyEntry.actions.push({
            action: "goLine",
            params: [x, y, p, {r: average.r, g: average.g, b: average.b, a: average.a}]
        });
    };
    this.endLine = function () {

        if (bezierLine) {
            continueLine(null, null, lastInput.pressure, null, false);
        }

        isDrawing = false;
        bezierLine = undefined;
        if (historyEntry) {
            historyEntry.actions.push({
                action: "endLine",
                params: []
            });
            history.add(historyEntry);
            historyEntry = undefined;
        }
    };

    //cheap n' ugly
    this.drawLineSegment = function (x1, y1, x2, y2, avrg) {
        lastInput.x = x2;
        lastInput.y = y2;

        if (isDrawing || x1 === undefined) {
            return;
        }

        let average;
        if (avrg != undefined) {
            average = {r: avrg.r, g: avrg.g, b: avrg.b, a: avrg.a};
        } else {
            average = getAverage(x1, y1, Math.max(0.1, size));
        }

        blendCol = {
            r: average.r,
            g: average.g,
            b: average.b,
            a: average.a
        };

        mixr = color.r * (1 - blendCol.a) + (blending * blendCol.r + color.r * (1 - blending)) * blendCol.a;
        mixg = color.g * (1 - blendCol.a) + (blending * blendCol.g + color.g * (1 - blending)) * blendCol.a;
        mixb = color.b * (1 - blendCol.a) + (blending * blendCol.b + color.b * (1 - blending)) * blendCol.a;
        mixr = parseInt(mixr);
        mixg = parseInt(mixg);
        mixb = parseInt(mixb);


        let p = 1;
        let localOpacity = (opacityPressure) ? (opacity * p * p) : opacity;
        let localSize = (sizePressure) ? Math.max(0.1, p * size) : Math.max(0.1, size);


        let mouseDist = Math.sqrt(Math.pow(x2 - x1, 2.0) + Math.pow(y2 - y1, 2.0));
        let eX = (x2 - x1) / mouseDist;
        let eY = (y2 - y1) / mouseDist;
        let loopDist;
        let bdist = localSize * spacing;
        lastDot = 0;
        for (loopDist = lastDot; loopDist <= mouseDist; loopDist += bdist) {
            drawDot(x1 + eX * loopDist, y1 + eY * loopDist, localSize, localOpacity);
        }


        let historyEntry = {
            tool: ["brush", "smoothBrush"],
            actions: []
        };
        historyEntry.actions.push({
            action: "opacityPressure",
            params: [opacityPressure]
        });
        historyEntry.actions.push({
            action: "sizePressure",
            params: [sizePressure]
        });
        historyEntry.actions.push({
            action: "setSize",
            params: [size]
        });
        historyEntry.actions.push({
            action: "setOpacity",
            params: [opacity]
        });
        historyEntry.actions.push({
            action: "setColor",
            params: [color]
        });
        historyEntry.actions.push({
            action: "setBlending",
            params: [blending]
        });
        historyEntry.actions.push({
            action: "setLockAlpha",
            params: [settingLockLayerAlpha]
        });

        historyEntry.actions.push({
            action: "drawLineSegment",
            params: [x1, y1, x2, y2, {r: average.r, g: average.g, b: average.b, a: average.a}]
        });
        history.add(historyEntry);
    };

    let requestCanvas = function () {
        return false;
    };
    //outside can replace this and offer access to the klCanvas
    this.setRequestCanvas = function (f) {
        requestCanvas = f;
    };
    this.isDrawing = function () {
        return isDrawing;
    };
    this.setDebug = function (str) {
        debugStr = str;
    };

    // --- set ---
    this.setLockAlpha = function (b) {
        settingLockLayerAlpha = !!b;
    };

    // --- get ---
    this.getLockAlpha = function () {
        return settingLockLayerAlpha;
    };
}