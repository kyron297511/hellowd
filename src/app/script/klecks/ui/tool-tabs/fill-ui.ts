import {BB} from '../../../bb/bb';
import {PcSlider} from '../base-components/slider';
import {Select} from '../base-components/select';
import {checkBox} from '../base-components/check-box';

/**
 * Paint Bucket tab contents (color slider, opacity slider, etc)
 *
 * p = {
 *     colorSlider: PcColorSlider// when opening tab, inserts it (snatches it from where else it was)
 * }
 *
 * @param p
 * @constructor
 */
export function FillUi(p) {
    let div = BB.el({
        css: {
            margin: '10px'
        }
    });
    let isVisible = true;

    let colorDiv = BB.el({
        parent: div,
        css: {
            marginBottom: '10px'
        }
    });

    let opacitySlider = new PcSlider({
        label: 'Opacity',
        width: 250,
        height: 30,
        min: 0,
        max: 1,
        initValue: 1,
        onChange: function (val) {
        },
        formatFunc: function(v) {
            return Math.round(v * 100);
        }
    });
    div.appendChild(opacitySlider.getElement());

    let toleranceSlider = new PcSlider({
        label: 'Tolerance',
        width: 250,
        height: 30,
        min: 0,
        max: 255,
        initValue: 255 / 100 * 20,
        onChange: function (val) {
        },
        formatFunc: function(v) {
            return Math.round(v / 255 * 100);
        }
    });
    BB.css(toleranceSlider.getElement(), {
        marginTop: '10px'
    });
    div.appendChild(toleranceSlider.getElement());

    let selectRow = BB.el({
        parent: div,
        css: {
            display: 'flex',
            marginTop: '10px'
        }
    });

    let modeWrapper;
    let modeSelect;
    modeWrapper = BB.el({
        content: 'Sample&nbsp;',
        css: {
            fontSize: '15px'
        }
    });
    modeSelect = new Select({
        optionArr: [
            ['all', 'All'],
            ['current', 'Active'],
            ['above', 'Above']
        ],
        initValue: 'all',
        onChange: function(val) {}
    });
    let modePointerListener = new BB.PointerListener({
        target: modeSelect.getElement(),
        onWheel: function(e) {
            modeSelect.setDeltaValue(e.deltaY);
        }
    });
    modeWrapper.appendChild(modeSelect.getElement());
    selectRow.appendChild(modeWrapper);

    let growWrapper;
    let growSelect;
    growWrapper = BB.el({
        content: 'Grow&nbsp;',
        css: {
            fontSize: '15px',
            marginLeft: '10px'
        }
    });
    growSelect = new Select({
        optionArr: [
            [0, '0'],
            [1, '1'],
            [2, '2'],
            [3, '3'],
            [4, '4'],
            [5, '5'],
            [6, '6'],
            [7, '7'],
        ],
        initValue: 0,
        onChange: function(val) {}
    });
    let growPointerListener = new BB.PointerListener({
        target: growSelect.getElement(),
        onWheel: function(e) {
            growSelect.setDeltaValue(e.deltaY);
        }
    });
    growWrapper.appendChild(growSelect.getElement());
    selectRow.appendChild(growWrapper);


    let isContiguous = true;
    let contiguousToggle = checkBox({
        init: true,
        label: 'Contiguous',
        callback: function (b) {
            isContiguous = b;
        }
    });
    contiguousToggle.style.marginTop = "10px";
    contiguousToggle.style.paddingRight = "5px";
    contiguousToggle.style.display = 'inline-block';
    div.appendChild(contiguousToggle);




    // --- interface ---

    this.getElement = function() {
        return div;
    };

    this.setIsVisible = function(pIsVisible) {
        isVisible = !!pIsVisible;
        div.style.display = isVisible ? 'block' : 'none';
        if(isVisible) {
            colorDiv.appendChild(p.colorSlider.getElement());
            colorDiv.appendChild(p.colorSlider.getOutputElement());
        }
    };

    this.getTolerance = function() {
        return toleranceSlider.getValue();
    };

    this.getOpacity = function() {
        return opacitySlider.getValue();
    };

    /**
     * returns string 'current' | 'all' | 'above'
     */
    this.getSample = function() {
        return modeSelect.getValue();
    };

    this.getGrow = function() {
        return parseInt(growSelect.getValue(), 10);
    }

    this.getContiguous = function() {
        return isContiguous;
    };

}