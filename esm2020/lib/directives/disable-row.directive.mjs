import { Directive, Input } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Row Disable Directive
 * Use this to disable/enable all children elements
 * Usage:
 *  To disable
 * 		<div [disabled]="true" disable-row >
 * 		</div>
 *  To enable
 *  	<div [disabled]="false" disable-row >
 * 		</div>
 */
export class DisableRowDirective {
    constructor(element) {
        this.element = element;
        this._disabled = false;
    }
    set disabled(val) {
        this._disabled = val;
        if (val) {
            this.disableAllElements();
        }
    }
    ;
    get disabled() {
        return this._disabled;
    }
    disableAllElements() {
        const el = this.element?.nativeElement;
        if (!el) {
            return;
        }
        Array.from(el.querySelectorAll('*')).forEach(child => {
            child?.setAttribute('disabled', '');
        });
    }
}
DisableRowDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: DisableRowDirective, deps: [{ token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
DisableRowDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.10", type: DisableRowDirective, selector: "[disable-row]", inputs: { disabled: "disabled" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: DisableRowDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[disable-row]' }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }]; }, propDecorators: { disabled: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzYWJsZS1yb3cuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWRhdGF0YWJsZS9zcmMvbGliL2RpcmVjdGl2ZXMvZGlzYWJsZS1yb3cuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBb0IsU0FBUyxFQUFjLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFFL0U7Ozs7Ozs7Ozs7R0FVRztBQUVILE1BQU0sT0FBTyxtQkFBbUI7SUFjOUIsWUFBb0IsT0FBbUI7UUFBbkIsWUFBTyxHQUFQLE9BQU8sQ0FBWTtRQVovQixjQUFTLEdBQUcsS0FBSyxDQUFDO0lBWWdCLENBQUM7SUFYM0MsSUFBYSxRQUFRLENBQUMsR0FBWTtRQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztRQUNyQixJQUFJLEdBQUcsRUFBRTtZQUNQLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1NBQzNCO0lBQ0gsQ0FBQztJQUFBLENBQUM7SUFFRixJQUFJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQztJQUlELGtCQUFrQjtRQUNoQixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQztRQUN2QyxJQUFJLENBQUMsRUFBRSxFQUFFO1lBQ1AsT0FBTztTQUNSO1FBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFzQixDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3hFLEtBQUssRUFBRSxZQUFZLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7aUhBeEJVLG1CQUFtQjtxR0FBbkIsbUJBQW1COzRGQUFuQixtQkFBbUI7a0JBRC9CLFNBQVM7bUJBQUMsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFO2lHQUl6QixRQUFRO3NCQUFwQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJDb250ZW50SW5pdCwgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIFJvdyBEaXNhYmxlIERpcmVjdGl2ZVxuICogVXNlIHRoaXMgdG8gZGlzYWJsZS9lbmFibGUgYWxsIGNoaWxkcmVuIGVsZW1lbnRzXG4gKiBVc2FnZTpcbiAqICBUbyBkaXNhYmxlXG4gKiBcdFx0PGRpdiBbZGlzYWJsZWRdPVwidHJ1ZVwiIGRpc2FibGUtcm93ID5cbiAqIFx0XHQ8L2Rpdj5cbiAqICBUbyBlbmFibGVcbiAqICBcdDxkaXYgW2Rpc2FibGVkXT1cImZhbHNlXCIgZGlzYWJsZS1yb3cgPlxuICogXHRcdDwvZGl2PlxuICovXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbZGlzYWJsZS1yb3ddJyB9KVxuZXhwb3J0IGNsYXNzIERpc2FibGVSb3dEaXJlY3RpdmUge1xuXG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XG4gIEBJbnB1dCgpIHNldCBkaXNhYmxlZCh2YWw6IGJvb2xlYW4pe1xuICAgIHRoaXMuX2Rpc2FibGVkID0gdmFsO1xuICAgIGlmICh2YWwpIHtcbiAgICAgIHRoaXMuZGlzYWJsZUFsbEVsZW1lbnRzKCk7XG4gICAgfVxuICB9O1xuXG4gIGdldCBkaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQ7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6IEVsZW1lbnRSZWYpIHt9XG5cbiAgZGlzYWJsZUFsbEVsZW1lbnRzKCkge1xuICAgIGNvbnN0IGVsID0gdGhpcy5lbGVtZW50Py5uYXRpdmVFbGVtZW50O1xuICAgIGlmICghZWwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgQXJyYXkuZnJvbShlbC5xdWVyeVNlbGVjdG9yQWxsKCcqJykgYXMgSFRNTEFsbENvbGxlY3Rpb24pLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgY2hpbGQ/LnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnJyk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==