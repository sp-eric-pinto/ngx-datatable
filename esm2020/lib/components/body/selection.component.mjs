import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectionType } from '../../types/selection.type';
import { selectRows, selectRowsBetween } from '../../utils/selection';
import { Keys } from '../../utils/keys';
import * as i0 from "@angular/core";
export class DataTableSelectionComponent {
    constructor() {
        this.activate = new EventEmitter();
        this.select = new EventEmitter();
    }
    selectRow(event, index, row) {
        if (!this.selectEnabled) {
            return;
        }
        const chkbox = this.selectionType === SelectionType.checkbox;
        const multi = this.selectionType === SelectionType.multi;
        const multiClick = this.selectionType === SelectionType.multiClick;
        let selected = [];
        if (multi || chkbox || multiClick) {
            if (event.shiftKey) {
                selected = selectRowsBetween([], this.rows, index, this.prevIndex, this.getRowSelectedIdx.bind(this));
            }
            else if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
                // select all rows except dummy rows which are added for ghostloader in case of virtual scroll
                selected = this.rows.filter(rowItem => !!rowItem);
            }
            else if (event.ctrlKey || event.metaKey || multiClick || chkbox) {
                selected = selectRows([...this.selected], row, this.getRowSelectedIdx.bind(this));
            }
            else {
                selected = selectRows([], row, this.getRowSelectedIdx.bind(this));
            }
        }
        else {
            selected = selectRows([], row, this.getRowSelectedIdx.bind(this));
        }
        if (typeof this.selectCheck === 'function') {
            selected = selected.filter(this.selectCheck.bind(this));
        }
        if (typeof this.disableCheck === 'function') {
            selected = selected.filter(rowData => !this.disableCheck(rowData));
        }
        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);
        this.prevIndex = index;
        this.select.emit({
            selected
        });
    }
    onActivate(model, index) {
        const { type, event, row } = model;
        const chkbox = this.selectionType === SelectionType.checkbox;
        const select = (!chkbox && (type === 'click' || type === 'dblclick')) || (chkbox && type === 'checkbox');
        if (select) {
            this.selectRow(event, index, row);
        }
        else if (type === 'keydown') {
            if (event.keyCode === Keys.return) {
                this.selectRow(event, index, row);
            }
            else if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
                this.selectRow(event, 0, this.rows[this.rows.length - 1]);
            }
            else {
                this.onKeyboardFocus(model);
            }
        }
        this.activate.emit(model);
    }
    onKeyboardFocus(model) {
        const { keyCode } = model.event;
        const shouldFocus = keyCode === Keys.up || keyCode === Keys.down || keyCode === Keys.right || keyCode === Keys.left;
        if (shouldFocus) {
            const isCellSelection = this.selectionType === SelectionType.cell;
            if (typeof this.disableCheck === 'function') {
                const isRowDisabled = this.disableCheck(model.row);
                if (isRowDisabled) {
                    return;
                }
            }
            if (!model.cellElement || !isCellSelection) {
                this.focusRow(model.rowElement, keyCode);
            }
            else if (isCellSelection) {
                this.focusCell(model.cellElement, model.rowElement, keyCode, model.cellIndex);
            }
        }
    }
    focusRow(rowElement, keyCode) {
        const nextRowElement = this.getPrevNextRow(rowElement, keyCode);
        if (nextRowElement) {
            nextRowElement.focus();
        }
    }
    getPrevNextRow(rowElement, keyCode) {
        const parentElement = rowElement.parentElement;
        if (parentElement) {
            let focusElement;
            if (keyCode === Keys.up) {
                focusElement = parentElement.previousElementSibling;
            }
            else if (keyCode === Keys.down) {
                focusElement = parentElement.nextElementSibling;
            }
            if (focusElement && focusElement.children.length) {
                return focusElement.children[0];
            }
        }
    }
    focusCell(cellElement, rowElement, keyCode, cellIndex) {
        let nextCellElement;
        if (keyCode === Keys.left) {
            nextCellElement = cellElement.previousElementSibling;
        }
        else if (keyCode === Keys.right) {
            nextCellElement = cellElement.nextElementSibling;
        }
        else if (keyCode === Keys.up || keyCode === Keys.down) {
            const nextRowElement = this.getPrevNextRow(rowElement, keyCode);
            if (nextRowElement) {
                const children = nextRowElement.getElementsByClassName('datatable-body-cell');
                if (children.length) {
                    nextCellElement = children[cellIndex];
                }
            }
        }
        if (nextCellElement) {
            nextCellElement.focus();
        }
    }
    getRowSelected(row) {
        return this.getRowSelectedIdx(row, this.selected) > -1;
    }
    getRowSelectedIdx(row, selected) {
        if (!selected || !selected.length) {
            return -1;
        }
        const rowId = this.rowIdentity(row);
        return selected.findIndex(r => {
            const id = this.rowIdentity(r);
            return id === rowId;
        });
    }
}
DataTableSelectionComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: DataTableSelectionComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
DataTableSelectionComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: DataTableSelectionComponent, selector: "datatable-selection", inputs: { rows: "rows", selected: "selected", selectEnabled: "selectEnabled", selectionType: "selectionType", rowIdentity: "rowIdentity", selectCheck: "selectCheck", disableCheck: "disableCheck" }, outputs: { activate: "activate", select: "select" }, ngImport: i0, template: ` <ng-content></ng-content> `, isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: DataTableSelectionComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'datatable-selection',
                    template: ` <ng-content></ng-content> `,
                    changeDetection: ChangeDetectionStrategy.OnPush
                }]
        }], propDecorators: { rows: [{
                type: Input
            }], selected: [{
                type: Input
            }], selectEnabled: [{
                type: Input
            }], selectionType: [{
                type: Input
            }], rowIdentity: [{
                type: Input
            }], selectCheck: [{
                type: Input
            }], disableCheck: [{
                type: Input
            }], activate: [{
                type: Output
            }], select: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1kYXRhdGFibGUvc3JjL2xpYi9jb21wb25lbnRzL2JvZHkvc2VsZWN0aW9uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2hHLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdEUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGtCQUFrQixDQUFDOztBQWdCeEMsTUFBTSxPQUFPLDJCQUEyQjtJQUx4QztRQWNZLGFBQVEsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNqRCxXQUFNLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7S0F5STFEO0lBcklDLFNBQVMsQ0FBQyxLQUFpQyxFQUFFLEtBQWEsRUFBRSxHQUFRO1FBQ2xFLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQUMsT0FBTztTQUFDO1FBRWxDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLEtBQUssYUFBYSxDQUFDLFFBQVEsQ0FBQztRQUM3RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxLQUFLLGFBQWEsQ0FBQyxLQUFLLENBQUM7UUFDekQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsS0FBSyxhQUFhLENBQUMsVUFBVSxDQUFDO1FBQ25FLElBQUksUUFBUSxHQUFVLEVBQUUsQ0FBQztRQUV6QixJQUFJLEtBQUssSUFBSSxNQUFNLElBQUksVUFBVSxFQUFFO1lBQ2pDLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRTtn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SUFDTCxDQUFDOzt5SEFsSlUsMkJBQTJCOzZHQUEzQiwyQkFBMkIsc1RBSDVCLDZCQUE2Qjs0RkFHNUIsMkJBQTJCO2tCQUx2QyxTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxxQkFBcUI7b0JBQy9CLFFBQVEsRUFBRSw2QkFBNkI7b0JBQ3ZDLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2lCQUNoRDs4QkFFVSxJQUFJO3NCQUFaLEtBQUs7Z0JBQ0csUUFBUTtzQkFBaEIsS0FBSztnQkFDRyxhQUFhO3NCQUFyQixLQUFLO2dCQUNHLGFBQWE7c0JBQXJCLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFDRyxXQUFXO3NCQUFuQixLQUFLO2dCQUNHLFlBQVk7c0JBQXBCLEtBQUs7Z0JBRUksUUFBUTtzQkFBakIsTUFBTTtnQkFDRyxNQUFNO3NCQUFmLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ29tcG9uZW50LCBFdmVudEVtaXR0ZXIsIElucHV0LCBPdXRwdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFNlbGVjdGlvblR5cGUgfSBmcm9tICcuLi8uLi90eXBlcy9zZWxlY3Rpb24udHlwZSc7XG5pbXBvcnQgeyBzZWxlY3RSb3dzLCBzZWxlY3RSb3dzQmV0d2VlbiB9IGZyb20gJy4uLy4uL3V0aWxzL3NlbGVjdGlvbic7XG5pbXBvcnQgeyBLZXlzIH0gZnJvbSAnLi4vLi4vdXRpbHMva2V5cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTW9kZWwge1xuICB0eXBlOiBzdHJpbmc7XG4gIGV2ZW50OiBNb3VzZUV2ZW50IHwgS2V5Ym9hcmRFdmVudDtcbiAgcm93OiBhbnk7XG4gIHJvd0VsZW1lbnQ6IGFueTtcbiAgY2VsbEVsZW1lbnQ6IGFueTtcbiAgY2VsbEluZGV4OiBudW1iZXI7XG59XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2RhdGF0YWJsZS1zZWxlY3Rpb24nLFxuICB0ZW1wbGF0ZTogYCA8bmctY29udGVudD48L25nLWNvbnRlbnQ+IGAsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXG59KVxuZXhwb3J0IGNsYXNzIERhdGFUYWJsZVNlbGVjdGlvbkNvbXBvbmVudCB7XG4gIEBJbnB1dCgpIHJvd3M6IGFueVtdO1xuICBASW5wdXQoKSBzZWxlY3RlZDogYW55W107XG4gIEBJbnB1dCgpIHNlbGVjdEVuYWJsZWQ6IGJvb2xlYW47XG4gIEBJbnB1dCgpIHNlbGVjdGlvblR5cGU6IFNlbGVjdGlvblR5cGU7XG4gIEBJbnB1dCgpIHJvd0lkZW50aXR5OiBhbnk7XG4gIEBJbnB1dCgpIHNlbGVjdENoZWNrOiBhbnk7XG4gIEBJbnB1dCgpIGRpc2FibGVDaGVjazogYW55O1xuXG4gIEBPdXRwdXQoKSBhY3RpdmF0ZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBzZWxlY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIHByZXZJbmRleDogbnVtYmVyO1xuXG4gIHNlbGVjdFJvdyhldmVudDogS2V5Ym9hcmRFdmVudCB8IE1vdXNlRXZlbnQsIGluZGV4OiBudW1iZXIsIHJvdzogYW55KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnNlbGVjdEVuYWJsZWQpIHtyZXR1cm47fVxuXG4gICAgY29uc3QgY2hrYm94ID0gdGhpcy5zZWxlY3Rpb25UeXBlID09PSBTZWxlY3Rpb25UeXBlLmNoZWNrYm94O1xuICAgIGNvbnN0IG11bHRpID0gdGhpcy5zZWxlY3Rpb25UeXBlID09PSBTZWxlY3Rpb25UeXBlLm11bHRpO1xuICAgIGNvbnN0IG11bHRpQ2xpY2sgPSB0aGlzLnNlbGVjdGlvblR5cGUgPT09IFNlbGVjdGlvblR5cGUubXVsdGlDbGljaztcbiAgICBsZXQgc2VsZWN0ZWQ6IGFueVtdID0gW107XG5cbiAgICBpZiAobXVsdGkgfHwgY2hrYm94IHx8IG11bHRpQ2xpY2spIHtcbiAgICAgIGlmIChldmVudC5zaGlmdEtleSkge1xuICAgICAgICBzZWxlY3RlZCA9IHNlbGVjdFJvd3NCZXR3ZWVuKFtdLCB0aGlzLnJvd3MsIGluZGV4LCB0aGlzLnByZXZJbmRleCwgdGhpcy5nZXRSb3dTZWxlY3RlZElkeC5iaW5kKHRoaXMpKTtcbiAgICAgIH0gZWxzZSBpZiAoKGV2ZW50IGFzIEtleWJvYXJkRXZlbnQpLmtleSA9PT0gJ2EnICYmIChldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkpKSB7XG4gICAgICAgIC8vIHNlbGVjdCBhbGwgcm93cyBleGNlcHQgZHVtbXkgcm93cyB3aGljaCBhcmUgYWRkZWQgZm9yIGdob3N0bG9hZGVyIGluIGNhc2Ugb2YgdmlydHVhbCBzY3JvbGxcbiAgICAgICAgc2VsZWN0ZWQgPSB0aGlzLnJvd3MuZmlsdGVyKHJvd0l0ZW0gPT4gISFyb3dJdGVtKTtcbiAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5IHx8IG11bHRpQ2xpY2sgfHwgY2hrYm94KSB7XG4gICAgICAgIHNlbGVjdGVkID0gc2VsZWN0Um93cyhbLi4udGhpcy5zZWxlY3RlZF0sIHJvdywgdGhpcy5nZXRSb3dTZWxlY3RlZElkeC5iaW5kKHRoaXMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGVjdGVkID0gc2VsZWN0Um93cyhbXSwgcm93LCB0aGlzLmdldFJvd1NlbGVjdGVkSWR4LmJpbmQodGhpcykpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3RlZCA9IHNlbGVjdFJvd3MoW10sIHJvdywgdGhpcy5nZXRSb3dTZWxlY3RlZElkeC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHRoaXMuc2VsZWN0Q2hlY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHNlbGVjdGVkID0gc2VsZWN0ZWQuZmlsdGVyKHRoaXMuc2VsZWN0Q2hlY2suYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLmRpc2FibGVDaGVjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgc2VsZWN0ZWQgPSBzZWxlY3RlZC5maWx0ZXIocm93RGF0YSA9PiAhdGhpcy5kaXNhYmxlQ2hlY2socm93RGF0YSkpO1xuICAgIH1cblxuICAgIHRoaXMuc2VsZWN0ZWQuc3BsaWNlKDAsIHRoaXMuc2VsZWN0ZWQubGVuZ3RoKTtcbiAgICB0aGlzLnNlbGVjdGVkLnB1c2goLi4uc2VsZWN0ZWQpO1xuXG4gICAgdGhpcy5wcmV2SW5kZXggPSBpbmRleDtcblxuICAgIHRoaXMuc2VsZWN0LmVtaXQoe1xuICAgICAgc2VsZWN0ZWRcbiAgICB9KTtcbiAgfVxuXG4gIG9uQWN0aXZhdGUobW9kZWw6IE1vZGVsLCBpbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgeyB0eXBlLCBldmVudCwgcm93IH0gPSBtb2RlbDtcbiAgICBjb25zdCBjaGtib3ggPSB0aGlzLnNlbGVjdGlvblR5cGUgPT09IFNlbGVjdGlvblR5cGUuY2hlY2tib3g7XG4gICAgY29uc3Qgc2VsZWN0ID0gKCFjaGtib3ggJiYgKHR5cGUgPT09ICdjbGljaycgfHwgdHlwZSA9PT0gJ2RibGNsaWNrJykpIHx8IChjaGtib3ggJiYgdHlwZSA9PT0gJ2NoZWNrYm94Jyk7XG5cbiAgICBpZiAoc2VsZWN0KSB7XG4gICAgICB0aGlzLnNlbGVjdFJvdyhldmVudCwgaW5kZXgsIHJvdyk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAna2V5ZG93bicpIHtcbiAgICAgIGlmICgoZXZlbnQgYXMgS2V5Ym9hcmRFdmVudCkua2V5Q29kZSA9PT0gS2V5cy5yZXR1cm4pIHtcbiAgICAgICAgdGhpcy5zZWxlY3RSb3coZXZlbnQsIGluZGV4LCByb3cpO1xuICAgICAgfSBlbHNlIGlmICgoZXZlbnQgYXMgS2V5Ym9hcmRFdmVudCkua2V5ID09PSAnYScgJiYgKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSkpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RSb3coZXZlbnQsIDAsIHRoaXMucm93c1t0aGlzLnJvd3MubGVuZ3RoIC0gMV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5vbktleWJvYXJkRm9jdXMobW9kZWwpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmFjdGl2YXRlLmVtaXQobW9kZWwpO1xuICB9XG5cbiAgb25LZXlib2FyZEZvY3VzKG1vZGVsOiBNb2RlbCk6IHZvaWQge1xuICAgIGNvbnN0IHsga2V5Q29kZSB9ID0gbW9kZWwuZXZlbnQgYXMgS2V5Ym9hcmRFdmVudDtcbiAgICBjb25zdCBzaG91bGRGb2N1cyA9IGtleUNvZGUgPT09IEtleXMudXAgfHwga2V5Q29kZSA9PT0gS2V5cy5kb3duIHx8IGtleUNvZGUgPT09IEtleXMucmlnaHQgfHwga2V5Q29kZSA9PT0gS2V5cy5sZWZ0O1xuXG4gICAgaWYgKHNob3VsZEZvY3VzKSB7XG4gICAgICBjb25zdCBpc0NlbGxTZWxlY3Rpb24gPSB0aGlzLnNlbGVjdGlvblR5cGUgPT09IFNlbGVjdGlvblR5cGUuY2VsbDtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5kaXNhYmxlQ2hlY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29uc3QgaXNSb3dEaXNhYmxlZCA9IHRoaXMuZGlzYWJsZUNoZWNrKG1vZGVsLnJvdyk7XG4gICAgICAgIGlmIChpc1Jvd0Rpc2FibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIW1vZGVsLmNlbGxFbGVtZW50IHx8ICFpc0NlbGxTZWxlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5mb2N1c1Jvdyhtb2RlbC5yb3dFbGVtZW50LCBrZXlDb2RlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNDZWxsU2VsZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuZm9jdXNDZWxsKG1vZGVsLmNlbGxFbGVtZW50LCBtb2RlbC5yb3dFbGVtZW50LCBrZXlDb2RlLCBtb2RlbC5jZWxsSW5kZXgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvY3VzUm93KHJvd0VsZW1lbnQ6IGFueSwga2V5Q29kZTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgbmV4dFJvd0VsZW1lbnQgPSB0aGlzLmdldFByZXZOZXh0Um93KHJvd0VsZW1lbnQsIGtleUNvZGUpO1xuICAgIGlmIChuZXh0Um93RWxlbWVudCkge25leHRSb3dFbGVtZW50LmZvY3VzKCk7fVxuICB9XG5cbiAgZ2V0UHJldk5leHRSb3cocm93RWxlbWVudDogYW55LCBrZXlDb2RlOiBudW1iZXIpOiBhbnkge1xuICAgIGNvbnN0IHBhcmVudEVsZW1lbnQgPSByb3dFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG5cbiAgICBpZiAocGFyZW50RWxlbWVudCkge1xuICAgICAgbGV0IGZvY3VzRWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gICAgICBpZiAoa2V5Q29kZSA9PT0gS2V5cy51cCkge1xuICAgICAgICBmb2N1c0VsZW1lbnQgPSBwYXJlbnRFbGVtZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgICB9IGVsc2UgaWYgKGtleUNvZGUgPT09IEtleXMuZG93bikge1xuICAgICAgICBmb2N1c0VsZW1lbnQgPSBwYXJlbnRFbGVtZW50Lm5leHRFbGVtZW50U2libGluZztcbiAgICAgIH1cblxuICAgICAgaWYgKGZvY3VzRWxlbWVudCAmJiBmb2N1c0VsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmb2N1c0VsZW1lbnQuY2hpbGRyZW5bMF07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9jdXNDZWxsKGNlbGxFbGVtZW50OiBhbnksIHJvd0VsZW1lbnQ6IGFueSwga2V5Q29kZTogbnVtYmVyLCBjZWxsSW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIGxldCBuZXh0Q2VsbEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuXG4gICAgaWYgKGtleUNvZGUgPT09IEtleXMubGVmdCkge1xuICAgICAgbmV4dENlbGxFbGVtZW50ID0gY2VsbEVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICB9IGVsc2UgaWYgKGtleUNvZGUgPT09IEtleXMucmlnaHQpIHtcbiAgICAgIG5leHRDZWxsRWxlbWVudCA9IGNlbGxFbGVtZW50Lm5leHRFbGVtZW50U2libGluZztcbiAgICB9IGVsc2UgaWYgKGtleUNvZGUgPT09IEtleXMudXAgfHwga2V5Q29kZSA9PT0gS2V5cy5kb3duKSB7XG4gICAgICBjb25zdCBuZXh0Um93RWxlbWVudCA9IHRoaXMuZ2V0UHJldk5leHRSb3cocm93RWxlbWVudCwga2V5Q29kZSk7XG4gICAgICBpZiAobmV4dFJvd0VsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBuZXh0Um93RWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdkYXRhdGFibGUtYm9keS1jZWxsJyk7XG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGgpIHtuZXh0Q2VsbEVsZW1lbnQgPSBjaGlsZHJlbltjZWxsSW5kZXhdO31cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobmV4dENlbGxFbGVtZW50KSB7bmV4dENlbGxFbGVtZW50LmZvY3VzKCk7fVxuICB9XG5cbiAgZ2V0Um93U2VsZWN0ZWQocm93OiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXRSb3dTZWxlY3RlZElkeChyb3csIHRoaXMuc2VsZWN0ZWQpID4gLTE7XG4gIH1cblxuICBnZXRSb3dTZWxlY3RlZElkeChyb3c6IGFueSwgc2VsZWN0ZWQ6IGFueVtdKTogbnVtYmVyIHtcbiAgICBpZiAoIXNlbGVjdGVkIHx8ICFzZWxlY3RlZC5sZW5ndGgpIHtyZXR1cm4gLTE7fVxuXG4gICAgY29uc3Qgcm93SWQgPSB0aGlzLnJvd0lkZW50aXR5KHJvdyk7XG4gICAgcmV0dXJuIHNlbGVjdGVkLmZpbmRJbmRleChyID0+IHtcbiAgICAgIGNvbnN0IGlkID0gdGhpcy5yb3dJZGVudGl0eShyKTtcbiAgICAgIHJldHVybiBpZCA9PT0gcm93SWQ7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==