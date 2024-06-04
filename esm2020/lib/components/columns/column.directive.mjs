import { ContentChild, Directive, Input, TemplateRef } from '@angular/core';
import { DataTableColumnHeaderDirective } from './column-header.directive';
import { DataTableColumnCellDirective } from './column-cell.directive';
import { DataTableColumnCellTreeToggle } from './tree.directive';
import { DataTableColumnGhostCellDirective } from './column-ghost-cell.directive';
import * as i0 from "@angular/core";
import * as i1 from "../../services/column-changes.service";
export class DataTableColumnDirective {
    constructor(columnChangesService) {
        this.columnChangesService = columnChangesService;
        this.isFirstChange = true;
    }
    get cellTemplate() {
        return this._cellTemplateInput || this._cellTemplateQuery;
    }
    get headerTemplate() {
        return this._headerTemplateInput || this._headerTemplateQuery;
    }
    get treeToggleTemplate() {
        return this._treeToggleTemplateInput || this._treeToggleTemplateQuery;
    }
    get ghostCellTemplate() {
        return this._ghostCellTemplateInput || this._ghostCellTemplateQuery;
    }
    ngOnChanges() {
        if (this.isFirstChange) {
            this.isFirstChange = false;
        }
        else {
            this.columnChangesService.onInputChange();
        }
    }
}
DataTableColumnDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: DataTableColumnDirective, deps: [{ token: i1.ColumnChangesService }], target: i0.ɵɵFactoryTarget.Directive });
DataTableColumnDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.10", type: DataTableColumnDirective, selector: "ngx-datatable-column", inputs: { name: "name", prop: "prop", frozenLeft: "frozenLeft", frozenRight: "frozenRight", flexGrow: "flexGrow", resizeable: "resizeable", comparator: "comparator", pipe: "pipe", sortable: "sortable", draggable: "draggable", canAutoResize: "canAutoResize", minWidth: "minWidth", width: "width", maxWidth: "maxWidth", checkboxable: "checkboxable", headerCheckboxable: "headerCheckboxable", headerClass: "headerClass", cellClass: "cellClass", isTreeColumn: "isTreeColumn", treeLevelIndent: "treeLevelIndent", summaryFunc: "summaryFunc", summaryTemplate: "summaryTemplate", _cellTemplateInput: ["cellTemplate", "_cellTemplateInput"], _headerTemplateInput: ["headerTemplate", "_headerTemplateInput"], _treeToggleTemplateInput: ["treeToggleTemplate", "_treeToggleTemplateInput"], _ghostCellTemplateInput: ["ghostCellTemplate", "_ghostCellTemplateInput"] }, queries: [{ propertyName: "_cellTemplateQuery", first: true, predicate: DataTableColumnCellDirective, descendants: true, read: TemplateRef, static: true }, { propertyName: "_headerTemplateQuery", first: true, predicate: DataTableColumnHeaderDirective, descendants: true, read: TemplateRef, static: true }, { propertyName: "_treeToggleTemplateQuery", first: true, predicate: DataTableColumnCellTreeToggle, descendants: true, read: TemplateRef, static: true }, { propertyName: "_ghostCellTemplateQuery", first: true, predicate: DataTableColumnGhostCellDirective, descendants: true, read: TemplateRef, static: true }], usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: DataTableColumnDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'ngx-datatable-column' }]
        }], ctorParameters: function () { return [{ type: i1.ColumnChangesService }]; }, propDecorators: { name: [{
                type: Input
            }], prop: [{
                type: Input
            }], frozenLeft: [{
                type: Input
            }], frozenRight: [{
                type: Input
            }], flexGrow: [{
                type: Input
            }], resizeable: [{
                type: Input
            }], comparator: [{
                type: Input
            }], pipe: [{
                type: Input
            }], sortable: [{
                type: Input
            }], draggable: [{
                type: Input
            }], canAutoResize: [{
                type: Input
            }], minWidth: [{
                type: Input
            }], width: [{
                type: Input
            }], maxWidth: [{
                type: Input
            }], checkboxable: [{
                type: Input
            }], headerCheckboxable: [{
                type: Input
            }], headerClass: [{
                type: Input
            }], cellClass: [{
                type: Input
            }], isTreeColumn: [{
                type: Input
            }], treeLevelIndent: [{
                type: Input
            }], summaryFunc: [{
                type: Input
            }], summaryTemplate: [{
                type: Input
            }], _cellTemplateInput: [{
                type: Input,
                args: ['cellTemplate']
            }], _cellTemplateQuery: [{
                type: ContentChild,
                args: [DataTableColumnCellDirective, { read: TemplateRef, static: true }]
            }], _headerTemplateInput: [{
                type: Input,
                args: ['headerTemplate']
            }], _headerTemplateQuery: [{
                type: ContentChild,
                args: [DataTableColumnHeaderDirective, { read: TemplateRef, static: true }]
            }], _treeToggleTemplateInput: [{
                type: Input,
                args: ['treeToggleTemplate']
            }], _treeToggleTemplateQuery: [{
                type: ContentChild,
                args: [DataTableColumnCellTreeToggle, { read: TemplateRef, static: true }]
            }], _ghostCellTemplateInput: [{
                type: Input,
                args: ['ghostCellTemplate']
            }], _ghostCellTemplateQuery: [{
                type: ContentChild,
                args: [DataTableColumnGhostCellDirective, { read: TemplateRef, static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1uLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1kYXRhdGFibGUvc3JjL2xpYi9jb21wb25lbnRzL2NvbHVtbnMvY29sdW1uLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQTRCLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN0RyxPQUFPLEVBQUUsOEJBQThCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMzRSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN2RSxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUdqRSxPQUFPLEVBQUUsaUNBQWlDLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQzs7O0FBR2xGLE1BQU0sT0FBTyx3QkFBd0I7SUFrRW5DLFlBQW9CLG9CQUEwQztRQUExQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBRnRELGtCQUFhLEdBQUcsSUFBSSxDQUFDO0lBRW9DLENBQUM7SUFwQ2xFLElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztJQUM1RCxDQUFDO0lBUUQsSUFBSSxjQUFjO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztJQUNoRSxDQUFDO0lBUUQsSUFBSSxrQkFBa0I7UUFDcEIsT0FBTyxJQUFJLENBQUMsd0JBQXdCLElBQUksSUFBSSxDQUFDLHdCQUF3QixDQUFDO0lBQ3hFLENBQUM7SUFRRCxJQUFJLGlCQUFpQjtRQUNuQixPQUFPLElBQUksQ0FBQyx1QkFBdUIsSUFBSSxJQUFJLENBQUMsdUJBQXVCLENBQUM7SUFDdEUsQ0FBQztJQU1ELFdBQVc7UUFDVCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7U0FDNUI7YUFBTTtZQUNMLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUMzQztJQUNILENBQUM7O3NIQTFFVSx3QkFBd0I7MEdBQXhCLHdCQUF3QixpOEJBMkJyQiw0QkFBNEIsMkJBQVUsV0FBVyxrRkFVakQsOEJBQThCLDJCQUFVLFdBQVcsc0ZBVW5ELDZCQUE2QiwyQkFBVSxXQUFXLHFGQVVsRCxpQ0FBaUMsMkJBQVUsV0FBVzs0RkF6RHpELHdCQUF3QjtrQkFEcEMsU0FBUzttQkFBQyxFQUFFLFFBQVEsRUFBRSxzQkFBc0IsRUFBRTsyR0FFcEMsSUFBSTtzQkFBWixLQUFLO2dCQUNHLElBQUk7c0JBQVosS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csUUFBUTtzQkFBaEIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0csSUFBSTtzQkFBWixLQUFLO2dCQUNHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBQ0csU0FBUztzQkFBakIsS0FBSztnQkFDRyxhQUFhO3NCQUFyQixLQUFLO2dCQUNHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBQ0csS0FBSztzQkFBYixLQUFLO2dCQUNHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBQ0csWUFBWTtzQkFBcEIsS0FBSztnQkFDRyxrQkFBa0I7c0JBQTFCLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFDRyxTQUFTO3NCQUFqQixLQUFLO2dCQUNHLFlBQVk7c0JBQXBCLEtBQUs7Z0JBQ0csZUFBZTtzQkFBdkIsS0FBSztnQkFDRyxXQUFXO3NCQUFuQixLQUFLO2dCQUNHLGVBQWU7c0JBQXZCLEtBQUs7Z0JBR0osa0JBQWtCO3NCQURuQixLQUFLO3VCQUFDLGNBQWM7Z0JBSW5CLGtCQUFrQjtzQkFEbkIsWUFBWTt1QkFBQyw0QkFBNEIsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtnQkFRN0Usb0JBQW9CO3NCQURyQixLQUFLO3VCQUFDLGdCQUFnQjtnQkFJckIsb0JBQW9CO3NCQURyQixZQUFZO3VCQUFDLDhCQUE4QixFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO2dCQVEvRSx3QkFBd0I7c0JBRHpCLEtBQUs7dUJBQUMsb0JBQW9CO2dCQUl6Qix3QkFBd0I7c0JBRHpCLFlBQVk7dUJBQUMsNkJBQTZCLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7Z0JBUTlFLHVCQUF1QjtzQkFEeEIsS0FBSzt1QkFBQyxtQkFBbUI7Z0JBSXhCLHVCQUF1QjtzQkFEeEIsWUFBWTt1QkFBQyxpQ0FBaUMsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnRlbnRDaGlsZCwgRGlyZWN0aXZlLCBJbnB1dCwgT25DaGFuZ2VzLCBTaW1wbGVDaGFuZ2VzLCBUZW1wbGF0ZVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRGF0YVRhYmxlQ29sdW1uSGVhZGVyRGlyZWN0aXZlIH0gZnJvbSAnLi9jb2x1bW4taGVhZGVyLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBEYXRhVGFibGVDb2x1bW5DZWxsRGlyZWN0aXZlIH0gZnJvbSAnLi9jb2x1bW4tY2VsbC5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgRGF0YVRhYmxlQ29sdW1uQ2VsbFRyZWVUb2dnbGUgfSBmcm9tICcuL3RyZWUuZGlyZWN0aXZlJztcbmltcG9ydCB7IENvbHVtbkNoYW5nZXNTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvY29sdW1uLWNoYW5nZXMuc2VydmljZSc7XG5pbXBvcnQgeyBUYWJsZUNvbHVtblByb3AgfSBmcm9tICcuLi8uLi90eXBlcy90YWJsZS1jb2x1bW4udHlwZSc7XG5pbXBvcnQgeyBEYXRhVGFibGVDb2x1bW5HaG9zdENlbGxEaXJlY3RpdmUgfSBmcm9tICcuL2NvbHVtbi1naG9zdC1jZWxsLmRpcmVjdGl2ZSc7XG5cbkBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ25neC1kYXRhdGFibGUtY29sdW1uJyB9KVxuZXhwb3J0IGNsYXNzIERhdGFUYWJsZUNvbHVtbkRpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIEBJbnB1dCgpIG5hbWU6IHN0cmluZztcbiAgQElucHV0KCkgcHJvcDogVGFibGVDb2x1bW5Qcm9wO1xuICBASW5wdXQoKSBmcm96ZW5MZWZ0OiBhbnk7XG4gIEBJbnB1dCgpIGZyb3plblJpZ2h0OiBhbnk7XG4gIEBJbnB1dCgpIGZsZXhHcm93OiBudW1iZXI7XG4gIEBJbnB1dCgpIHJlc2l6ZWFibGU6IGJvb2xlYW47XG4gIEBJbnB1dCgpIGNvbXBhcmF0b3I6IGFueTtcbiAgQElucHV0KCkgcGlwZTogYW55O1xuICBASW5wdXQoKSBzb3J0YWJsZTogYm9vbGVhbjtcbiAgQElucHV0KCkgZHJhZ2dhYmxlOiBib29sZWFuO1xuICBASW5wdXQoKSBjYW5BdXRvUmVzaXplOiBib29sZWFuO1xuICBASW5wdXQoKSBtaW5XaWR0aDogbnVtYmVyO1xuICBASW5wdXQoKSB3aWR0aDogbnVtYmVyO1xuICBASW5wdXQoKSBtYXhXaWR0aDogbnVtYmVyO1xuICBASW5wdXQoKSBjaGVja2JveGFibGU6IGJvb2xlYW47XG4gIEBJbnB1dCgpIGhlYWRlckNoZWNrYm94YWJsZTogYm9vbGVhbjtcbiAgQElucHV0KCkgaGVhZGVyQ2xhc3M6IHN0cmluZyB8ICgoZGF0YTogYW55KSA9PiBzdHJpbmcgfCBhbnkpO1xuICBASW5wdXQoKSBjZWxsQ2xhc3M6IHN0cmluZyB8ICgoZGF0YTogYW55KSA9PiBzdHJpbmcgfCBhbnkpO1xuICBASW5wdXQoKSBpc1RyZWVDb2x1bW46IGJvb2xlYW47XG4gIEBJbnB1dCgpIHRyZWVMZXZlbEluZGVudDogbnVtYmVyO1xuICBASW5wdXQoKSBzdW1tYXJ5RnVuYzogKGNlbGxzOiBhbnlbXSkgPT4gYW55O1xuICBASW5wdXQoKSBzdW1tYXJ5VGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgQElucHV0KCdjZWxsVGVtcGxhdGUnKVxuICAgIF9jZWxsVGVtcGxhdGVJbnB1dDogVGVtcGxhdGVSZWY8YW55PjtcblxuICBAQ29udGVudENoaWxkKERhdGFUYWJsZUNvbHVtbkNlbGxEaXJlY3RpdmUsIHsgcmVhZDogVGVtcGxhdGVSZWYsIHN0YXRpYzogdHJ1ZSB9KVxuICAgIF9jZWxsVGVtcGxhdGVRdWVyeTogVGVtcGxhdGVSZWY8YW55PjtcblxuICBnZXQgY2VsbFRlbXBsYXRlKCk6IFRlbXBsYXRlUmVmPGFueT4ge1xuICAgIHJldHVybiB0aGlzLl9jZWxsVGVtcGxhdGVJbnB1dCB8fCB0aGlzLl9jZWxsVGVtcGxhdGVRdWVyeTtcbiAgfVxuXG4gIEBJbnB1dCgnaGVhZGVyVGVtcGxhdGUnKVxuICAgIF9oZWFkZXJUZW1wbGF0ZUlucHV0OiBUZW1wbGF0ZVJlZjxhbnk+O1xuXG4gIEBDb250ZW50Q2hpbGQoRGF0YVRhYmxlQ29sdW1uSGVhZGVyRGlyZWN0aXZlLCB7IHJlYWQ6IFRlbXBsYXRlUmVmLCBzdGF0aWM6IHRydWUgfSlcbiAgICBfaGVhZGVyVGVtcGxhdGVRdWVyeTogVGVtcGxhdGVSZWY8YW55PjtcblxuICBnZXQgaGVhZGVyVGVtcGxhdGUoKTogVGVtcGxhdGVSZWY8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuX2hlYWRlclRlbXBsYXRlSW5wdXQgfHwgdGhpcy5faGVhZGVyVGVtcGxhdGVRdWVyeTtcbiAgfVxuXG4gIEBJbnB1dCgndHJlZVRvZ2dsZVRlbXBsYXRlJylcbiAgICBfdHJlZVRvZ2dsZVRlbXBsYXRlSW5wdXQ6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgQENvbnRlbnRDaGlsZChEYXRhVGFibGVDb2x1bW5DZWxsVHJlZVRvZ2dsZSwgeyByZWFkOiBUZW1wbGF0ZVJlZiwgc3RhdGljOiB0cnVlIH0pXG4gICAgX3RyZWVUb2dnbGVUZW1wbGF0ZVF1ZXJ5OiBUZW1wbGF0ZVJlZjxhbnk+O1xuXG4gIGdldCB0cmVlVG9nZ2xlVGVtcGxhdGUoKTogVGVtcGxhdGVSZWY8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuX3RyZWVUb2dnbGVUZW1wbGF0ZUlucHV0IHx8IHRoaXMuX3RyZWVUb2dnbGVUZW1wbGF0ZVF1ZXJ5O1xuICB9XG5cbiAgQElucHV0KCdnaG9zdENlbGxUZW1wbGF0ZScpXG4gICAgX2dob3N0Q2VsbFRlbXBsYXRlSW5wdXQ6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgQENvbnRlbnRDaGlsZChEYXRhVGFibGVDb2x1bW5HaG9zdENlbGxEaXJlY3RpdmUsIHsgcmVhZDogVGVtcGxhdGVSZWYsIHN0YXRpYzogdHJ1ZSB9KVxuICAgIF9naG9zdENlbGxUZW1wbGF0ZVF1ZXJ5OiBUZW1wbGF0ZVJlZjxhbnk+O1xuXG4gIGdldCBnaG9zdENlbGxUZW1wbGF0ZSgpOiBUZW1wbGF0ZVJlZjxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5fZ2hvc3RDZWxsVGVtcGxhdGVJbnB1dCB8fCB0aGlzLl9naG9zdENlbGxUZW1wbGF0ZVF1ZXJ5O1xuICB9XG5cbiAgcHJpdmF0ZSBpc0ZpcnN0Q2hhbmdlID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNvbHVtbkNoYW5nZXNTZXJ2aWNlOiBDb2x1bW5DaGFuZ2VzU2VydmljZSkge31cblxuICBuZ09uQ2hhbmdlcygpIHtcbiAgICBpZiAodGhpcy5pc0ZpcnN0Q2hhbmdlKSB7XG4gICAgICB0aGlzLmlzRmlyc3RDaGFuZ2UgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb2x1bW5DaGFuZ2VzU2VydmljZS5vbklucHV0Q2hhbmdlKCk7XG4gICAgfVxuICB9XG59XG4iXX0=