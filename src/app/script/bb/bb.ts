import * as BBEventListener from './input/event-listener';
import {
    addClassName, append, centerWithin, copyObj, createSvg,
    css, dateDayDifference, decToFraction,
    fitInto, gcd, getDate,
    getPageOffset, handleClick, imageBlobToUrl,
    insertAfter, loadImage,
    reduce,
    removeClassName, setAttributes, shareCanvas
} from './base/base';
import {
    canShareFiles,
    eventUsesHighResTimeStamp,
    getVisitor,
    hasPointerEvents,
    hasWebGl,
    isCssMinMaxSupported,
    mouseEventHasMovement
} from './base/browser';
import {KeyListener} from './input/key-listener';
import {PointerListener} from './input/pointer-listener';
import * as EventChain from './input/event-chain';
import {
    convertToAlphaChannelCanvas,
    copyCanvas,
    createCheckerCanvas, createCheckerDataUrl,
    drawTransformedImageOnCanvas,
    drawTransformedImageOnCanvasDeprectated, resizeCanvas
} from './base/canvas';
import {Matrix} from './math/matrix';
import {Vec2} from './math/vec2';
import {BezierLine, PointLine, projectPointOnLine, quadraticSplineInput, SplineInterpolator} from './math/line';
import {CMYK, ColorConverter, HSV, RGB, testIsWhiteBestContrast} from './color/color';
import {appendTextDiv, clearSelection, destroyEl, el, makeUnfocusable} from './base/ui';
import {angleDeg, angleFromPoints, clamp, dist, mix, pointsToAngleRad, rotate, rotateAround} from './math/math';
import {createCanvas} from './base/create-canvas';
import {BbLog} from './base/bb-log';

export const BB = {

    // ---- browser ----
    eventUsesHighResTimeStamp,
    mouseEventHasMovement,
    hasPointerEvents,
    hasWebGl,
    getVisitor,
    isCssMinMaxSupported,
    canShareFiles,

    // ---- base ----
    getPageOffset,
    insertAfter,
    loadImage,
    css,
    setAttributes,
    addClassName,
    removeClassName,
    append,
    fitInto,
    centerWithin,
    getDate,
    gcd,
    reduce,
    decToFraction,
    imageBlobToUrl,
    dateDayDifference,
    copyObj,
    shareCanvas,
    handleClick,
    createSvg,
    BbLog,

    // ---- math ----
    mix,
    dist,
    pointsToAngleRad,
    clamp,
    rotate,
    rotateAround,
    angleDeg,
    angleFromPoints,
    Matrix,
    Vec2,

    // ---- line ----
    projectPointOnLine,
    PointLine,
    BezierLine,
    SplineInterpolator,
    quadraticSplineInput,

    // ---- canvas ----
    canvas: createCanvas,
    copyCanvas,
    drawTransformedImageOnCanvasDeprectated,
    drawTransformedImageOnCanvas,
    createCheckerCanvas,
    createCheckerDataUrl,
    resizeCanvas,
    convertToAlphaChannelCanvas,

    // ---- color ----
    HSV,
    RGB,
    CMYK,
    ColorConverter,
    testIsWhiteBestContrast,

    // ---- UI ----
    appendTextDiv,
    clearSelection,
    makeUnfocusable,
    el,
    destroyEl,


    // ---- events / input ----

    addEventListener: BBEventListener.addEventListener,
    removeEventListener: BBEventListener.removeEventListener,
    setEventListener: BBEventListener.setEventListener,

    KeyListener,
    PointerListener,

    EventChain,

};