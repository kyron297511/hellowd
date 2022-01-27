import {BB} from '../../../bb/bb';

export class RadioList {

    el: HTMLDivElement;
    inputs: HTMLInputElement[] = [];

    constructor(p: {
        name: string;
        init?: string;
        items: {
            label: string;
            value: string;
        }[]
    }) {
        this.el = BB.el({
            className: 'kl-radio'
        }) as HTMLDivElement;

        p.items.forEach(item => {
            let label = BB.el({
                tagName: 'label'
            });
            let input = BB.el({
                tagName: 'input',
                parent: label,
                custom: {
                    name: p.name,
                    value: item.value,
                    type: 'radio',
                }
            }) as HTMLInputElement;
            if (p.init === item.value) {
                input.checked = true;
            }
            label.append(item.label);
            this.el.append(label);
            this.inputs.push(input);
        });
    }


    getValue(): string {
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].checked) {
                return this.inputs[i].value;
            }
        }
        return null;
    }

    getElement() {
        return this.el;
    }

}