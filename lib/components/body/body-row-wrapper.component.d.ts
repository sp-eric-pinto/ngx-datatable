import { ChangeDetectorRef, DoCheck, EventEmitter, KeyValueDiffers, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as i0 from "@angular/core";
export declare class DataTableRowWrapperComponent implements DoCheck, OnInit {
    private cd;
    private differs;
    innerWidth: number;
    rowDetail: any;
    groupHeader: any;
    offsetX: number;
    detailRowHeight: any;
    row: any;
    groupedRows: any;
    disableCheck: (row: any) => boolean;
    rowContextmenu: EventEmitter<{
        event: MouseEvent;
        row: any;
    }>;
    set rowIndex(val: number);
    get rowIndex(): number;
    set expanded(val: boolean);
    get expanded(): boolean;
    groupContext: any;
    rowContext: any;
    disable$: BehaviorSubject<boolean>;
    private rowDiffer;
    private _expanded;
    private _rowIndex;
    constructor(cd: ChangeDetectorRef, differs: KeyValueDiffers);
    ngOnInit(): void;
    ngDoCheck(): void;
    onContextmenu($event: MouseEvent): void;
    getGroupHeaderStyle(): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<DataTableRowWrapperComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DataTableRowWrapperComponent, "datatable-row-wrapper", never, { "innerWidth": "innerWidth"; "rowDetail": "rowDetail"; "groupHeader": "groupHeader"; "offsetX": "offsetX"; "detailRowHeight": "detailRowHeight"; "row": "row"; "groupedRows": "groupedRows"; "disableCheck": "disableCheck"; "rowIndex": "rowIndex"; "expanded": "expanded"; }, { "rowContextmenu": "rowContextmenu"; }, never, ["*"], false, never>;
}
