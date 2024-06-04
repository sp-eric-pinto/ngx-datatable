import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
export class DataTableRowWrapperComponent {
    constructor(cd, differs) {
        this.cd = cd;
        this.differs = differs;
        this.rowContextmenu = new EventEmitter(false);
        this._expanded = false;
        this.groupContext = {
            group: this.row,
            expanded: this.expanded,
            rowIndex: this.rowIndex
        };
        this.rowContext = {
            row: this.row,
            expanded: this.expanded,
            rowIndex: this.rowIndex
        };
        this.rowDiffer = differs.find({}).create();
    }
    set rowIndex(val) {
        this._rowIndex = val;
        this.rowContext.rowIndex = val;
        this.groupContext.rowIndex = val;
        this.cd.markForCheck();
    }
    get rowIndex() {
        return this._rowIndex;
    }
    set expanded(val) {
        this._expanded = val;
        this.groupContext.expanded = val;
        this.rowContext.expanded = val;
        this.cd.markForCheck();
    }
    get expanded() {
        return this._expanded;
    }
    ngOnInit() {
        if (this.disableCheck) {
            const isRowDisabled = this.disableCheck(this.row);
            this.disable$ = new BehaviorSubject(isRowDisabled);
        }
        this.rowContext.disableRow$ = this.disable$;
    }
    ngDoCheck() {
        if (this.disableCheck) {
            const isRowDisabled = this.disableCheck(this.row);
            this.disable$.next(isRowDisabled);
            this.cd.markForCheck();
        }
        if (this.rowDiffer.diff(this.row)) {
            this.rowContext.row = this.row;
            this.groupContext.group = this.row;
            this.cd.markForCheck();
        }
    }
    onContextmenu($event) {
        this.rowContextmenu.emit({ event: $event, row: this.row });
    }
    getGroupHeaderStyle() {
        const styles = {};
        styles.transform = 'translate3d(' + this.offsetX + 'px, 0px, 0px)';
        styles['backface-visibility'] = 'hidden';
        styles.width = this.innerWidth;
        return styles;
    }
}
DataTableRowWrapperComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: DataTableRowWrapperComponent, deps: [{ token: i0.ChangeDetectorRef }, { token: i0.KeyValueDiffers }], target: i0.ɵɵFactoryTarget.Component });
DataTableRowWrapperComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: DataTableRowWrapperComponent, selector: "datatable-row-wrapper", inputs: { innerWidth: "innerWidth", rowDetail: "rowDetail", groupHeader: "groupHeader", offsetX: "offsetX", detailRowHeight: "detailRowHeight", row: "row", groupedRows: "groupedRows", disableCheck: "disableCheck", rowIndex: "rowIndex", expanded: "expanded" }, outputs: { rowContextmenu: "rowContextmenu" }, host: { listeners: { "contextmenu": "onContextmenu($event)" }, classAttribute: "datatable-row-wrapper" }, ngImport: i0, template: `
    <div *ngIf="groupHeader && groupHeader.template" class="datatable-group-header" [ngStyle]="getGroupHeaderStyle()">
      <ng-template
        *ngIf="groupHeader && groupHeader.template"
        [ngTemplateOutlet]="groupHeader.template"
        [ngTemplateOutletContext]="groupContext"
      >
      </ng-template>
    </div>
    <ng-content *ngIf="(groupHeader && groupHeader.template && expanded) || !groupHeader || !groupHeader.template">
    </ng-content>
    <div
      *ngIf="rowDetail && rowDetail.template && expanded"
      [style.height.px]="detailRowHeight"
      class="datatable-row-detail"
    >
      <ng-template
        *ngIf="rowDetail && rowDetail.template"
        [ngTemplateOutlet]="rowDetail.template"
        [ngTemplateOutletContext]="rowContext"
      >
      </ng-template>
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i1.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: DataTableRowWrapperComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'datatable-row-wrapper',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <div *ngIf="groupHeader && groupHeader.template" class="datatable-group-header" [ngStyle]="getGroupHeaderStyle()">
      <ng-template
        *ngIf="groupHeader && groupHeader.template"
        [ngTemplateOutlet]="groupHeader.template"
        [ngTemplateOutletContext]="groupContext"
      >
      </ng-template>
    </div>
    <ng-content *ngIf="(groupHeader && groupHeader.template && expanded) || !groupHeader || !groupHeader.template">
    </ng-content>
    <div
      *ngIf="rowDetail && rowDetail.template && expanded"
      [style.height.px]="detailRowHeight"
      class="datatable-row-detail"
    >
      <ng-template
        *ngIf="rowDetail && rowDetail.template"
        [ngTemplateOutlet]="rowDetail.template"
        [ngTemplateOutletContext]="rowContext"
      >
      </ng-template>
    </div>
  `,
                    host: {
                        class: 'datatable-row-wrapper'
                    }
                }]
        }], ctorParameters: function () { return [{ type: i0.ChangeDetectorRef }, { type: i0.KeyValueDiffers }]; }, propDecorators: { innerWidth: [{
                type: Input
            }], rowDetail: [{
                type: Input
            }], groupHeader: [{
                type: Input
            }], offsetX: [{
                type: Input
            }], detailRowHeight: [{
                type: Input
            }], row: [{
                type: Input
            }], groupedRows: [{
                type: Input
            }], disableCheck: [{
                type: Input
            }], rowContextmenu: [{
                type: Output
            }], rowIndex: [{
                type: Input
            }], expanded: [{
                type: Input
            }], onContextmenu: [{
                type: HostListener,
                args: ['contextmenu', ['$event']]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9keS1yb3ctd3JhcHBlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtZGF0YXRhYmxlL3NyYy9saWIvY29tcG9uZW50cy9ib2R5L2JvZHktcm93LXdyYXBwZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCx1QkFBdUIsRUFFdkIsU0FBUyxFQUVULFlBQVksRUFDWixZQUFZLEVBQ1osS0FBSyxFQUlMLE1BQU0sRUFDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7QUFpQ3ZDLE1BQU0sT0FBTyw0QkFBNEI7SUF5Q3ZDLFlBQW9CLEVBQXFCLEVBQVUsT0FBd0I7UUFBdkQsT0FBRSxHQUFGLEVBQUUsQ0FBbUI7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFpQjtRQWhDakUsbUJBQWMsR0FBRyxJQUFJLFlBQVksQ0FBa0MsS0FBSyxDQUFDLENBQUM7UUE2QjVFLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFJeEIsSUFBSSxDQUFDLFlBQVksR0FBRztZQUNsQixLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDZixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1NBQ3hCLENBQUM7UUFFRixJQUFJLENBQUMsVUFBVSxHQUFHO1lBQ2hCLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNiLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7U0FDeEIsQ0FBQztRQUVGLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUM3QyxDQUFDO0lBNUNELElBQWEsUUFBUSxDQUFDLEdBQVc7UUFDL0IsSUFBSSxD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LFNBQVM7c0JBQWpCLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFDRyxPQUFPO3NCQUFmLEtBQUs7Z0JBQ0csZUFBZTtzQkFBdkIsS0FBSztnQkFDRyxHQUFHO3NCQUFYLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFDRyxZQUFZO3NCQUFwQixLQUFLO2dCQUNJLGNBQWM7c0JBQXZCLE1BQU07Z0JBRU0sUUFBUTtzQkFBcEIsS0FBSztnQkFXTyxRQUFRO3NCQUFwQixLQUFLO2dCQXlETixhQUFhO3NCQURaLFlBQVk7dUJBQUMsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIERvQ2hlY2ssXG4gIEV2ZW50RW1pdHRlcixcbiAgSG9zdExpc3RlbmVyLFxuICBJbnB1dCxcbiAgS2V5VmFsdWVEaWZmZXIsXG4gIEtleVZhbHVlRGlmZmVycyxcbiAgT25Jbml0LFxuICBPdXRwdXRcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZGF0YXRhYmxlLXJvdy13cmFwcGVyJyxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdiAqbmdJZj1cImdyb3VwSGVhZGVyICYmIGdyb3VwSGVhZGVyLnRlbXBsYXRlXCIgY2xhc3M9XCJkYXRhdGFibGUtZ3JvdXAtaGVhZGVyXCIgW25nU3R5bGVdPVwiZ2V0R3JvdXBIZWFkZXJTdHlsZSgpXCI+XG4gICAgICA8bmctdGVtcGxhdGVcbiAgICAgICAgKm5nSWY9XCJncm91cEhlYWRlciAmJiBncm91cEhlYWRlci50ZW1wbGF0ZVwiXG4gICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0XT1cImdyb3VwSGVhZGVyLnRlbXBsYXRlXCJcbiAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cImdyb3VwQ29udGV4dFwiXG4gICAgICA+XG4gICAgICA8L25nLXRlbXBsYXRlPlxuICAgIDwvZGl2PlxuICAgIDxuZy1jb250ZW50ICpuZ0lmPVwiKGdyb3VwSGVhZGVyICYmIGdyb3VwSGVhZGVyLnRlbXBsYXRlICYmIGV4cGFuZGVkKSB8fCAhZ3JvdXBIZWFkZXIgfHwgIWdyb3VwSGVhZGVyLnRlbXBsYXRlXCI+XG4gICAgPC9uZy1jb250ZW50PlxuICAgIDxkaXZcbiAgICAgICpuZ0lmPVwicm93RGV0YWlsICYmIHJvd0RldGFpbC50ZW1wbGF0ZSAmJiBleHBhbmRlZFwiXG4gICAgICBbc3R5bGUuaGVpZ2h0LnB4XT1cImRldGFpbFJvd0hlaWdodFwiXG4gICAgICBjbGFzcz1cImRhdGF0YWJsZS1yb3ctZGV0YWlsXCJcbiAgICA+XG4gICAgICA8bmctdGVtcGxhdGVcbiAgICAgICAgKm5nSWY9XCJyb3dEZXRhaWwgJiYgcm93RGV0YWlsLnRlbXBsYXRlXCJcbiAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRdPVwicm93RGV0YWlsLnRlbXBsYXRlXCJcbiAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInJvd0NvbnRleHRcIlxuICAgICAgPlxuICAgICAgPC9uZy10ZW1wbGF0ZT5cbiAgICA8L2Rpdj5cbiAgYCxcbiAgaG9zdDoge1xuICAgIGNsYXNzOiAnZGF0YXRhYmxlLXJvdy13cmFwcGVyJ1xuICB9XG59KVxuZXhwb3J0IGNsYXNzIERhdGFUYWJsZVJvd1dyYXBwZXJDb21wb25lbnQgaW1wbGVtZW50cyBEb0NoZWNrLCBPbkluaXQge1xuICBASW5wdXQoKSBpbm5lcldpZHRoOiBudW1iZXI7XG4gIEBJbnB1dCgpIHJvd0RldGFpbDogYW55O1xuICBASW5wdXQoKSBncm91cEhlYWRlcjogYW55O1xuICBASW5wdXQoKSBvZmZzZXRYOiBudW1iZXI7XG4gIEBJbnB1dCgpIGRldGFpbFJvd0hlaWdodDogYW55O1xuICBASW5wdXQoKSByb3c6IGFueTtcbiAgQElucHV0KCkgZ3JvdXBlZFJvd3M6IGFueTtcbiAgQElucHV0KCkgZGlzYWJsZUNoZWNrOiAocm93OiBhbnkpID0+IGJvb2xlYW47XG4gIEBPdXRwdXQoKSByb3dDb250ZXh0bWVudSA9IG5ldyBFdmVudEVtaXR0ZXI8eyBldmVudDogTW91c2VFdmVudDsgcm93OiBhbnkgfT4oZmFsc2UpO1xuXG4gIEBJbnB1dCgpIHNldCByb3dJbmRleCh2YWw6IG51bWJlcikge1xuICAgIHRoaXMuX3Jvd0luZGV4ID0gdmFsO1xuICAgIHRoaXMucm93Q29udGV4dC5yb3dJbmRleCA9IHZhbDtcbiAgICB0aGlzLmdyb3VwQ29udGV4dC5yb3dJbmRleCA9IHZhbDtcbiAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgZ2V0IHJvd0luZGV4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3Jvd0luZGV4O1xuICB9XG5cbiAgQElucHV0KCkgc2V0IGV4cGFuZGVkKHZhbDogYm9vbGVhbikge1xuICAgIHRoaXMuX2V4cGFuZGVkID0gdmFsO1xuICAgIHRoaXMuZ3JvdXBDb250ZXh0LmV4cGFuZGVkID0gdmFsO1xuICAgIHRoaXMucm93Q29udGV4dC5leHBhbmRlZCA9IHZhbDtcbiAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgZ2V0IGV4cGFuZGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9leHBhbmRlZDtcbiAgfVxuXG4gIGdyb3VwQ29udGV4dDogYW55O1xuICByb3dDb250ZXh0OiBhbnk7XG4gIGRpc2FibGUkOiBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj47XG5cbiAgcHJpdmF0ZSByb3dEaWZmZXI6IEtleVZhbHVlRGlmZmVyPHVua25vd24sIHVua25vd24+O1xuICBwcml2YXRlIF9leHBhbmRlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9yb3dJbmRleDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY2Q6IENoYW5nZURldGVjdG9yUmVmLCBwcml2YXRlIGRpZmZlcnM6IEtleVZhbHVlRGlmZmVycykge1xuICAgIHRoaXMuZ3JvdXBDb250ZXh0ID0ge1xuICAgICAgZ3JvdXA6IHRoaXMucm93LFxuICAgICAgZXhwYW5kZWQ6IHRoaXMuZXhwYW5kZWQsXG4gICAgICByb3dJbmRleDogdGhpcy5yb3dJbmRleFxuICAgIH07XG5cbiAgICB0aGlzLnJvd0NvbnRleHQgPSB7XG4gICAgICByb3c6IHRoaXMucm93LFxuICAgICAgZXhwYW5kZWQ6IHRoaXMuZXhwYW5kZWQsXG4gICAgICByb3dJbmRleDogdGhpcy5yb3dJbmRleFxuICAgIH07XG5cbiAgICB0aGlzLnJvd0RpZmZlciA9IGRpZmZlcnMuZmluZCh7fSkuY3JlYXRlKCk7XG4gIH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5kaXNhYmxlQ2hlY2spIHtcbiAgICAgIGNvbnN0IGlzUm93RGlzYWJsZWQgPSB0aGlzLmRpc2FibGVDaGVjayh0aGlzLnJvdyk7XG4gICAgICB0aGlzLmRpc2FibGUkID0gbmV3IEJlaGF2aW9yU3ViamVjdChpc1Jvd0Rpc2FibGVkKTtcbiAgICB9XG4gICAgdGhpcy5yb3dDb250ZXh0LmRpc2FibGVSb3ckID0gdGhpcy5kaXNhYmxlJDtcbiAgfVxuXG4gIG5nRG9DaGVjaygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5kaXNhYmxlQ2hlY2spIHtcbiAgICAgIGNvbnN0IGlzUm93RGlzYWJsZWQgPSB0aGlzLmRpc2FibGVDaGVjayh0aGlzLnJvdyk7XG4gICAgICB0aGlzLmRpc2FibGUkLm5leHQoaXNSb3dEaXNhYmxlZCk7XG4gICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgICBpZiAodGhpcy5yb3dEaWZmZXIuZGlmZih0aGlzLnJvdykpIHtcbiAgICAgIHRoaXMucm93Q29udGV4dC5yb3cgPSB0aGlzLnJvdztcbiAgICAgIHRoaXMuZ3JvdXBDb250ZXh0Lmdyb3VwID0gdGhpcy5yb3c7XG4gICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgWyckZXZlbnQnXSlcbiAgb25Db250ZXh0bWVudSgkZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLnJvd0NvbnRleHRtZW51LmVtaXQoeyBldmVudDogJGV2ZW50LCByb3c6IHRoaXMucm93IH0pO1xuICB9XG5cbiAgZ2V0R3JvdXBIZWFkZXJTdHlsZSgpOiBhbnkge1xuICAgIGNvbnN0IHN0eWxlcyA9IHt9IGFzIGFueTtcblxuICAgIHN0eWxlcy50cmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoJyArIHRoaXMub2Zmc2V0WCArICdweCwgMHB4LCAwcHgpJztcbiAgICBzdHlsZXNbJ2JhY2tmYWNlLXZpc2liaWxpdHknXSA9ICdoaWRkZW4nO1xuICAgIHN0eWxlcy53aWR0aCA9IHRoaXMuaW5uZXJXaWR0aDtcblxuICAgIHJldHVybiBzdHlsZXM7XG4gIH1cbn1cbiJdfQ==