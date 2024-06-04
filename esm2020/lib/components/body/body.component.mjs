import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output, ViewChild } from '@angular/core';
import { ScrollerComponent } from './scroller.component';
import { columnGroupWidths, columnsByPin } from '../../utils/column';
import { RowHeightCache } from '../../utils/row-height-cache';
import { translateXY } from '../../utils/translate';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "../../directives/draggable.directive";
import * as i3 from "./scroller.component";
import * as i4 from "./progress-bar.component";
import * as i5 from "./body-row.component";
import * as i6 from "./body-row-wrapper.component";
import * as i7 from "./selection.component";
import * as i8 from "./summary/summary-row.component";
import * as i9 from "./ghost-loader/ghost-loader.component";
export class DataTableBodyComponent {
    /**
     * Creates an instance of DataTableBodyComponent.
     */
    constructor(cd) {
        this.cd = cd;
        this.selected = [];
        this.scroll = new EventEmitter();
        this.page = new EventEmitter();
        this.activate = new EventEmitter();
        this.select = new EventEmitter();
        this.detailToggle = new EventEmitter();
        this.rowContextmenu = new EventEmitter(false);
        this.treeAction = new EventEmitter();
        this.rowHeightsCache = new RowHeightCache();
        this.temp = [];
        this.offsetY = 0;
        this.indexes = {};
        this.rowIndexes = new WeakMap();
        this.rowExpansions = [];
        this._offsetEvent = -1;
        /**
         * Get the height of the detail row.
         */
        this.getDetailRowHeight = (row, index) => {
            if (!this.rowDetail) {
                return 0;
            }
            const rowHeight = this.rowDetail.rowHeight;
            return typeof rowHeight === 'function' ? rowHeight(row, index) : rowHeight;
        };
        // declare fn here so we can get access to the `this` property
        this.rowTrackingFn = (index, row) => {
            const idx = this.getRowIndex(row);
            if (this.trackByProp) {
                return row[this.trackByProp];
            }
            else {
                return idx;
            }
        };
    }
    set ghostLoadingIndicator(val) {
        this._ghostLoadingIndicator = val;
        if (!val) {
            // remove placeholder rows once ghostloading is set to false
            this.temp = this.temp.filter(item => !!item);
        }
    }
    ;
    get ghostLoadingIndicator() {
        return this._ghostLoadingIndicator;
    }
    set pageSize(val) {
        if (val !== this._pageSize) {
            this._pageSize = val;
            this.recalcLayout();
            // Emits the page event if page size has been changed
            this._offsetEvent = -1;
            this.updatePage('up');
            this.updatePage('down');
        }
    }
    get pageSize() {
        return this._pageSize;
    }
    set rows(val) {
        if (val !== this._rows) {
            this._rows = val;
            this.recalcLayout();
        }
    }
    get rows() {
        return this._rows;
    }
    set columns(val) {
        if (val !== this._columns) {
            this._columns = val;
            const colsByPin = columnsByPin(val);
            this.columnGroupWidths = columnGroupWidths(colsByPin, val);
        }
    }
    get columns() {
        return this._columns;
    }
    set offset(val) {
        if (val !== this._offset) {
            this._offset = val;
            if (!this.scrollbarV || (this.scrollbarV && !this.virtualization)) {
                if (!isNaN(this._offset) && this.ghostLoadingIndicator) {
                    this.rows = [];
                }
                this.recalcLayout();
            }
        }
    }
    get offset() {
        return this._offset;
    }
    set rowCount(val) {
        if (val !== this._rowCount) {
            this._rowCount = val;
            this.recalcLayout();
        }
    }
    get rowCount() {
        return this._rowCount;
    }
    get bodyWidth() {
        if (this.scrollbarH) {
            return this.innerWidth + 'px';
        }
        else {
            return '100%';
        }
    }
    set bodyHeight(val) {
        if (this.scrollbarV) {
            this._bodyHeight = val + 'px';
        }
        else {
            this._bodyHeight = 'auto';
        }
        this.recalcLayout();
    }
    get bodyHeight() {
        return this._bodyHeight;
    }
    /**
     * Returns if selection is enabled.
     */
    get selectEnabled() {
        return !!this.selectionType;
    }
    /**
     * Property that would calculate the height of scroll bar
     * based on the row heights cache for virtual scroll and virtualization. Other scenarios
     * calculate scroll height automatically (as height will be undefined).
     */
    get scrollHeight() {
        if (this.scrollbarV && this.virtualization && this.rowCount) {
            return this.rowHeightsCache.query(this.rowCount - 1);
        }
        // avoid TS7030: Not all code paths return a value.
        return undefined;
    }
    /**
     * Called after the constructor, initializing input properties
     */
    ngOnInit() {
        if (this.rowDetail) {
            this.listener = this.rowDetail.toggle.subscribe(({ type, value }) => {
                if (type === 'row') {
                    this.toggleRowExpansion(value);
                }
                if (type === 'all') {
                    this.toggleAllRows(value);
                }
                // Refresh rows after toggle
                // Fixes #883
                this.updateIndexes();
                this.updateRows();
                this.cd.markForCheck();
            });
        }
        if (this.groupHeader) {
            this.listener = this.groupHeader.toggle.subscribe(({ type, value }) => {
                if (type === 'group') {
                    this.toggleRowExpansion(value);
                }
                if (type === 'all') {
                    this.toggleAllRows(value);
                }
                // Refresh rows after toggle
                // Fixes #883
                this.updateIndexes();
                this.updateRows();
                this.cd.markForCheck();
            });
        }
    }
    /**
     * Called once, before the instance is destroyed.
     */
    ngOnDestroy() {
        if (this.rowDetail || this.groupHeader) {
            this.listener.unsubscribe();
        }
    }
    /**
     * Updates the Y offset given a new offset.
     */
    updateOffsetY(offset) {
        // scroller is missing on empty table
        if (!this.scroller) {
            return;
        }
        if (this.scrollbarV && this.virtualization && offset) {
            // First get the row Index that we need to move to.
            const rowIndex = this.pageSize * offset;
            offset = this.rowHeightsCache.query(rowIndex - 1);
        }
        else if (this.scrollbarV && !this.virtualization) {
            offset = 0;
        }
        this.scroller.setOffset(offset || 0);
    }
    /**
     * Body was scrolled, this is mainly useful for
     * when a user is server-side pagination via virtual scroll.
     */
    onBodyScroll(event) {
        const scrollYPos = event.scrollYPos;
        const scrollXPos = event.scrollXPos;
        // if scroll change, trigger update
        // this is mainly used for header cell positions
        if (this.offsetY !== scrollYPos || this.offsetX !== scrollXPos) {
            this.scroll.emit({
                offsetY: scrollYPos,
                offsetX: scrollXPos
            });
        }
        this.offsetY = scrollYPos;
        this.offsetX = scrollXPos;
        this.updateIndexes();
        this.updatePage(event.direction);
        this.updateRows();
        this.cd.detectChanges();
    }
    /**
     * Updates the page given a direction.
     */
    updatePage(direction) {
        let offset = this.indexes.first / this.pageSize;
        const scrollInBetween = !Number.isInteger(offset);
        if (direction === 'up') {
            offset = Math.ceil(offset);
        }
        else if (direction === 'down') {
            offset = Math.floor(offset);
        }
        if (direction !== undefined && !isNaN(offset) && offset !== this._offsetEvent) {
            this._offsetEvent = offset;
            // if scroll was done by mouse drag make sure previous row and next row data is also fetched if its not fetched
            if (scrollInBetween && this.scrollbarV && this.virtualization && this.externalPaging) {
                const upRow = this.rows[this.indexes.first - 1];
                if (!upRow && direction === 'up') {
                    this.page.emit({ offset: offset - 1 });
                }
                const downRow = this.rows[this.indexes.first + this.pageSize];
                if (!downRow && direction === 'down') {
                    this.page.emit({ offset: offset + 1 });
                }
            }
            this.page.emit({ offset });
        }
    }
    /**
     * Updates the rows in the view port
     */
    updateRows() {
        const { first, last } = this.indexes;
        let rowIndex = first;
        let idx = 0;
        const temp = [];
        // if grouprowsby has been specified treat row paging
        // parameters as group paging parameters ie if limit 10 has been
        // specified treat it as 10 groups rather than 10 rows
        if (this.groupedRows) {
            let maxRowsPerGroup = 3;
            // if there is only one group set the maximum number of
            // rows per group the same as the total number of rows
            if (this.groupedRows.length === 1) {
                maxRowsPerGroup = this.groupedRows[0].value.length;
            }
            while (rowIndex < last && rowIndex < this.groupedRows.length) {
                // Add the groups into this page
                const group = this.groupedRows[rowIndex];
                this.rowIndexes.set(group, rowIndex);
                if (group.value) {
                    // add indexes for each group item
                    group.value.forEach((g, i) => {
                        const _idx = `${rowIndex}-${i}`;
                        this.rowIndexes.set(g, _idx);
                    });
                }
                temp[idx] = group;
                idx++;
                // Group index in this context
                rowIndex++;
            }
        }
        else {
            while (rowIndex < last && rowIndex < this.rowCount) {
                const row = this.rows[rowIndex];
                if (row) {
                    // add indexes for each row
                    this.rowIndexes.set(row, rowIndex);
                    temp[idx] = row;
                }
                else if (this.ghostLoadingIndicator && this.virtualization) {
                    temp[idx] = undefined;
                }
                idx++;
                rowIndex++;
            }
        }
        this.temp = temp;
    }
    /**
     * Get the row height
     */
    getRowHeight(row) {
        // if its a function return it
        if (typeof this.rowHeight === 'function') {
            return this.rowHeight(row);
        }
        return this.rowHeight;
    }
    /**
     * @param group the group with all rows
     */
    getGroupHeight(group) {
        let rowHeight = 0;
        if (group.value) {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let index = 0; index < group.value.length; index++) {
                rowHeight += this.getRowAndDetailHeight(group.value[index]);
            }
        }
        return rowHeight;
    }
    /**
     * Calculate row height based on the expanded state of the row.
     */
    getRowAndDetailHeight(row) {
        let rowHeight = this.getRowHeight(row);
        const expanded = this.getRowExpanded(row);
        // Adding detail row height if its expanded.
        if (expanded) {
            rowHeight += this.getDetailRowHeight(row);
        }
        return rowHeight;
    }
    /**
     * Calculates the styles for the row so that the rows can be moved in 2D space
     * during virtual scroll inside the DOM.   In the below case the Y position is
     * manipulated.   As an example, if the height of row 0 is 30 px and row 1 is
     * 100 px then following styles are generated:
     *
     * transform: translate3d(0px, 0px, 0px);    ->  row0
     * transform: translate3d(0px, 30px, 0px);   ->  row1
     * transform: translate3d(0px, 130px, 0px);  ->  row2
     *
     * Row heights have to be calculated based on the row heights cache as we wont
     * be able to determine which row is of what height before hand.  In the above
     * case the positionY of the translate3d for row2 would be the sum of all the
     * heights of the rows before it (i.e. row0 and row1).
     *
     * @param rows the row that needs to be placed in the 2D space.
     * @param index for ghost cells in order to get correct position of ghost row
     * @returns the CSS3 style to be applied
     *
     * @memberOf DataTableBodyComponent
     */
    getRowsStyles(rows, index = 0) {
        const styles = {};
        // only add styles for the group if there is a group
        if (this.groupedRows) {
            styles.width = this.columnGroupWidths.total;
        }
        if (this.scrollbarV && this.virtualization) {
            let idx = 0;
            if (this.groupedRows) {
                // Get the latest row rowindex in a group
                const row = rows[rows.length - 1];
                idx = row ? this.getRowIndex(row) : 0;
            }
            else {
                if (rows) {
                    idx = this.getRowIndex(rows);
                }
                else {
                    // When ghost cells are enabled use index to get the position of them
                    idx = index;
                }
            }
            // const pos = idx * rowHeight;
            // The position of this row would be the sum of all row heights
            // until the previous row position.
            const pos = this.rowHeightsCache.query(idx - 1);
            translateXY(styles, 0, pos);
        }
        return styles;
    }
    /**
     * Calculate bottom summary row offset for scrollbar mode.
     * For more information about cache and offset calculation
     * see description for `getRowsStyles` method
     *
     * @returns the CSS3 style to be applied
     *
     * @memberOf DataTableBodyComponent
     */
    getBottomSummaryRowStyles() {
        if (!this.scrollbarV || !this.rows || !this.rows.length) {
            return null;
        }
        const styles = { position: 'absolute' };
        const pos = this.rowHeightsCache.query(this.rows.length - 1);
        translateXY(styles, 0, pos);
        return styles;
    }
    /**
     * Hides the loading indicator
     */
    hideIndicator() {
        setTimeout(() => (this.loadingIndicator = false), 500);
    }
    /**
     * Updates the index of the rows in the viewport
     */
    updateIndexes() {
        let first = 0;
        let last = 0;
        if (this.scrollbarV) {
            if (this.virtualization) {
                // Calculation of the first and last indexes will be based on where the
                // scrollY position would be at.  The last index would be the one
                // that shows up inside the view port the last.
                const height = parseInt(this.bodyHeight, 10);
                first = this.rowHeightsCache.getRowIndex(this.offsetY);
                last = this.rowHeightsCache.getRowIndex(height + this.offsetY) + 1;
            }
            else {
                // If virtual rows are not needed
                // We render all in one go
                first = 0;
                last = this.rowCount;
            }
        }
        else {
            // The server is handling paging and will pass an array that begins with the
            // element at a specified offset.  first should always be 0 with external paging.
            if (!this.externalPaging) {
                first = Math.max(this.offset * this.pageSize, 0);
            }
            last = Math.min(first + this.pageSize, this.rowCount);
        }
        this.indexes = { first, last };
    }
    /**
     * Refreshes the full Row Height cache.  Should be used
     * when the entire row array state has changed.
     */
    refreshRowHeightCache() {
        if (!this.scrollbarV || (this.scrollbarV && !this.virtualization)) {
            return;
        }
        // clear the previous row height cache if already present.
        // this is useful during sorts, filters where the state of the
        // rows array is changed.
        this.rowHeightsCache.clearCache();
        // Initialize the tree only if there are rows inside the tree.
        if (this.rows && this.rows.length) {
            const rowExpansions = new Set();
            for (const row of this.rows) {
                if (this.getRowExpanded(row)) {
                    rowExpansions.add(row);
                }
            }
            this.rowHeightsCache.initCache({
                rows: this.rows,
                rowHeight: this.rowHeight,
                detailRowHeight: this.getDetailRowHeight,
                externalVirtual: this.scrollbarV && this.externalPaging,
                rowCount: this.rowCount,
                rowIndexes: this.rowIndexes,
                rowExpansions
            });
        }
    }
    /**
     * Gets the index for the view port
     */
    getAdjustedViewPortIndex() {
        // Capture the row index of the first row that is visible on the viewport.
        // If the scroll bar is just below the row which is highlighted then make that as the
        // first index.
        const viewPortFirstRowIndex = this.indexes.first;
        if (this.scrollbarV && this.virtualization) {
            const offsetScroll = this.rowHeightsCache.query(viewPortFirstRowIndex - 1);
            return offsetScroll <= this.offsetY ? viewPortFirstRowIndex - 1 : viewPortFirstRowIndex;
        }
        return viewPortFirstRowIndex;
    }
    /**
     * Toggle the Expansion of the row i.e. if the row is expanded then it will
     * collapse and vice versa.   Note that the expanded status is stored as
     * a part of the row object itself as we have to preserve the expanded row
     * status in case of sorting and filtering of the row set.
     */
    toggleRowExpansion(row) {
        // Capture the row index of the first row that is visible on the viewport.
        const viewPortFirstRowIndex = this.getAdjustedViewPortIndex();
        const rowExpandedIdx = this.getRowExpandedIdx(row, this.rowExpansions);
        const expanded = rowExpandedIdx > -1;
        // If the detailRowHeight is auto --> only in case of non-virtualized scroll
        if (this.scrollbarV && this.virtualization) {
            const detailRowHeight = this.getDetailRowHeight(row) * (expanded ? -1 : 1);
            // const idx = this.rowIndexes.get(row) || 0;
            const idx = this.getRowIndex(row);
            this.rowHeightsCache.update(idx, detailRowHeight);
        }
        // Update the toggled row and update thive nevere heights in the cache.
        if (expanded) {
            this.rowExpansions.splice(rowExpandedIdx, 1);
        }
        else {
            this.rowExpansions.push(row);
        }
        this.detailToggle.emit({
            rows: [row],
            currentIndex: viewPortFirstRowIndex
        });
    }
    /**
     * Expand/Collapse all the rows no matter what their state is.
     */
    toggleAllRows(expanded) {
        // clear prev expansions
        this.rowExpansions = [];
        // Capture the row index of the first row that is visible on the viewport.
        const viewPortFirstRowIndex = this.getAdjustedViewPortIndex();
        if (expanded) {
            for (const row of this.rows) {
                this.rowExpansions.push(row);
            }
        }
        if (this.scrollbarV) {
            // Refresh the full row heights cache since every row was affected.
            this.recalcLayout();
        }
        // Emit all rows that have been expanded.
        this.detailToggle.emit({
            rows: this.rows,
            currentIndex: viewPortFirstRowIndex
        });
    }
    /**
     * Recalculates the table
     */
    recalcLayout() {
        this.refreshRowHeightCache();
        this.updateIndexes();
        this.updateRows();
    }
    /**
     * Tracks the column
     */
    columnTrackingFn(index, column) {
        return column.$$id;
    }
    /**
     * Gets the row pinning group styles
     */
    stylesByGroup(group) {
        const widths = this.columnGroupWidths;
        const offsetX = this.offsetX;
        const styles = {
            width: `${widths[group]}px`
        };
        if (group === 'left') {
            translateXY(styles, offsetX, 0);
        }
        else if (group === 'right') {
            const bodyWidth = this.innerWidth;
            const totalDiff = widths.total - bodyWidth;
            const offsetDiff = totalDiff - offsetX;
            const offset = offsetDiff * -1;
            translateXY(styles, offset, 0);
        }
        return styles;
    }
    /**
     * Returns if the row was expanded and set default row expansion when row expansion is empty
     */
    getRowExpanded(row) {
        if (this.rowExpansions.length === 0 && this.groupExpansionDefault) {
            for (const group of this.groupedRows) {
                this.rowExpansions.push(group);
            }
        }
        return this.getRowExpandedIdx(row, this.rowExpansions) > -1;
    }
    getRowExpandedIdx(row, expanded) {
        if (!expanded || !expanded.length) {
            return -1;
        }
        const rowId = this.rowIdentity(row);
        return expanded.findIndex(r => {
            const id = this.rowIdentity(r);
            return id === rowId;
        });
    }
    /**
     * Gets the row index given a row
     */
    getRowIndex(row) {
        return this.rowIndexes.get(row) || 0;
    }
    onTreeAction(row) {
        this.treeAction.emit({ row });
    }
    dragOver(event, dropRow) {
        event.preventDefault();
        this.rowDragEvents.emit({
            event,
            srcElement: this._draggedRowElement,
            eventType: 'dragover',
            dragRow: this._draggedRow,
            dropRow
        });
    }
    drag(event, dragRow, rowComponent) {
        this._draggedRow = dragRow;
        this._draggedRowElement = rowComponent._element;
        this.rowDragEvents.emit({
            event,
            srcElement: this._draggedRowElement,
            eventType: 'dragstart',
            dragRow
        });
    }
    drop(event, dropRow, rowComponent) {
        event.preventDefault();
        this.rowDragEvents.emit({
            event,
            srcElement: this._draggedRowElement,
            targetElement: rowComponent._element,
            eventType: 'drop',
            dragRow: this._draggedRow,
            dropRow
        });
    }
    dragEnter(event, dropRow, rowComponent) {
        event.preventDefault();
        this.rowDragEvents.emit({
            event,
            srcElement: this._draggedRowElement,
            targetElement: rowComponent._element,
            eventType: 'dragenter',
            dragRow: this._draggedRow,
            dropRow
        });
    }
    dragLeave(event, dropRow, rowComponent) {
        event.preventDefault();
        this.rowDragEvents.emit({
            event,
            srcElement: this._draggedRowElement,
            targetElement: rowComponent._element,
            eventType: 'dragleave',
            dragRow: this._draggedRow,
            dropRow
        });
    }
    dragEnd(event, dragRow) {
        event.preventDefault();
        this.rowDragEvents.emit({
            event,
            srcElement: this._draggedRowElement,
            eventType: 'dragend',
            dragRow
        });
        this._draggedRow = undefined;
        this._draggedRowElement = undefined;
    }
}
DataTableBodyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: DataTableBodyComponent, deps: [{ token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
DataTableBodyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: DataTableBodyComponent, selector: "datatable-body", inputs: { scrollbarV: "scrollbarV", scrollbarH: "scrollbarH", loadingIndicator: "loadingIndicator", ghostLoadingIndicator: "ghostLoadingIndicator", externalPaging: "externalPaging", rowHeight: "rowHeight", offsetX: "offsetX", emptyMessage: "emptyMessage", selectionType: "selectionType", selected: "selected", rowIdentity: "rowIdentity", rowDetail: "rowDetail", groupHeader: "groupHeader", selectCheck: "selectCheck", displayCheck: "displayCheck", trackByProp: "trackByProp", rowClass: "rowClass", groupedRows: "groupedRows", groupExpansionDefault: "groupExpansionDefault", innerWidth: "innerWidth", groupRowsBy: "groupRowsBy", virtualization: "virtualization", summaryRow: "summaryRow", summaryPosition: "summaryPosition", summaryHeight: "summaryHeight", rowDraggable: "rowDraggable", rowDragEvents: "rowDragEvents", disableRowCheck: "disableRowCheck", pageSize: "pageSize", rows: "rows", columns: "columns", offset: "offset", rowCount: "rowCount", bodyHeight: "bodyHeight" }, outputs: { scroll: "scroll", page: "page", activate: "activate", select: "select", detailToggle: "detailToggle", rowContextmenu: "rowContextmenu", treeAction: "treeAction" }, host: { properties: { "style.width": "this.bodyWidth", "style.height": "this.bodyHeight" }, classAttribute: "datatable-body" }, viewQueries: [{ propertyName: "scroller", first: true, predicate: ScrollerComponent, descendants: true }], ngImport: i0, template: `
    <ng-container *ngIf="loadingIndicator">
      <div class="custom-loading-indicator-wrapper">
        <div class="custom-loading-content" #customIndicator>
          <ng-content select="[loading-indicator]"></ng-content>
        </div>
      </div>
      <datatable-progress *ngIf="!customIndicator?.hasChildNodes()"></datatable-progress>
    </ng-container>
    <ghost-loader
      *ngIf="ghostLoadingIndicator && (!rowCount || !virtualization || !scrollbarV)"
      class="ghost-overlay"
      [columns]="columns"
      [pageSize]="pageSize"
      [rowHeight]="rowHeight"
      [ghostBodyHeight]="bodyHeight"
    >
    </ghost-loader>
    <datatable-selection
      #selector
      [selected]="selected"
      [rows]="rows"
      [selectCheck]="selectCheck"
      [disableCheck]="disableRowCheck"
      [selectEnabled]="selectEnabled"
      [selectionType]="selectionType"
      [rowIdentity]="rowIdentity"
      (select)="select.emit($event)"
      (activate)="activate.emit($event)"
    >
      <datatable-scroller
        *ngIf="rows?.length"
        [scrollbarV]="scrollbarV"
        [scrollbarH]="scrollbarH"
        [scrollHeight]="scrollHeight"
        [scrollWidth]="columnGroupWidths?.total"
        (scroll)="onBodyScroll($event)"
      >
        <datatable-summary-row
          *ngIf="summaryRow && summaryPosition === 'top'"
          [rowHeight]="summaryHeight"
          [offsetX]="offsetX"
          [innerWidth]="innerWidth"
          [rows]="rows"
          [columns]="columns"
        >
        </datatable-summary-row>
        <datatable-row-wrapper
          #rowWrapper
          [groupedRows]="groupedRows"
          *ngFor="let group of temp; let i = index; trackBy: rowTrackingFn"
          [innerWidth]="innerWidth"
          [ngStyle]="getRowsStyles(group, indexes.first + i )"
          [rowDetail]="rowDetail"
          [groupHeader]="groupHeader"
          [offsetX]="offsetX"
          [detailRowHeight]="getDetailRowHeight(group && group[i], i)"
          [row]="group"
          [disableCheck]="disableRowCheck"
          [expanded]="getRowExpanded(group)"
          [rowIndex]="getRowIndex(group && group[i])"
          (rowContextmenu)="rowContextmenu.emit($event)"
        >
          <datatable-body-row
            role="row"
            *ngIf="!groupedRows; else groupedRowsTemplate"
            tabindex="-1"
            #rowElement
            [disable$]="rowWrapper.disable$"
            [isSelected]="selector.getRowSelected(group)"
            [innerWidth]="innerWidth"
            [offsetX]="offsetX"
            [columns]="columns"
            [rowHeight]="getRowHeight(group)"
            [row]="group"
            [rowIndex]="getRowIndex(group)"
            [expanded]="getRowExpanded(group)"
            [rowClass]="rowClass"
            [displayCheck]="displayCheck"
            [treeStatus]="group && group.treeStatus"
            [ghostLoadingIndicator]="ghostLoadingIndicator"
            [draggable]="rowDraggable"
            (treeAction)="onTreeAction(group)"
            (activate)="selector.onActivate($event, indexes.first + i)"
            (drop)="drop($event, group, rowElement)"
            (dragover)="dragOver($event, group)"
            (dragenter)="dragEnter($event, group, rowElement)"
            (dragleave)="dragLeave($event, group, rowElement)"
            (dragstart)="drag($event, group, rowElement)"
            (dragend)="dragEnd($event, group)"
          >
          </datatable-body-row>
          <ng-template #groupedRowsTemplate>
            <datatable-body-row
              role="row"
              [disable$]="rowWrapper.disable$"
              *ngFor="let row of group.value; let i = index; trackBy: rowTrackingFn"
              tabindex="-1"
              #rowElement
              [isSelected]="selector.getRowSelected(row)"
              [innerWidth]="innerWidth"
              [offsetX]="offsetX"
              [columns]="columns"
              [rowHeight]="getRowHeight(row)"
              [row]="row"
              [group]="group.value"
              [rowIndex]="getRowIndex(row)"
              [expanded]="getRowExpanded(row)"
              [rowClass]="rowClass"
              [ghostLoadingIndicator]="ghostLoadingIndicator"
              [draggable]="rowDraggable"
              (activate)="selector.onActivate($event, i)"
              (drop)="drop($event, row, rowElement)"
              (dragover)="dragOver($event, row)"
              (dragenter)="dragEnter($event, row, rowElement)"
              (dragleave)="dragLeave($event, row, rowElement)"
              (dragstart)="drag($event, row, rowElement)"
              (dragend)="dragEnd($event, row)"
            >
            </datatable-body-row>
          </ng-template>
        </datatable-row-wrapper>
        <datatable-summary-row
          role="row"
          *ngIf="summaryRow && summaryPosition === 'bottom'"
          [ngStyle]="getBottomSummaryRowStyles()"
          [rowHeight]="summaryHeight"
          [offsetX]="offsetX"
          [innerWidth]="innerWidth"
          [rows]="rows"
          [columns]="columns"
        >
        </datatable-summary-row>
      </datatable-scroller>
      <ng-container *ngIf="!rows?.length && !loadingIndicator && !ghostLoadingIndicator">
      <div
        class="empty-row"
        *ngIf="!customEmptyContent?.children.length"
        [innerHTML]="emptyMessage"
      ></div>
      <div #customEmptyContent>
        <ng-content select="[empty-content]"></ng-content>
      </div>
      </ng-container>
    </datatable-selection>
  `, isInline: true, dependencies: [{ kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "directive", type: i2.DraggableDirective, selector: "[draggable]", inputs: ["dragEventTarget", "dragModel", "dragX", "dragY"], outputs: ["dragStart", "dragging", "dragEnd"] }, { kind: "component", type: i3.ScrollerComponent, selector: "datatable-scroller", inputs: ["scrollbarV", "scrollbarH", "scrollHeight", "scrollWidth"], outputs: ["scroll"] }, { kind: "component", type: i4.ProgressBarComponent, selector: "datatable-progress" }, { kind: "component", type: i5.DataTableBodyRowComponent, selector: "datatable-body-row", inputs: ["columns", "innerWidth", "expanded", "rowClass", "row", "group", "isSelected", "rowIndex", "displayCheck", "treeStatus", "ghostLoadingIndicator", "disable$", "offsetX", "rowHeight"], outputs: ["activate", "treeAction"] }, { kind: "component", type: i6.DataTableRowWrapperComponent, selector: "datatable-row-wrapper", inputs: ["innerWidth", "rowDetail", "groupHeader", "offsetX", "detailRowHeight", "row", "groupedRows", "disableCheck", "rowIndex", "expanded"], outputs: ["rowContextmenu"] }, { kind: "component", type: i7.DataTableSelectionComponent, selector: "datatable-selection", inputs: ["rows", "selected", "selectEnabled", "selectionType", "rowIdentity", "selectCheck", "disableCheck"], outputs: ["activate", "select"] }, { kind: "component", type: i8.DataTableSummaryRowComponent, selector: "datatable-summary-row", inputs: ["rows", "columns", "rowHeight", "offsetX", "innerWidth"] }, { kind: "component", type: i9.DataTableGhostLoaderComponent, selector: "ghost-loader", inputs: ["columns", "pageSize", "rowHeight", "ghostBodyHeight"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: DataTableBodyComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'datatable-body',
                    template: `
    <ng-container *ngIf="loadingIndicator">
      <div class="custom-loading-indicator-wrapper">
        <div class="custom-loading-content" #customIndicator>
          <ng-content select="[loading-indicator]"></ng-content>
        </div>
      </div>
      <datatable-progress *ngIf="!customIndicator?.hasChildNodes()"></datatable-progress>
    </ng-container>
    <ghost-loader
      *ngIf="ghostLoadingIndicator && (!rowCount || !virtualization || !scrollbarV)"
      class="ghost-overlay"
      [columns]="columns"
      [pageSize]="pageSize"
      [rowHeight]="rowHeight"
      [ghostBodyHeight]="bodyHeight"
    >
    </ghost-loader>
    <datatable-selection
      #selector
      [selected]="selected"
      [rows]="rows"
      [selectCheck]="selectCheck"
      [disableCheck]="disableRowCheck"
      [selectEnabled]="selectEnabled"
      [selectionType]="selectionType"
      [rowIdentity]="rowIdentity"
      (select)="select.emit($event)"
      (activate)="activate.emit($event)"
    >
      <datatable-scroller
        *ngIf="rows?.length"
        [scrollbarV]="scrollbarV"
        [scrollbarH]="scrollbarH"
        [scrollHeight]="scrollHeight"
        [scrollWidth]="columnGroupWidths?.total"
        (scroll)="onBodyScroll($event)"
      >
        <datatable-summary-row
          *ngIf="summaryRow && summaryPosition === 'top'"
          [rowHeight]="summaryHeight"
          [offsetX]="offsetX"
          [innerWidth]="innerWidth"
          [rows]="rows"
          [columns]="columns"
        >
        </datatable-summary-row>
        <datatable-row-wrapper
          #rowWrapper
          [groupedRows]="groupedRows"
          *ngFor="let group of temp; let i = index; trackBy: rowTrackingFn"
          [innerWidth]="innerWidth"
          [ngStyle]="getRowsStyles(group, indexes.first + i )"
          [rowDetail]="rowDetail"
          [groupHeader]="groupHeader"
          [offsetX]="offsetX"
          [detailRowHeight]="getDetailRowHeight(group && group[i], i)"
          [row]="group"
          [disableCheck]="disableRowCheck"
          [expanded]="getRowExpanded(group)"
          [rowIndex]="getRowIndex(group && group[i])"
          (rowContextmenu)="rowContextmenu.emit($event)"
        >
          <datatable-body-row
            role="row"
            *ngIf="!groupedRows; else groupedRowsTemplate"
            tabindex="-1"
            #rowElement
            [disable$]="rowWrapper.disable$"
            [isSelected]="selector.getRowSelected(group)"
            [innerWidth]="innerWidth"
            [offsetX]="offsetX"
            [columns]="columns"
            [rowHeight]="getRowHeight(group)"
            [row]="group"
            [rowIndex]="getRowIndex(group)"
            [expanded]="getRowExpanded(group)"
            [rowClass]="rowClass"
            [displayCheck]="displayCheck"
            [treeStatus]="group && group.treeStatus"
            [ghostLoadingIndicator]="ghostLoadingIndicator"
            [draggable]="rowDraggable"
            (treeAction)="onTreeAction(group)"
            (activate)="selector.onActivate($event, indexes.first + i)"
            (drop)="drop($event, group, rowElement)"
            (dragover)="dragOver($event, group)"
            (dragenter)="dragEnter($event, group, rowElement)"
            (dragleave)="dragLeave($event, group, rowElement)"
            (dragstart)="drag($event, group, rowElement)"
            (dragend)="dragEnd($event, group)"
          >
          </datatable-body-row>
          <ng-template #groupedRowsTemplate>
            <datatable-body-row
              role="row"
              [disable$]="rowWrapper.disable$"
              *ngFor="let row of group.value; let i = index; trackBy: rowTrackingFn"
              tabindex="-1"
              #rowElement
              [isSelected]="selector.getRowSelected(row)"
              [innerWidth]="innerWidth"
              [offsetX]="offsetX"
              [columns]="columns"
              [rowHeight]="getRowHeight(row)"
              [row]="row"
              [group]="group.value"
              [rowIndex]="getRowIndex(row)"
              [expanded]="getRowExpanded(row)"
              [rowClass]="rowClass"
              [ghostLoadingIndicator]="ghostLoadingIndicator"
              [draggable]="rowDraggable"
              (activate)="selector.onActivate($event, i)"
              (drop)="drop($event, row, rowElement)"
              (dragover)="dragOver($event, row)"
              (dragenter)="dragEnter($event, row, rowElement)"
              (dragleave)="dragLeave($event, row, rowElement)"
              (dragstart)="drag($event, row, rowElement)"
              (dragend)="dragEnd($event, row)"
            >
            </datatable-body-row>
          </ng-template>
        </datatable-row-wrapper>
        <datatable-summary-row
          role="row"
          *ngIf="summaryRow && summaryPosition === 'bottom'"
          [ngStyle]="getBottomSummaryRowStyles()"
          [rowHeight]="summaryHeight"
          [offsetX]="offsetX"
          [innerWidth]="innerWidth"
          [rows]="rows"
          [columns]="columns"
        >
        </datatable-summary-row>
      </datatable-scroller>
      <ng-container *ngIf="!rows?.length && !loadingIndicator && !ghostLoadingIndicator">
      <div
        class="empty-row"
        *ngIf="!customEmptyContent?.children.length"
        [innerHTML]="emptyMessage"
      ></div>
      <div #customEmptyContent>
        <ng-content select="[empty-content]"></ng-content>
      </div>
      </ng-container>
    </datatable-selection>
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    host: {
                        class: 'datatable-body'
                    }
                }]
        }], ctorParameters: function () { return [{ type: i0.ChangeDetectorRef }]; }, propDecorators: { scrollbarV: [{
                type: Input
            }], scrollbarH: [{
                type: Input
            }], loadingIndicator: [{
                type: Input
            }], ghostLoadingIndicator: [{
                type: Input
            }], externalPaging: [{
                type: Input
            }], rowHeight: [{
                type: Input
            }], offsetX: [{
                type: Input
            }], emptyMessage: [{
                type: Input
            }], selectionType: [{
                type: Input
            }], selected: [{
                type: Input
            }], rowIdentity: [{
                type: Input
            }], rowDetail: [{
                type: Input
            }], groupHeader: [{
                type: Input
            }], selectCheck: [{
                type: Input
            }], displayCheck: [{
                type: Input
            }], trackByProp: [{
                type: Input
            }], rowClass: [{
                type: Input
            }], groupedRows: [{
                type: Input
            }], groupExpansionDefault: [{
                type: Input
            }], innerWidth: [{
                type: Input
            }], groupRowsBy: [{
                type: Input
            }], virtualization: [{
                type: Input
            }], summaryRow: [{
                type: Input
            }], summaryPosition: [{
                type: Input
            }], summaryHeight: [{
                type: Input
            }], rowDraggable: [{
                type: Input
            }], rowDragEvents: [{
                type: Input
            }], disableRowCheck: [{
                type: Input
            }], pageSize: [{
                type: Input
            }], rows: [{
                type: Input
            }], columns: [{
                type: Input
            }], offset: [{
                type: Input
            }], rowCount: [{
                type: Input
            }], bodyWidth: [{
                type: HostBinding,
                args: ['style.width']
            }], bodyHeight: [{
                type: Input
            }, {
                type: HostBinding,
                args: ['style.height']
            }], scroll: [{
                type: Output
            }], page: [{
                type: Output
            }], activate: [{
                type: Output
            }], select: [{
                type: Output
            }], detailToggle: [{
                type: Output
            }], rowContextmenu: [{
                type: Output
            }], treeAction: [{
                type: Output
            }], scroller: [{
                type: ViewChild,
                args: [ScrollerComponent]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9keS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtZGF0YXRhYmxlL3NyYy9saWIvY29tcG9uZW50cy9ib2R5L2JvZHkuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCx1QkFBdUIsRUFFdkIsU0FBUyxFQUNULFlBQVksRUFDWixXQUFXLEVBQ1gsS0FBSyxFQUdMLE1BQU0sRUFDTixTQUFTLEVBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFekQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFlBQVksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3JFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7Ozs7Ozs7Ozs7O0FBNEpwRCxNQUFNLE9BQU8sc0JBQXNCO0lBdUxqQzs7T0FFRztJQUNILFlBQW1CLEVBQXFCO1FBQXJCLE9BQUUsR0FBRixFQUFFLENBQW1CO1FBdEsvQixhQUFRLEdBQVUsRUFBRSxDQUFDO1FBK0dwQixXQUFNLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFDL0MsU0FBSSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQzdDLGFBQVEsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNqRCxXQUFNLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFDL0MsaUJBQVksR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNyRCxtQkFBYyxHQUFHLElBQUksWUFBWSxDQUFrQyxLQUFLLENBQUMsQ0FBQztRQUMxRSxlQUFVLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUF3QjdELG9CQUFlLEdBQW1CLElBQUksY0FBYyxFQUFFLENBQUM7UUFDdkQs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YW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIEV2ZW50RW1pdHRlcixcbiAgSG9zdEJpbmRpbmcsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3V0cHV0LFxuICBWaWV3Q2hpbGRcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTY3JvbGxlckNvbXBvbmVudCB9IGZyb20gJy4vc2Nyb2xsZXIuY29tcG9uZW50JztcbmltcG9ydCB7IFNlbGVjdGlvblR5cGUgfSBmcm9tICcuLi8uLi90eXBlcy9zZWxlY3Rpb24udHlwZSc7XG5pbXBvcnQgeyBjb2x1bW5Hcm91cFdpZHRocywgY29sdW1uc0J5UGluIH0gZnJvbSAnLi4vLi4vdXRpbHMvY29sdW1uJztcbmltcG9ydCB7IFJvd0hlaWdodENhY2hlIH0gZnJvbSAnLi4vLi4vdXRpbHMvcm93LWhlaWdodC1jYWNoZSc7XG5pbXBvcnQgeyB0cmFuc2xhdGVYWSB9IGZyb20gJy4uLy4uL3V0aWxzL3RyYW5zbGF0ZSc7XG5pbXBvcnQgeyBEcmFnRXZlbnREYXRhIH0gZnJvbSAnLi4vLi4vdHlwZXMvZHJhZy1ldmVudHMudHlwZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2RhdGF0YWJsZS1ib2R5JyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bmctY29udGFpbmVyICpuZ0lmPVwibG9hZGluZ0luZGljYXRvclwiPlxuICAgICAgPGRpdiBjbGFzcz1cImN1c3RvbS1sb2FkaW5nLWluZGljYXRvci13cmFwcGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjdXN0b20tbG9hZGluZy1jb250ZW50XCIgI2N1c3RvbUluZGljYXRvcj5cbiAgICAgICAgICA8bmctY29udGVudCBzZWxlY3Q9XCJbbG9hZGluZy1pbmRpY2F0b3JdXCI+PC9uZy1jb250ZW50PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRhdGF0YWJsZS1wcm9ncmVzcyAqbmdJZj1cIiFjdXN0b21JbmRpY2F0b3I/Lmhhc0NoaWxkTm9kZXMoKVwiPjwvZGF0YXRhYmxlLXByb2dyZXNzPlxuICAgIDwvbmctY29udGFpbmVyPlxuICAgIDxnaG9zdC1sb2FkZXJcbiAgICAgICpuZ0lmPVwiZ2hvc3RMb2FkaW5nSW5kaWNhdG9yICYmICghcm93Q291bnQgfHwgIXZpcnR1YWxpemF0aW9uIHx8ICFzY3JvbGxiYXJWKVwiXG4gICAgICBjbGFzcz1cImdob3N0LW92ZXJsYXlcIlxuICAgICAgW2NvbHVtbnNdPVwiY29sdW1uc1wiXG4gICAgICBbcGFnZVNpemVdPVwicGFnZVNpemVcIlxuICAgICAgW3Jvd0hlaWdodF09XCJyb3dIZWlnaHRcIlxuICAgICAgW2dob3N0Qm9keUhlaWdodF09XCJib2R5SGVpZ2h0XCJcbiAgICA+XG4gICAgPC9naG9zdC1sb2FkZXI+XG4gICAgPGRhdGF0YWJsZS1zZWxlY3Rpb25cbiAgICAgICNzZWxlY3RvclxuICAgICAgW3NlbGVjdGVkXT1cInNlbGVjdGVkXCJcbiAgICAgIFtyb3dzXT1cInJvd3NcIlxuICAgICAgW3NlbGVjdENoZWNrXT1cInNlbGVjdENoZWNrXCJcbiAgICAgIFtkaXNhYmxlQ2hlY2tdPVwiZGlzYWJsZVJvd0NoZWNrXCJcbiAgICAgIFtzZWxlY3RFbmFibGVkXT1cInNlbGVjdEVuYWJsZWRcIlxuICAgICAgW3NlbGVjdGlvblR5cGVdPVwic2VsZWN0aW9uVHlwZVwiXG4gICAgICBbcm93SWRlbnRpdHldPVwicm93SWRlbnRpdHlcIlxuICAgICAgKHNlbGVjdCk9XCJzZWxlY3QuZW1pdCgkZXZlbnQpXCJcbiAgICAgIChhY3RpdmF0ZSk9XCJhY3RpdmF0ZS5lbWl0KCRldmVudClcIlxuICAgID5cbiAgICAgIDxkYXRhdGFibGUtc2Nyb2xsZXJcbiAgICAgICAgKm5nSWY9XCJyb3dzPy5sZW5ndGhcIlxuICAgICAgICBbc2Nyb2xsYmFyVl09XCJzY3JvbGxiYXJWXCJcbiAgICAgICAgW3Njcm9sbGJhckhdPVwic2Nyb2xsYmFySFwiXG4gICAgICAgIFtzY3JvbGxIZWlnaHRdPVwic2Nyb2xsSGVpZ2h0XCJcbiAgICAgICAgW3Njcm9sbFdpZHRoXT1cImNvbHVtbkdyb3VwV2lkdGhzPy50b3RhbFwiXG4gICAgICAgIChzY3JvbGwpPVwib25Cb2R5U2Nyb2xsKCRldmVudClcIlxuICAgICAgPlxuICAgICAgICA8ZGF0YXRhYmxlLXN1bW1hcnktcm93XG4gICAgICAgICAgKm5nSWY9XCJzdW1tYXJ5Um93ICYmIHN1bW1hcnlQb3NpdGlvbiA9PT0gJ3RvcCdcIlxuICAgICAgICAgIFtyb3dIZWlnaHRdPVwic3VtbWFyeUhlaWdodFwiXG4gICAgICAgICAgW29mZnNldFhdPVwib2Zmc2V0WFwiXG4gICAgICAgICAgW2lubmVyV2lkdGhdPVwiaW5uZXJXaWR0aFwiXG4gICAgICAgICAgW3Jvd3NdPVwicm93c1wiXG4gICAgICAgICAgW2NvbHVtbnNdPVwiY29sdW1uc1wiXG4gICAgICAgID5cbiAgICAgICAgPC9kYXRhdGFibGUtc3VtbWFyeS1yb3c+XG4gICAgICAgIDxkYXRhdGFibGUtcm93LXdyYXBwZXJcbiAgICAgICAgICAjcm93V3JhcHBlclxuICAgICAgICAgIFtncm91cGVkUm93c109XCJncm91cGVkUm93c1wiXG4gICAgICAgICAgKm5nRm9yPVwibGV0IGdyb3VwIG9mIHRlbXA7IGxldCBpID0gaW5kZXg7IHRyYWNrQnk6IHJvd1RyYWNraW5nRm5cIlxuICAgICAgICAgIFtpbm5lcldpZHRoXT1cImlubmVyV2lkdGhcIlxuICAgICAgICAgIFtuZ1N0eWxlXT1cImdldFJvd3NTdHlsZXMoZ3JvdXAsIGluZGV4ZXMuZmlyc3QgKyBpIClcIlxuICAgICAgICAgIFtyb3dEZXRhaWxdPVwicm93RGV0YWlsXCJcbiAgICAgICAgICBbZ3JvdXBIZWFkZXJdPVwiZ3JvdXBIZWFkZXJcIlxuICAgICAgICAgIFtvZmZzZXRYXT1cIm9mZnNldFhcIlxuICAgICAgICAgIFtkZXRhaWxSb3dIZWlnaHRdPVwiZ2V0RGV0YWlsUm93SGVpZ2h0KGdyb3VwICYmIGdyb3VwW2ldLCBpKVwiXG4gICAgICAgICAgW3Jvd109XCJncm91cFwiXG4gICAgICAgICAgW2Rpc2FibGVDaGVja109XCJkaXNhYmxlUm93Q2hlY2tcIlxuICAgICAgICAgIFtleHBhbmRlZF09XCJnZXRSb3dFeHBhbmRlZChncm91cClcIlxuICAgICAgICAgIFtyb3dJbmRleF09XCJnZXRSb3dJbmRleChncm91cCAmJiBncm91cFtpXSlcIlxuICAgICAgICAgIChyb3dDb250ZXh0bWVudSk9XCJyb3dDb250ZXh0bWVudS5lbWl0KCRldmVudClcIlxuICAgICAgICA+XG4gICAgICAgICAgPGRhdGF0YWJsZS1ib2R5LXJvd1xuICAgICAgICAgICAgcm9sZT1cInJvd1wiXG4gICAgICAgICAgICAqbmdJZj1cIiFncm91cGVkUm93czsgZWxzZSBncm91cGVkUm93c1RlbXBsYXRlXCJcbiAgICAgICAgICAgIHRhYmluZGV4PVwiLTFcIlxuICAgICAgICAgICAgI3Jvd0VsZW1lbnRcbiAgICAgICAgICAgIFtkaXNhYmxlJF09XCJyb3dXcmFwcGVyLmRpc2FibGUkXCJcbiAgICAgICAgICAgIFtpc1NlbGVjdGVkXT1cInNlbGVjdG9yLmdldFJvd1NlbGVjdGVkKGdyb3VwKVwiXG4gICAgICAgICAgICBbaW5uZXJXaWR0aF09XCJpbm5lcldpZHRoXCJcbiAgICAgICAgICAgIFtvZmZzZXRYXT1cIm9mZnNldFhcIlxuICAgICAgICAgICAgW2NvbHVtbnNdPVwiY29sdW1uc1wiXG4gICAgICAgICAgICBbcm93SGVpZ2h0XT1cImdldFJvd0hlaWdodChncm91cClcIlxuICAgICAgICAgICAgW3Jvd109XCJncm91cFwiXG4gICAgICAgICAgICBbcm93SW5kZXhdPVwiZ2V0Um93SW5kZXgoZ3JvdXApXCJcbiAgICAgICAgICAgIFtleHBhbmRlZF09XCJnZXRSb3dFeHBhbmRlZChncm91cClcIlxuICAgICAgICAgICAgW3Jvd0NsYXNzXT1cInJvd0NsYXNzXCJcbiAgICAgICAgICAgIFtkaXNwbGF5Q2hlY2tdPVwiZGlzcGxheUNoZWNrXCJcbiAgICAgICAgICAgIFt0cmVlU3RhdHVzXT1cImdyb3VwICYmIGdyb3VwLnRyZWVTdGF0dXNcIlxuICAgICAgICAgICAgW2dob3N0TG9hZGluZ0luZGljYXRvcl09XCJnaG9zdExvYWRpbmdJbmRpY2F0b3JcIlxuICAgICAgICAgICAgW2RyYWdnYWJsZV09XCJyb3dEcmFnZ2FibGVcIlxuICAgICAgICAgICAgKHRyZWVBY3Rpb24pPVwib25UcmVlQWN0aW9uKGdyb3VwKVwiXG4gICAgICAgICAgICAoYWN0aXZhdGUpPVwic2VsZWN0b3Iub25BY3RpdmF0ZSgkZXZlbnQsIGluZGV4ZXMuZmlyc3QgKyBpKVwiXG4gICAgICAgICAgICAoZHJvcCk9XCJkcm9wKCRldmVudCwgZ3JvdXAsIHJvd0VsZW1lbnQpXCJcbiAgICAgICAgICAgIChkcmFnb3Zlcik9XCJkcmFnT3ZlcigkZXZlbnQsIGdyb3VwKVwiXG4gICAgICAgICAgICAoZHJhZ2VudGVyKT1cImRyYWdFbnRlcigkZXZlbnQsIGdyb3VwLCByb3dFbGVtZW50KVwiXG4gICAgICAgICAgICAoZHJhZ2xlYXZlKT1cImRyYWdMZWF2ZSgkZXZlbnQsIGdyb3VwLCByb3dFbGVtZW50KVwiXG4gICAgICAgICAgICAoZHJhZ3N0YXJ0KT1cImRyYWcoJGV2ZW50LCBncm91cCwgcm93RWxlbWVudClcIlxuICAgICAgICAgICAgKGRyYWdlbmQpPVwiZHJhZ0VuZCgkZXZlbnQsIGdyb3VwKVwiXG4gICAgICAgICAgPlxuICAgICAgICAgIDwvZGF0YXRhYmxlLWJvZHktcm93PlxuICAgICAgICAgIDxuZy10ZW1wbGF0ZSAjZ3JvdXBlZFJvd3NUZW1wbGF0ZT5cbiAgICAgICAgICAgIDxkYXRhdGFibGUtYm9keS1yb3dcbiAgICAgICAgICAgICAgcm9sZT1cInJvd1wiXG4gICAgICAgICAgICAgIFtkaXNhYmxlJF09XCJyb3dXcmFwcGVyLmRpc2FibGUkXCJcbiAgICAgICAgICAgICAgKm5nRm9yPVwibGV0IHJvdyBvZiBncm91cC52YWx1ZTsgbGV0IGkgPSBpbmRleDsgdHJhY2tCeTogcm93VHJhY2tpbmdGblwiXG4gICAgICAgICAgICAgIHRhYmluZGV4PVwiLTFcIlxuICAgICAgICAgICAgICAjcm93RWxlbWVudFxuICAgICAgICAgICAgICBbaXNTZWxlY3RlZF09XCJzZWxlY3Rvci5nZXRSb3dTZWxlY3RlZChyb3cpXCJcbiAgICAgICAgICAgICAgW2lubmVyV2lkdGhdPVwiaW5uZXJXaWR0aFwiXG4gICAgICAgICAgICAgIFtvZmZzZXRYXT1cIm9mZnNldFhcIlxuICAgICAgICAgICAgICBbY29sdW1uc109XCJjb2x1bW5zXCJcbiAgICAgICAgICAgICAgW3Jvd0hlaWdodF09XCJnZXRSb3dIZWlnaHQocm93KVwiXG4gICAgICAgICAgICAgIFtyb3ddPVwicm93XCJcbiAgICAgICAgICAgICAgW2dyb3VwXT1cImdyb3VwLnZhbHVlXCJcbiAgICAgICAgICAgICAgW3Jvd0luZGV4XT1cImdldFJvd0luZGV4KHJvdylcIlxuICAgICAgICAgICAgICBbZXhwYW5kZWRdPVwiZ2V0Um93RXhwYW5kZWQocm93KVwiXG4gICAgICAgICAgICAgIFtyb3dDbGFzc109XCJyb3dDbGFzc1wiXG4gICAgICAgICAgICAgIFtnaG9zdExvYWRpbmdJbmRpY2F0b3JdPVwiZ2hvc3RMb2FkaW5nSW5kaWNhdG9yXCJcbiAgICAgICAgICAgICAgW2RyYWdnYWJsZV09XCJyb3dEcmFnZ2FibGVcIlxuICAgICAgICAgICAgICAoYWN0aXZhdGUpPVwic2VsZWN0b3Iub25BY3RpdmF0ZSgkZXZlbnQsIGkpXCJcbiAgICAgICAgICAgICAgKGRyb3ApPVwiZHJvcCgkZXZlbnQsIHJvdywgcm93RWxlbWVudClcIlxuICAgICAgICAgICAgICAoZHJhZ292ZXIpPVwiZHJhZ092ZXIoJGV2ZW50LCByb3cpXCJcbiAgICAgICAgICAgICAgKGRyYWdlbnRlcik9XCJkcmFnRW50ZXIoJGV2ZW50LCByb3csIHJvd0VsZW1lbnQpXCJcbiAgICAgICAgICAgICAgKGRyYWdsZWF2ZSk9XCJkcmFnTGVhdmUoJGV2ZW50LCByb3csIHJvd0VsZW1lbnQpXCJcbiAgICAgICAgICAgICAgKGRyYWdzdGFydCk9XCJkcmFnKCRldmVudCwgcm93LCByb3dFbGVtZW50KVwiXG4gICAgICAgICAgICAgIChkcmFnZW5kKT1cImRyYWdFbmQoJGV2ZW50LCByb3cpXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgIDwvZGF0YXRhYmxlLWJvZHktcm93PlxuICAgICAgICAgIDwvbmctdGVtcGxhdGU+XG4gICAgICAgIDwvZGF0YXRhYmxlLXJvdy13cmFwcGVyPlxuICAgICAgICA8ZGF0YXRhYmxlLXN1bW1hcnktcm93XG4gICAgICAgICAgcm9sZT1cInJvd1wiXG4gICAgICAgICAgKm5nSWY9XCJzdW1tYXJ5Um93ICYmIHN1bW1hcnlQb3NpdGlvbiA9PT0gJ2JvdHRvbSdcIlxuICAgICAgICAgIFtuZ1N0eWxlXT1cImdldEJvdHRvbVN1bW1hcnlSb3dTdHlsZXMoKVwiXG4gICAgICAgICAgW3Jvd0hlaWdodF09XCJzdW1tYXJ5SGVpZ2h0XCJcbiAgICAgICAgICBbb2Zmc2V0WF09XCJvZmZzZXRYXCJcbiAgICAgICAgICBbaW5uZXJXaWR0aF09XCJpbm5lcldpZHRoXCJcbiAgICAgICAgICBbcm93c109XCJyb3dzXCJcbiAgICAgICAgICBbY29sdW1uc109XCJjb2x1bW5zXCJcbiAgICAgICAgPlxuICAgICAgICA8L2RhdGF0YWJsZS1zdW1tYXJ5LXJvdz5cbiAgICAgIDwvZGF0YXRhYmxlLXNjcm9sbGVyPlxuICAgICAgPG5nLWNvbnRhaW5lciAqbmdJZj1cIiFyb3dzPy5sZW5ndGggJiYgIWxvYWRpbmdJbmRpY2F0b3IgJiYgIWdob3N0TG9hZGluZ0luZGljYXRvclwiPlxuICAgICAgPGRpdlxuICAgICAgICBjbGFzcz1cImVtcHR5LXJvd1wiXG4gICAgICAgICpuZ0lmPVwiIWN1c3RvbUVtcHR5Q29udGVudD8uY2hpbGRyZW4ubGVuZ3RoXCJcbiAgICAgICAgW2lubmVySFRNTF09XCJlbXB0eU1lc3NhZ2VcIlxuICAgICAgPjwvZGl2PlxuICAgICAgPGRpdiAjY3VzdG9tRW1wdHlDb250ZW50PlxuICAgICAgICA8bmctY29udGVudCBzZWxlY3Q9XCJbZW1wdHktY29udGVudF1cIj48L25nLWNvbnRlbnQ+XG4gICAgICA8L2Rpdj5cbiAgICAgIDwvbmctY29udGFpbmVyPlxuICAgIDwvZGF0YXRhYmxlLXNlbGVjdGlvbj5cbiAgYCxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGhvc3Q6IHtcbiAgICBjbGFzczogJ2RhdGF0YWJsZS1ib2R5J1xuICB9XG59KVxuZXhwb3J0IGNsYXNzIERhdGFUYWJsZUJvZHlDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIHNjcm9sbGJhclY6IGJvb2xlYW47XG4gIEBJbnB1dCgpIHNjcm9sbGJhckg6IGJvb2xlYW47XG4gIEBJbnB1dCgpIGxvYWRpbmdJbmRpY2F0b3I6IGJvb2xlYW47XG4gIHByaXZhdGUgX2dob3N0TG9hZGluZ0luZGljYXRvcjogYm9vbGVhbjtcbiAgQElucHV0KCkgc2V0IGdob3N0TG9hZGluZ0luZGljYXRvcih2YWw6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9naG9zdExvYWRpbmdJbmRpY2F0b3IgPSB2YWw7XG4gICAgaWYgKCF2YWwpIHtcbiAgICAgIC8vIHJlbW92ZSBwbGFjZWhvbGRlciByb3dzIG9uY2UgZ2hvc3Rsb2FkaW5nIGlzIHNldCB0byBmYWxzZVxuICAgICAgdGhpcy50ZW1wID0gdGhpcy50ZW1wLmZpbHRlcihpdGVtID0+ICEhaXRlbSk7XG4gICAgfVxuICB9O1xuICBnZXQgZ2hvc3RMb2FkaW5nSW5kaWNhdG9yKCkge1xuICAgIHJldHVybiB0aGlzLl9naG9zdExvYWRpbmdJbmRpY2F0b3I7XG4gIH1cbiAgQElucHV0KCkgZXh0ZXJuYWxQYWdpbmc6IGJvb2xlYW47XG4gIEBJbnB1dCgpIHJvd0hlaWdodDogbnVtYmVyIHwgJ2F1dG8nIHwgKChyb3c/OiBhbnkpID0+IG51bWJlcik7XG4gIEBJbnB1dCgpIG9mZnNldFg6IG51bWJlcjtcbiAgQElucHV0KCkgZW1wdHlNZXNzYWdlOiBzdHJpbmc7XG4gIEBJbnB1dCgpIHNlbGVjdGlvblR5cGU6IFNlbGVjdGlvblR5cGU7XG4gIEBJbnB1dCgpIHNlbGVjdGVkOiBhbnlbXSA9IFtdO1xuICBASW5wdXQoKSByb3dJZGVudGl0eTogYW55O1xuICBASW5wdXQoKSByb3dEZXRhaWw6IGFueTtcbiAgQElucHV0KCkgZ3JvdXBIZWFkZXI6IGFueTtcbiAgQElucHV0KCkgc2VsZWN0Q2hlY2s6IGFueTtcbiAgQElucHV0KCkgZGlzcGxheUNoZWNrOiBhbnk7XG4gIEBJbnB1dCgpIHRyYWNrQnlQcm9wOiBzdHJpbmc7XG4gIEBJbnB1dCgpIHJvd0NsYXNzOiBhbnk7XG4gIEBJbnB1dCgpIGdyb3VwZWRSb3dzOiBhbnk7XG4gIEBJbnB1dCgpIGdyb3VwRXhwYW5zaW9uRGVmYXVsdDogYm9vbGVhbjtcbiAgQElucHV0KCkgaW5uZXJXaWR0aDogbnVtYmVyO1xuICBASW5wdXQoKSBncm91cFJvd3NCeTogc3RyaW5nO1xuICBASW5wdXQoKSB2aXJ0dWFsaXphdGlvbjogYm9vbGVhbjtcbiAgQElucHV0KCkgc3VtbWFyeVJvdzogYm9vbGVhbjtcbiAgQElucHV0KCkgc3VtbWFyeVBvc2l0aW9uOiBzdHJpbmc7XG4gIEBJbnB1dCgpIHN1bW1hcnlIZWlnaHQ6IG51bWJlcjtcbiAgQElucHV0KCkgcm93RHJhZ2dhYmxlOiBib29sZWFuO1xuICBASW5wdXQoKSByb3dEcmFnRXZlbnRzOiBFdmVudEVtaXR0ZXI8RHJhZ0V2ZW50RGF0YT47XG4gIEBJbnB1dCgpIGRpc2FibGVSb3dDaGVjazogKHJvdzogYW55KSA9PiBib29sZWFuO1xuXG4gIEBJbnB1dCgpIHNldCBwYWdlU2l6ZSh2YWw6IG51bWJlcikge1xuICAgIGlmICh2YWwgIT09IHRoaXMuX3BhZ2VTaXplKSB7XG4gICAgICB0aGlzLl9wYWdlU2l6ZSA9IHZhbDtcbiAgICAgIHRoaXMucmVjYWxjTGF5b3V0KCk7XG5cbiAgICAgIC8vIEVtaXRzIHRoZSBwYWdlIGV2ZW50IGlmIHBhZ2Ugc2l6ZSBoYXMgYmVlbiBjaGFuZ2VkXG4gICAgICB0aGlzLl9vZmZzZXRFdmVudCA9IC0xO1xuICAgICAgdGhpcy51cGRhdGVQYWdlKCd1cCcpO1xuICAgICAgdGhpcy51cGRhdGVQYWdlKCdkb3duJyk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHBhZ2VTaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3BhZ2VTaXplO1xuICB9XG5cbiAgQElucHV0KCkgc2V0IHJvd3ModmFsOiBhbnlbXSkge1xuICAgIGlmICh2YWwgIT09IHRoaXMuX3Jvd3MpIHtcbiAgICAgIHRoaXMuX3Jvd3MgPSB2YWw7XG4gICAgICB0aGlzLnJlY2FsY0xheW91dCgpO1xuICAgIH1cbiAgfVxuXG4gIGdldCByb3dzKCk6IGFueVtdIHtcbiAgICByZXR1cm4gdGhpcy5fcm93cztcbiAgfVxuXG4gIEBJbnB1dCgpIHNldCBjb2x1bW5zKHZhbDogYW55W10pIHtcbiAgICBpZiAodmFsICE9PSB0aGlzLl9jb2x1bW5zKSB7XG4gICAgICB0aGlzLl9jb2x1bW5zID0gdmFsO1xuICAgICAgY29uc3QgY29sc0J5UGluID0gY29sdW1uc0J5UGluKHZhbCk7XG4gICAgICB0aGlzLmNvbHVtbkdyb3VwV2lkdGhzID0gY29sdW1uR3JvdXBXaWR0aHMoY29sc0J5UGluLCB2YWwpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBjb2x1bW5zKCk6IGFueVtdIHtcbiAgICByZXR1cm4gdGhpcy5fY29sdW1ucztcbiAgfVxuXG4gIEBJbnB1dCgpIHNldCBvZmZzZXQodmFsOiBudW1iZXIpIHtcbiAgICBpZiAodmFsICE9PSB0aGlzLl9vZmZzZXQpIHtcbiAgICAgIHRoaXMuX29mZnNldCA9IHZhbDtcbiAgICAgIGlmICghdGhpcy5zY3JvbGxiYXJWIHx8ICh0aGlzLnNjcm9sbGJhclYgJiYgIXRoaXMudmlydHVhbGl6YXRpb24pKSB7XG4gICAgICAgIGlmICghaXNOYU4odGhpcy5fb2Zmc2V0KSAmJiB0aGlzLmdob3N0TG9hZGluZ0luZGljYXRvcikge1xuICAgICAgICAgIHRoaXMucm93cyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVjYWxjTGF5b3V0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0IG9mZnNldCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9vZmZzZXQ7XG4gIH1cblxuICBASW5wdXQoKSBzZXQgcm93Q291bnQodmFsOiBudW1iZXIpIHtcbiAgICBpZiAodmFsICE9PSB0aGlzLl9yb3dDb3VudCkge1xuICAgICAgdGhpcy5fcm93Q291bnQgPSB2YWw7XG4gICAgICB0aGlzLnJlY2FsY0xheW91dCgpO1xuICAgIH1cbiAgfVxuXG4gIGdldCByb3dDb3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9yb3dDb3VudDtcbiAgfVxuXG4gIEBIb3N0QmluZGluZygnc3R5bGUud2lkdGgnKVxuICBnZXQgYm9keVdpZHRoKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuc2Nyb2xsYmFySCkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5uZXJXaWR0aCArICdweCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnMTAwJSc7XG4gICAgfVxuICB9XG5cbiAgQElucHV0KClcbiAgQEhvc3RCaW5kaW5nKCdzdHlsZS5oZWlnaHQnKVxuICBzZXQgYm9keUhlaWdodCh2YWwpIHtcbiAgICBpZiAodGhpcy5zY3JvbGxiYXJWKSB7XG4gICAgICB0aGlzLl9ib2R5SGVpZ2h0ID0gdmFsICsgJ3B4JztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYm9keUhlaWdodCA9ICdhdXRvJztcbiAgICB9XG5cbiAgICB0aGlzLnJlY2FsY0xheW91dCgpO1xuICB9XG5cbiAgZ2V0IGJvZHlIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2JvZHlIZWlnaHQ7XG4gIH1cblxuICBAT3V0cHV0KCkgc2Nyb2xsOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIHBhZ2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgYWN0aXZhdGU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgc2VsZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIGRldGFpbFRvZ2dsZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSByb3dDb250ZXh0bWVudSA9IG5ldyBFdmVudEVtaXR0ZXI8eyBldmVudDogTW91c2VFdmVudDsgcm93OiBhbnkgfT4oZmFsc2UpO1xuICBAT3V0cHV0KCkgdHJlZUFjdGlvbjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgQFZpZXdDaGlsZChTY3JvbGxlckNvbXBvbmVudCkgc2Nyb2xsZXI6IFNjcm9sbGVyQ29tcG9uZW50O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIHNlbGVjdGlvbiBpcyBlbmFibGVkLlxuICAgKi9cbiAgZ2V0IHNlbGVjdEVuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5zZWxlY3Rpb25UeXBlO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb3BlcnR5IHRoYXQgd291bGQgY2FsY3VsYXRlIHRoZSBoZWlnaHQgb2Ygc2Nyb2xsIGJhclxuICAgKiBiYXNlZCBvbiB0aGUgcm93IGhlaWdodHMgY2FjaGUgZm9yIHZpcnR1YWwgc2Nyb2xsIGFuZCB2aXJ0dWFsaXphdGlvbi4gT3RoZXIgc2NlbmFyaW9zXG4gICAqIGNhbGN1bGF0ZSBzY3JvbGwgaGVpZ2h0IGF1dG9tYXRpY2FsbHkgKGFzIGhlaWdodCB3aWxsIGJlIHVuZGVmaW5lZCkuXG4gICAqL1xuICBnZXQgc2Nyb2xsSGVpZ2h0KCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKHRoaXMuc2Nyb2xsYmFyViAmJiB0aGlzLnZpcnR1YWxpemF0aW9uICYmIHRoaXMucm93Q291bnQpIHtcbiAgICAgIHJldHVybiB0aGlzLnJvd0hlaWdodHNDYWNoZS5xdWVyeSh0aGlzLnJvd0NvdW50IC0gMSk7XG4gICAgfVxuICAgIC8vIGF2b2lkIFRTNzAzMDogTm90IGFsbCBjb2RlIHBhdGhzIHJldHVybiBhIHZhbHVlLlxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByb3dIZWlnaHRzQ2FjaGU6IFJvd0hlaWdodENhY2hlID0gbmV3IFJvd0hlaWdodENhY2hlKCk7XG4gIHRlbXA6IGFueVtdID0gW107XG4gIG9mZnNldFkgPSAwO1xuICBpbmRleGVzOiBhbnkgPSB7fTtcbiAgY29sdW1uR3JvdXBXaWR0aHM6IGFueTtcbiAgY29sdW1uR3JvdXBXaWR0aHNXaXRob3V0R3JvdXA6IGFueTtcbiAgcm93VHJhY2tpbmdGbjogYW55O1xuICBsaXN0ZW5lcjogYW55O1xuICByb3dJbmRleGVzOiBhbnkgPSBuZXcgV2Vha01hcDxhbnksIHN0cmluZz4oKTtcbiAgcm93RXhwYW5zaW9uczogYW55W10gPSBbXTtcblxuICBfcm93czogYW55W107XG4gIF9ib2R5SGVpZ2h0OiBhbnk7XG4gIF9jb2x1bW5zOiBhbnlbXTtcbiAgX3Jvd0NvdW50OiBudW1iZXI7XG4gIF9vZmZzZXQ6IG51bWJlcjtcbiAgX3BhZ2VTaXplOiBudW1iZXI7XG4gIF9vZmZzZXRFdmVudCA9IC0xO1xuXG4gIHByaXZhdGUgX2RyYWdnZWRSb3c6IGFueTtcbiAgcHJpdmF0ZSBfZHJhZ2dlZFJvd0VsZW1lbnQ6IEhUTUxFbGVtZW50O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIERhdGFUYWJsZUJvZHlDb21wb25lbnQuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY2Q6IENoYW5nZURldGVjdG9yUmVmKSB7XG4gICAgLy8gZGVjbGFyZSBmbiBoZXJlIHNvIHdlIGNhbiBnZXQgYWNjZXNzIHRvIHRoZSBgdGhpc2AgcHJvcGVydHlcbiAgICB0aGlzLnJvd1RyYWNraW5nRm4gPSAoaW5kZXg6IG51bWJlciwgcm93OiBhbnkpOiBhbnkgPT4ge1xuICAgICAgY29uc3QgaWR4ID0gdGhpcy5nZXRSb3dJbmRleChyb3cpO1xuICAgICAgaWYgKHRoaXMudHJhY2tCeVByb3ApIHtcbiAgICAgICAgcmV0dXJuIHJvd1t0aGlzLnRyYWNrQnlQcm9wXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpZHg7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYWZ0ZXIgdGhlIGNvbnN0cnVjdG9yLCBpbml0aWFsaXppbmcgaW5wdXQgcHJvcGVydGllc1xuICAgKi9cbiAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucm93RGV0YWlsKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyID0gdGhpcy5yb3dEZXRhaWwudG9nZ2xlLnN1YnNjcmliZSgoeyB0eXBlLCB2YWx1ZSB9OiB7IHR5cGU6IHN0cmluZzsgdmFsdWU6IGFueSB9KSA9PiB7XG4gICAgICAgIGlmICh0eXBlID09PSAncm93Jykge1xuICAgICAgICAgIHRoaXMudG9nZ2xlUm93RXhwYW5zaW9uKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gJ2FsbCcpIHtcbiAgICAgICAgICB0aGlzLnRvZ2dsZUFsbFJvd3ModmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVmcmVzaCByb3dzIGFmdGVyIHRvZ2dsZVxuICAgICAgICAvLyBGaXhlcyAjODgzXG4gICAgICAgIHRoaXMudXBkYXRlSW5kZXhlcygpO1xuICAgICAgICB0aGlzLnVwZGF0ZVJvd3MoKTtcbiAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdyb3VwSGVhZGVyKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyID0gdGhpcy5ncm91cEhlYWRlci50b2dnbGUuc3Vic2NyaWJlKCh7IHR5cGUsIHZhbHVlIH06IHsgdHlwZTogc3RyaW5nOyB2YWx1ZTogYW55IH0pID0+IHtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdncm91cCcpIHtcbiAgICAgICAgICB0aGlzLnRvZ2dsZVJvd0V4cGFuc2lvbih2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGUgPT09ICdhbGwnKSB7XG4gICAgICAgICAgdGhpcy50b2dnbGVBbGxSb3dzKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlZnJlc2ggcm93cyBhZnRlciB0b2dnbGVcbiAgICAgICAgLy8gRml4ZXMgIzg4M1xuICAgICAgICB0aGlzLnVwZGF0ZUluZGV4ZXMoKTtcbiAgICAgICAgdGhpcy51cGRhdGVSb3dzKCk7XG4gICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIG9uY2UsIGJlZm9yZSB0aGUgaW5zdGFuY2UgaXMgZGVzdHJveWVkLlxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucm93RGV0YWlsIHx8IHRoaXMuZ3JvdXBIZWFkZXIpIHtcbiAgICAgIHRoaXMubGlzdGVuZXIudW5zdWJzY3JpYmUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgWSBvZmZzZXQgZ2l2ZW4gYSBuZXcgb2Zmc2V0LlxuICAgKi9cbiAgdXBkYXRlT2Zmc2V0WShvZmZzZXQ/OiBudW1iZXIpOiB2b2lkIHtcbiAgICAvLyBzY3JvbGxlciBpcyBtaXNzaW5nIG9uIGVtcHR5IHRhYmxlXG4gICAgaWYgKCF0aGlzLnNjcm9sbGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2Nyb2xsYmFyViAmJiB0aGlzLnZpcnR1YWxpemF0aW9uICYmIG9mZnNldCkge1xuICAgICAgLy8gRmlyc3QgZ2V0IHRoZSByb3cgSW5kZXggdGhhdCB3ZSBuZWVkIHRvIG1vdmUgdG8uXG4gICAgICBjb25zdCByb3dJbmRleCA9IHRoaXMucGFnZVNpemUgKiBvZmZzZXQ7XG4gICAgICBvZmZzZXQgPSB0aGlzLnJvd0hlaWdodHNDYWNoZS5xdWVyeShyb3dJbmRleCAtIDEpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zY3JvbGxiYXJWICYmICF0aGlzLnZpcnR1YWxpemF0aW9uKSB7XG4gICAgICBvZmZzZXQgPSAwO1xuICAgIH1cblxuICAgIHRoaXMuc2Nyb2xsZXIuc2V0T2Zmc2V0KG9mZnNldCB8fCAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCb2R5IHdhcyBzY3JvbGxlZCwgdGhpcyBpcyBtYWlubHkgdXNlZnVsIGZvclxuICAgKiB3aGVuIGEgdXNlciBpcyBzZXJ2ZXItc2lkZSBwYWdpbmF0aW9uIHZpYSB2aXJ0dWFsIHNjcm9sbC5cbiAgICovXG4gIG9uQm9keVNjcm9sbChldmVudDogYW55KTogdm9pZCB7XG4gICAgY29uc3Qgc2Nyb2xsWVBvczogbnVtYmVyID0gZXZlbnQuc2Nyb2xsWVBvcztcbiAgICBjb25zdCBzY3JvbGxYUG9zOiBudW1iZXIgPSBldmVudC5zY3JvbGxYUG9zO1xuXG4gICAgLy8gaWYgc2Nyb2xsIGNoYW5nZSwgdHJpZ2dlciB1cGRhdGVcbiAgICAvLyB0aGlzIGlzIG1haW5seSB1c2VkIGZvciBoZWFkZXIgY2VsbCBwb3NpdGlvbnNcbiAgICBpZiAodGhpcy5vZmZzZXRZICE9PSBzY3JvbGxZUG9zIHx8IHRoaXMub2Zmc2V0WCAhPT0gc2Nyb2xsWFBvcykge1xuICAgICAgdGhpcy5zY3JvbGwuZW1pdCh7XG4gICAgICAgIG9mZnNldFk6IHNjcm9sbFlQb3MsXG4gICAgICAgIG9mZnNldFg6IHNjcm9sbFhQb3NcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMub2Zmc2V0WSA9IHNjcm9sbFlQb3M7XG4gICAgdGhpcy5vZmZzZXRYID0gc2Nyb2xsWFBvcztcblxuICAgIHRoaXMudXBkYXRlSW5kZXhlcygpO1xuICAgIHRoaXMudXBkYXRlUGFnZShldmVudC5kaXJlY3Rpb24pO1xuICAgIHRoaXMudXBkYXRlUm93cygpO1xuICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHBhZ2UgZ2l2ZW4gYSBkaXJlY3Rpb24uXG4gICAqL1xuICB1cGRhdGVQYWdlKGRpcmVjdGlvbjogc3RyaW5nKTogdm9pZCB7XG4gICAgbGV0IG9mZnNldCA9IHRoaXMuaW5kZXhlcy5maXJzdCAvIHRoaXMucGFnZVNpemU7XG4gICAgY29uc3Qgc2Nyb2xsSW5CZXR3ZWVuID0gIU51bWJlci5pc0ludGVnZXIob2Zmc2V0KTtcbiAgICBpZiAoZGlyZWN0aW9uID09PSAndXAnKSB7XG4gICAgICBvZmZzZXQgPSBNYXRoLmNlaWwob2Zmc2V0KTtcbiAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgICBvZmZzZXQgPSBNYXRoLmZsb29yKG9mZnNldCk7XG4gICAgfVxuXG4gICAgaWYgKGRpcmVjdGlvbiAhPT0gdW5kZWZpbmVkICYmICFpc05hTihvZmZzZXQpICYmIG9mZnNldCAhPT0gdGhpcy5fb2Zmc2V0RXZlbnQpIHtcbiAgICAgIHRoaXMuX29mZnNldEV2ZW50ID0gb2Zmc2V0O1xuICAgICAgLy8gaWYgc2Nyb2xsIHdhcyBkb25lIGJ5IG1vdXNlIGRyYWcgbWFrZSBzdXJlIHByZXZpb3VzIHJvdyBhbmQgbmV4dCByb3cgZGF0YSBpcyBhbHNvIGZldGNoZWQgaWYgaXRzIG5vdCBmZXRjaGVkXG4gICAgICBpZiAoc2Nyb2xsSW5CZXR3ZWVuICYmIHRoaXMuc2Nyb2xsYmFyViAmJiB0aGlzLnZpcnR1YWxpemF0aW9uICYmIHRoaXMuZXh0ZXJuYWxQYWdpbmcpIHtcbiAgICAgICAgY29uc3QgdXBSb3cgPSB0aGlzLnJvd3NbdGhpcy5pbmRleGVzLmZpcnN0IC0gMV07XG4gICAgICAgIGlmICghdXBSb3cgJiYgZGlyZWN0aW9uID09PSAndXAnKSB7XG4gICAgICAgICAgdGhpcy5wYWdlLmVtaXQoeyBvZmZzZXQ6IG9mZnNldCAtIDEgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkb3duUm93ID0gdGhpcy5yb3dzW3RoaXMuaW5kZXhlcy5maXJzdCArIHRoaXMucGFnZVNpemVdO1xuICAgICAgICBpZiAoIWRvd25Sb3cgJiYgZGlyZWN0aW9uID09PSAnZG93bicpIHtcbiAgICAgICAgICB0aGlzLnBhZ2UuZW1pdCh7IG9mZnNldDogb2Zmc2V0ICsgMSB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5wYWdlLmVtaXQoeyBvZmZzZXQgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHJvd3MgaW4gdGhlIHZpZXcgcG9ydFxuICAgKi9cbiAgdXBkYXRlUm93cygpOiB2b2lkIHtcbiAgICBjb25zdCB7IGZpcnN0LCBsYXN0IH0gPSB0aGlzLmluZGV4ZXM7XG4gICAgbGV0IHJvd0luZGV4ID0gZmlyc3Q7XG4gICAgbGV0IGlkeCA9IDA7XG4gICAgY29uc3QgdGVtcDogYW55W10gPSBbXTtcblxuICAgIC8vIGlmIGdyb3Vwcm93c2J5IGhhcyBiZWVuIHNwZWNpZmllZCB0cmVhdCByb3cgcGFnaW5nXG4gICAgLy8gcGFyYW1ldGVycyBhcyBncm91cCBwYWdpbmcgcGFyYW1ldGVycyBpZSBpZiBsaW1pdCAxMCBoYXMgYmVlblxuICAgIC8vIHNwZWNpZmllZCB0cmVhdCBpdCBhcyAxMCBncm91cHMgcmF0aGVyIHRoYW4gMTAgcm93c1xuICAgIGlmICh0aGlzLmdyb3VwZWRSb3dzKSB7XG4gICAgICBsZXQgbWF4Um93c1Blckdyb3VwID0gMztcbiAgICAgIC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lIGdyb3VwIHNldCB0aGUgbWF4aW11bSBudW1iZXIgb2ZcbiAgICAgIC8vIHJvd3MgcGVyIGdyb3VwIHRoZSBzYW1lIGFzIHRoZSB0b3RhbCBudW1iZXIgb2Ygcm93c1xuICAgICAgaWYgKHRoaXMuZ3JvdXBlZFJvd3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIG1heFJvd3NQZXJHcm91cCA9IHRoaXMuZ3JvdXBlZFJvd3NbMF0udmFsdWUubGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICB3aGlsZSAocm93SW5kZXggPCBsYXN0ICYmIHJvd0luZGV4IDwgdGhpcy5ncm91cGVkUm93cy5sZW5ndGgpIHtcbiAgICAgICAgLy8gQWRkIHRoZSBncm91cHMgaW50byB0aGlzIHBhZ2VcbiAgICAgICAgY29uc3QgZ3JvdXAgPSB0aGlzLmdyb3VwZWRSb3dzW3Jvd0luZGV4XTtcbiAgICAgICAgdGhpcy5yb3dJbmRleGVzLnNldChncm91cCwgcm93SW5kZXgpO1xuXG4gICAgICAgIGlmIChncm91cC52YWx1ZSkge1xuICAgICAgICAgIC8vIGFkZCBpbmRleGVzIGZvciBlYWNoIGdyb3VwIGl0ZW1cbiAgICAgICAgICBncm91cC52YWx1ZS5mb3JFYWNoKChnOiBhbnksIGk6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgY29uc3QgX2lkeCA9IGAke3Jvd0luZGV4fS0ke2l9YDtcbiAgICAgICAgICAgIHRoaXMucm93SW5kZXhlcy5zZXQoZywgX2lkeCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGVtcFtpZHhdID0gZ3JvdXA7XG4gICAgICAgIGlkeCsrO1xuXG4gICAgICAgIC8vIEdyb3VwIGluZGV4IGluIHRoaXMgY29udGV4dFxuICAgICAgICByb3dJbmRleCsrO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB3aGlsZSAocm93SW5kZXggPCBsYXN0ICYmIHJvd0luZGV4IDwgdGhpcy5yb3dDb3VudCkge1xuICAgICAgICBjb25zdCByb3cgPSB0aGlzLnJvd3Nbcm93SW5kZXhdO1xuXG4gICAgICAgIGlmIChyb3cpIHtcbiAgICAgICAgICAvLyBhZGQgaW5kZXhlcyBmb3IgZWFjaCByb3dcbiAgICAgICAgICB0aGlzLnJvd0luZGV4ZXMuc2V0KHJvdywgcm93SW5kZXgpO1xuICAgICAgICAgIHRlbXBbaWR4XSA9IHJvdztcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdob3N0TG9hZGluZ0luZGljYXRvciAmJiB0aGlzLnZpcnR1YWxpemF0aW9uKSB7XG4gICAgICAgICAgdGVtcFtpZHhdID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWR4Kys7XG4gICAgICAgIHJvd0luZGV4Kys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50ZW1wID0gdGVtcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHJvdyBoZWlnaHRcbiAgICovXG4gIGdldFJvd0hlaWdodChyb3c6IGFueSk6IG51bWJlciB7XG4gICAgLy8gaWYgaXRzIGEgZnVuY3Rpb24gcmV0dXJuIGl0XG4gICAgaWYgKHR5cGVvZiB0aGlzLnJvd0hlaWdodCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHRoaXMucm93SGVpZ2h0KHJvdyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucm93SGVpZ2h0IGFzIG51bWJlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gZ3JvdXAgdGhlIGdyb3VwIHdpdGggYWxsIHJvd3NcbiAgICovXG4gIGdldEdyb3VwSGVpZ2h0KGdyb3VwOiBhbnkpOiBudW1iZXIge1xuICAgIGxldCByb3dIZWlnaHQgPSAwO1xuXG4gICAgaWYgKGdyb3VwLnZhbHVlKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3ByZWZlci1mb3Itb2ZcbiAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBncm91cC52YWx1ZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgcm93SGVpZ2h0ICs9IHRoaXMuZ2V0Um93QW5kRGV0YWlsSGVpZ2h0KGdyb3VwLnZhbHVlW2luZGV4XSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJvd0hlaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgcm93IGhlaWdodCBiYXNlZCBvbiB0aGUgZXhwYW5kZWQgc3RhdGUgb2YgdGhlIHJvdy5cbiAgICovXG4gIGdldFJvd0FuZERldGFpbEhlaWdodChyb3c6IGFueSk6IG51bWJlciB7XG4gICAgbGV0IHJvd0hlaWdodCA9IHRoaXMuZ2V0Um93SGVpZ2h0KHJvdyk7XG4gICAgY29uc3QgZXhwYW5kZWQgPSB0aGlzLmdldFJvd0V4cGFuZGVkKHJvdyk7XG5cbiAgICAvLyBBZGRpbmcgZGV0YWlsIHJvdyBoZWlnaHQgaWYgaXRzIGV4cGFuZGVkLlxuICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgcm93SGVpZ2h0ICs9IHRoaXMuZ2V0RGV0YWlsUm93SGVpZ2h0KHJvdyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJvd0hlaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGhlaWdodCBvZiB0aGUgZGV0YWlsIHJvdy5cbiAgICovXG4gIGdldERldGFpbFJvd0hlaWdodCA9IChyb3c/OiBhbnksIGluZGV4PzogYW55KTogbnVtYmVyID0+IHtcbiAgICBpZiAoIXRoaXMucm93RGV0YWlsKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgY29uc3Qgcm93SGVpZ2h0ID0gdGhpcy5yb3dEZXRhaWwucm93SGVpZ2h0O1xuICAgIHJldHVybiB0eXBlb2Ygcm93SGVpZ2h0ID09PSAnZnVuY3Rpb24nID8gcm93SGVpZ2h0KHJvdywgaW5kZXgpIDogKHJvd0hlaWdodCBhcyBudW1iZXIpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIHRoZSBzdHlsZXMgZm9yIHRoZSByb3cgc28gdGhhdCB0aGUgcm93cyBjYW4gYmUgbW92ZWQgaW4gMkQgc3BhY2VcbiAgICogZHVyaW5nIHZpcnR1YWwgc2Nyb2xsIGluc2lkZSB0aGUgRE9NLiAgIEluIHRoZSBiZWxvdyBjYXNlIHRoZSBZIHBvc2l0aW9uIGlzXG4gICAqIG1hbmlwdWxhdGVkLiAgIEFzIGFuIGV4YW1wbGUsIGlmIHRoZSBoZWlnaHQgb2Ygcm93IDAgaXMgMzAgcHggYW5kIHJvdyAxIGlzXG4gICAqIDEwMCBweCB0aGVuIGZvbGxvd2luZyBzdHlsZXMgYXJlIGdlbmVyYXRlZDpcbiAgICpcbiAgICogdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgwcHgsIDBweCwgMHB4KTsgICAgLT4gIHJvdzBcbiAgICogdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgwcHgsIDMwcHgsIDBweCk7ICAgLT4gIHJvdzFcbiAgICogdHJhbnNmb3JtOiB0cmFuc2xhdGUzZCgwcHgsIDEzMHB4LCAwcHgpOyAgLT4gIHJvdzJcbiAgICpcbiAgICogUm93IGhlaWdodHMgaGF2ZSB0byBiZSBjYWxjdWxhdGVkIGJhc2VkIG9uIHRoZSByb3cgaGVpZ2h0cyBjYWNoZSBhcyB3ZSB3b250XG4gICAqIGJlIGFibGUgdG8gZGV0ZXJtaW5lIHdoaWNoIHJvdyBpcyBvZiB3aGF0IGhlaWdodCBiZWZvcmUgaGFuZC4gIEluIHRoZSBhYm92ZVxuICAgKiBjYXNlIHRoZSBwb3NpdGlvblkgb2YgdGhlIHRyYW5zbGF0ZTNkIGZvciByb3cyIHdvdWxkIGJlIHRoZSBzdW0gb2YgYWxsIHRoZVxuICAgKiBoZWlnaHRzIG9mIHRoZSByb3dzIGJlZm9yZSBpdCAoaS5lLiByb3cwIGFuZCByb3cxKS5cbiAgICpcbiAgICogQHBhcmFtIHJvd3MgdGhlIHJvdyB0aGF0IG5lZWRzIHRvIGJlIHBsYWNlZCBpbiB0aGUgMkQgc3BhY2UuXG4gICAqIEBwYXJhbSBpbmRleCBmb3IgZ2hvc3QgY2VsbHMgaW4gb3JkZXIgdG8gZ2V0IGNvcnJlY3QgcG9zaXRpb24gb2YgZ2hvc3Qgcm93XG4gICAqIEByZXR1cm5zIHRoZSBDU1MzIHN0eWxlIHRvIGJlIGFwcGxpZWRcbiAgICpcbiAgICogQG1lbWJlck9mIERhdGFUYWJsZUJvZHlDb21wb25lbnRcbiAgICovXG4gIGdldFJvd3NTdHlsZXMocm93czogYW55LCBpbmRleCA9IDApOiBhbnkge1xuICAgIGNvbnN0IHN0eWxlczogYW55ID0ge307XG5cbiAgICAvLyBvbmx5IGFkZCBzdHlsZXMgZm9yIHRoZSBncm91cCBpZiB0aGVyZSBpcyBhIGdyb3VwXG4gICAgaWYgKHRoaXMuZ3JvdXBlZFJvd3MpIHtcbiAgICAgIHN0eWxlcy53aWR0aCA9IHRoaXMuY29sdW1uR3JvdXBXaWR0aHMudG90YWw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2Nyb2xsYmFyViAmJiB0aGlzLnZpcnR1YWxpemF0aW9uKSB7XG4gICAgICBsZXQgaWR4ID0gMDtcblxuICAgICAgaWYgKHRoaXMuZ3JvdXBlZFJvd3MpIHtcbiAgICAgICAgLy8gR2V0IHRoZSBsYXRlc3Qgcm93IHJvd2luZGV4IGluIGEgZ3JvdXBcbiAgICAgICAgY29uc3Qgcm93ID0gcm93c1tyb3dzLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZHggPSByb3cgPyB0aGlzLmdldFJvd0luZGV4KHJvdykgOiAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHJvd3MpIHtcbiAgICAgICAgICBpZHggPSB0aGlzLmdldFJvd0luZGV4KHJvd3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFdoZW4gZ2hvc3QgY2VsbHMgYXJlIGVuYWJsZWQgdXNlIGluZGV4IHRvIGdldCB0aGUgcG9zaXRpb24gb2YgdGhlbVxuICAgICAgICAgIGlkeCA9IGluZGV4O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGNvbnN0IHBvcyA9IGlkeCAqIHJvd0hlaWdodDtcbiAgICAgIC8vIFRoZSBwb3NpdGlvbiBvZiB0aGlzIHJvdyB3b3VsZCBiZSB0aGUgc3VtIG9mIGFsbCByb3cgaGVpZ2h0c1xuICAgICAgLy8gdW50aWwgdGhlIHByZXZpb3VzIHJvdyBwb3NpdGlvbi5cbiAgICAgIGNvbnN0IHBvcyA9IHRoaXMucm93SGVpZ2h0c0NhY2hlLnF1ZXJ5KGlkeCAtIDEpO1xuXG4gICAgICB0cmFuc2xhdGVYWShzdHlsZXMsIDAsIHBvcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0eWxlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgYm90dG9tIHN1bW1hcnkgcm93IG9mZnNldCBmb3Igc2Nyb2xsYmFyIG1vZGUuXG4gICAqIEZvciBtb3JlIGluZm9ybWF0aW9uIGFib3V0IGNhY2hlIGFuZCBvZmZzZXQgY2FsY3VsYXRpb25cbiAgICogc2VlIGRlc2NyaXB0aW9uIGZvciBgZ2V0Um93c1N0eWxlc2AgbWV0aG9kXG4gICAqXG4gICAqIEByZXR1cm5zIHRoZSBDU1MzIHN0eWxlIHRvIGJlIGFwcGxpZWRcbiAgICpcbiAgICogQG1lbWJlck9mIERhdGFUYWJsZUJvZHlDb21wb25lbnRcbiAgICovXG4gIGdldEJvdHRvbVN1bW1hcnlSb3dTdHlsZXMoKTogYW55IHtcbiAgICBpZiAoIXRoaXMuc2Nyb2xsYmFyViB8fCAhdGhpcy5yb3dzIHx8ICF0aGlzLnJvd3MubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBzdHlsZXMgPSB7IHBvc2l0aW9uOiAnYWJzb2x1dGUnIH07XG4gICAgY29uc3QgcG9zID0gdGhpcy5yb3dIZWlnaHRzQ2FjaGUucXVlcnkodGhpcy5yb3dzLmxlbmd0aCAtIDEpO1xuXG4gICAgdHJhbnNsYXRlWFkoc3R5bGVzLCAwLCBwb3MpO1xuXG4gICAgcmV0dXJuIHN0eWxlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWRlcyB0aGUgbG9hZGluZyBpbmRpY2F0b3JcbiAgICovXG4gIGhpZGVJbmRpY2F0b3IoKTogdm9pZCB7XG4gICAgc2V0VGltZW91dCgoKSA9PiAodGhpcy5sb2FkaW5nSW5kaWNhdG9yID0gZmFsc2UpLCA1MDApO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGluZGV4IG9mIHRoZSByb3dzIGluIHRoZSB2aWV3cG9ydFxuICAgKi9cbiAgdXBkYXRlSW5kZXhlcygpOiB2b2lkIHtcbiAgICBsZXQgZmlyc3QgPSAwO1xuICAgIGxldCBsYXN0ID0gMDtcblxuICAgIGlmICh0aGlzLnNjcm9sbGJhclYpIHtcbiAgICAgIGlmICh0aGlzLnZpcnR1YWxpemF0aW9uKSB7XG4gICAgICAgIC8vIENhbGN1bGF0aW9uIG9mIHRoZSBmaXJzdCBhbmQgbGFzdCBpbmRleGVzIHdpbGwgYmUgYmFzZWQgb24gd2hlcmUgdGhlXG4gICAgICAgIC8vIHNjcm9sbFkgcG9zaXRpb24gd291bGQgYmUgYXQuICBUaGUgbGFzdCBpbmRleCB3b3VsZCBiZSB0aGUgb25lXG4gICAgICAgIC8vIHRoYXQgc2hvd3MgdXAgaW5zaWRlIHRoZSB2aWV3IHBvcnQgdGhlIGxhc3QuXG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHBhcnNlSW50KHRoaXMuYm9keUhlaWdodCwgMTApO1xuICAgICAgICBmaXJzdCA9IHRoaXMucm93SGVpZ2h0c0NhY2hlLmdldFJvd0luZGV4KHRoaXMub2Zmc2V0WSk7XG4gICAgICAgIGxhc3QgPSB0aGlzLnJvd0hlaWdodHNDYWNoZS5nZXRSb3dJbmRleChoZWlnaHQgKyB0aGlzLm9mZnNldFkpICsgMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHZpcnR1YWwgcm93cyBhcmUgbm90IG5lZWRlZFxuICAgICAgICAvLyBXZSByZW5kZXIgYWxsIGluIG9uZSBnb1xuICAgICAgICBmaXJzdCA9IDA7XG4gICAgICAgIGxhc3QgPSB0aGlzLnJvd0NvdW50O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgc2VydmVyIGlzIGhhbmRsaW5nIHBhZ2luZyBhbmQgd2lsbCBwYXNzIGFuIGFycmF5IHRoYXQgYmVnaW5zIHdpdGggdGhlXG4gICAgICAvLyBlbGVtZW50IGF0IGEgc3BlY2lmaWVkIG9mZnNldC4gIGZpcnN0IHNob3VsZCBhbHdheXMgYmUgMCB3aXRoIGV4dGVybmFsIHBhZ2luZy5cbiAgICAgIGlmICghdGhpcy5leHRlcm5hbFBhZ2luZykge1xuICAgICAgICBmaXJzdCA9IE1hdGgubWF4KHRoaXMub2Zmc2V0ICogdGhpcy5wYWdlU2l6ZSwgMCk7XG4gICAgICB9XG4gICAgICBsYXN0ID0gTWF0aC5taW4oZmlyc3QgKyB0aGlzLnBhZ2VTaXplLCB0aGlzLnJvd0NvdW50KTtcbiAgICB9XG5cbiAgICB0aGlzLmluZGV4ZXMgPSB7IGZpcnN0LCBsYXN0IH07XG4gIH1cblxuICAvKipcbiAgICogUmVmcmVzaGVzIHRoZSBmdWxsIFJvdyBIZWlnaHQgY2FjaGUuICBTaG91bGQgYmUgdXNlZFxuICAgKiB3aGVuIHRoZSBlbnRpcmUgcm93IGFycmF5IHN0YXRlIGhhcyBjaGFuZ2VkLlxuICAgKi9cbiAgcmVmcmVzaFJvd0hlaWdodENhY2hlKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5zY3JvbGxiYXJWIHx8ICh0aGlzLnNjcm9sbGJhclYgJiYgIXRoaXMudmlydHVhbGl6YXRpb24pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gY2xlYXIgdGhlIHByZXZpb3VzIHJvdyBoZWlnaHQgY2FjaGUgaWYgYWxyZWFkeSBwcmVzZW50LlxuICAgIC8vIHRoaXMgaXMgdXNlZnVsIGR1cmluZyBzb3J0cywgZmlsdGVycyB3aGVyZSB0aGUgc3RhdGUgb2YgdGhlXG4gICAgLy8gcm93cyBhcnJheSBpcyBjaGFuZ2VkLlxuICAgIHRoaXMucm93SGVpZ2h0c0NhY2hlLmNsZWFyQ2FjaGUoKTtcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIHRyZWUgb25seSBpZiB0aGVyZSBhcmUgcm93cyBpbnNpZGUgdGhlIHRyZWUuXG4gICAgaWYgKHRoaXMucm93cyAmJiB0aGlzLnJvd3MubGVuZ3RoKSB7XG4gICAgICBjb25zdCByb3dFeHBhbnNpb25zID0gbmV3IFNldCgpO1xuICAgICAgZm9yIChjb25zdCByb3cgb2YgdGhpcy5yb3dzKSB7XG4gICAgICAgIGlmICh0aGlzLmdldFJvd0V4cGFuZGVkKHJvdykpIHtcbiAgICAgICAgICByb3dFeHBhbnNpb25zLmFkZChyb3cpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMucm93SGVpZ2h0c0NhY2hlLmluaXRDYWNoZSh7XG4gICAgICAgIHJvd3M6IHRoaXMucm93cyxcbiAgICAgICAgcm93SGVpZ2h0OiB0aGlzLnJvd0hlaWdodCxcbiAgICAgICAgZGV0YWlsUm93SGVpZ2h0OiB0aGlzLmdldERldGFpbFJvd0hlaWdodCxcbiAgICAgICAgZXh0ZXJuYWxWaXJ0dWFsOiB0aGlzLnNjcm9sbGJhclYgJiYgdGhpcy5leHRlcm5hbFBhZ2luZyxcbiAgICAgICAgcm93Q291bnQ6IHRoaXMucm93Q291bnQsXG4gICAgICAgIHJvd0luZGV4ZXM6IHRoaXMucm93SW5kZXhlcyxcbiAgICAgICAgcm93RXhwYW5zaW9uc1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGluZGV4IGZvciB0aGUgdmlldyBwb3J0XG4gICAqL1xuICBnZXRBZGp1c3RlZFZpZXdQb3J0SW5kZXgoKTogbnVtYmVyIHtcbiAgICAvLyBDYXB0dXJlIHRoZSByb3cgaW5kZXggb2YgdGhlIGZpcnN0IHJvdyB0aGF0IGlzIHZpc2libGUgb24gdGhlIHZpZXdwb3J0LlxuICAgIC8vIElmIHRoZSBzY3JvbGwgYmFyIGlzIGp1c3QgYmVsb3cgdGhlIHJvdyB3aGljaCBpcyBoaWdobGlnaHRlZCB0aGVuIG1ha2UgdGhhdCBhcyB0aGVcbiAgICAvLyBmaXJzdCBpbmRleC5cbiAgICBjb25zdCB2aWV3UG9ydEZpcnN0Um93SW5kZXggPSB0aGlzLmluZGV4ZXMuZmlyc3Q7XG5cbiAgICBpZiAodGhpcy5zY3JvbGxiYXJWICYmIHRoaXMudmlydHVhbGl6YXRpb24pIHtcbiAgICAgIGNvbnN0IG9mZnNldFNjcm9sbCA9IHRoaXMucm93SGVpZ2h0c0NhY2hlLnF1ZXJ5KHZpZXdQb3J0Rmlyc3RSb3dJbmRleCAtIDEpO1xuICAgICAgcmV0dXJuIG9mZnNldFNjcm9sbCA8PSB0aGlzLm9mZnNldFkgPyB2aWV3UG9ydEZpcnN0Um93SW5kZXggLSAxIDogdmlld1BvcnRGaXJzdFJvd0luZGV4O1xuICAgIH1cblxuICAgIHJldHVybiB2aWV3UG9ydEZpcnN0Um93SW5kZXg7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlIHRoZSBFeHBhbnNpb24gb2YgdGhlIHJvdyBpLmUuIGlmIHRoZSByb3cgaXMgZXhwYW5kZWQgdGhlbiBpdCB3aWxsXG4gICAqIGNvbGxhcHNlIGFuZCB2aWNlIHZlcnNhLiAgIE5vdGUgdGhhdCB0aGUgZXhwYW5kZWQgc3RhdHVzIGlzIHN0b3JlZCBhc1xuICAgKiBhIHBhcnQgb2YgdGhlIHJvdyBvYmplY3QgaXRzZWxmIGFzIHdlIGhhdmUgdG8gcHJlc2VydmUgdGhlIGV4cGFuZGVkIHJvd1xuICAgKiBzdGF0dXMgaW4gY2FzZSBvZiBzb3J0aW5nIGFuZCBmaWx0ZXJpbmcgb2YgdGhlIHJvdyBzZXQuXG4gICAqL1xuICB0b2dnbGVSb3dFeHBhbnNpb24ocm93OiBhbnkpOiB2b2lkIHtcbiAgICAvLyBDYXB0dXJlIHRoZSByb3cgaW5kZXggb2YgdGhlIGZpcnN0IHJvdyB0aGF0IGlzIHZpc2libGUgb24gdGhlIHZpZXdwb3J0LlxuICAgIGNvbnN0IHZpZXdQb3J0Rmlyc3RSb3dJbmRleCA9IHRoaXMuZ2V0QWRqdXN0ZWRWaWV3UG9ydEluZGV4KCk7XG4gICAgY29uc3Qgcm93RXhwYW5kZWRJZHggPSB0aGlzLmdldFJvd0V4cGFuZGVkSWR4KHJvdywgdGhpcy5yb3dFeHBhbnNpb25zKTtcbiAgICBjb25zdCBleHBhbmRlZCA9IHJvd0V4cGFuZGVkSWR4ID4gLTE7XG5cbiAgICAvLyBJZiB0aGUgZGV0YWlsUm93SGVpZ2h0IGlzIGF1dG8gLS0+IG9ubHkgaW4gY2FzZSBvZiBub24tdmlydHVhbGl6ZWQgc2Nyb2xsXG4gICAgaWYgKHRoaXMuc2Nyb2xsYmFyViAmJiB0aGlzLnZpcnR1YWxpemF0aW9uKSB7XG4gICAgICBjb25zdCBkZXRhaWxSb3dIZWlnaHQgPSB0aGlzLmdldERldGFpbFJvd0hlaWdodChyb3cpICogKGV4cGFuZGVkID8gLTEgOiAxKTtcbiAgICAgIC8vIGNvbnN0IGlkeCA9IHRoaXMucm93SW5kZXhlcy5nZXQocm93KSB8fCAwO1xuICAgICAgY29uc3QgaWR4ID0gdGhpcy5nZXRSb3dJbmRleChyb3cpO1xuICAgICAgdGhpcy5yb3dIZWlnaHRzQ2FjaGUudXBkYXRlKGlkeCwgZGV0YWlsUm93SGVpZ2h0KTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGhlIHRvZ2dsZWQgcm93IGFuZCB1cGRhdGUgdGhpdmUgbmV2ZXJlIGhlaWdodHMgaW4gdGhlIGNhY2hlLlxuICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgdGhpcy5yb3dFeHBhbnNpb25zLnNwbGljZShyb3dFeHBhbmRlZElkeCwgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucm93RXhwYW5zaW9ucy5wdXNoKHJvdyk7XG4gICAgfVxuXG4gICAgdGhpcy5kZXRhaWxUb2dnbGUuZW1pdCh7XG4gICAgICByb3dzOiBbcm93XSxcbiAgICAgIGN1cnJlbnRJbmRleDogdmlld1BvcnRGaXJzdFJvd0luZGV4XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRXhwYW5kL0NvbGxhcHNlIGFsbCB0aGUgcm93cyBubyBtYXR0ZXIgd2hhdCB0aGVpciBzdGF0ZSBpcy5cbiAgICovXG4gIHRvZ2dsZUFsbFJvd3MoZXhwYW5kZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAvLyBjbGVhciBwcmV2IGV4cGFuc2lvbnNcbiAgICB0aGlzLnJvd0V4cGFuc2lvbnMgPSBbXTtcblxuICAgIC8vIENhcHR1cmUgdGhlIHJvdyBpbmRleCBvZiB0aGUgZmlyc3Qgcm93IHRoYXQgaXMgdmlzaWJsZSBvbiB0aGUgdmlld3BvcnQuXG4gICAgY29uc3Qgdmlld1BvcnRGaXJzdFJvd0luZGV4ID0gdGhpcy5nZXRBZGp1c3RlZFZpZXdQb3J0SW5kZXgoKTtcblxuICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgZm9yIChjb25zdCByb3cgb2YgdGhpcy5yb3dzKSB7XG4gICAgICAgIHRoaXMucm93RXhwYW5zaW9ucy5wdXNoKHJvdyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2Nyb2xsYmFyVikge1xuICAgICAgLy8gUmVmcmVzaCB0aGUgZnVsbCByb3cgaGVpZ2h0cyBjYWNoZSBzaW5jZSBldmVyeSByb3cgd2FzIGFmZmVjdGVkLlxuICAgICAgdGhpcy5yZWNhbGNMYXlvdXQoKTtcbiAgICB9XG5cbiAgICAvLyBFbWl0IGFsbCByb3dzIHRoYXQgaGF2ZSBiZWVuIGV4cGFuZGVkLlxuICAgIHRoaXMuZGV0YWlsVG9nZ2xlLmVtaXQoe1xuICAgICAgcm93czogdGhpcy5yb3dzLFxuICAgICAgY3VycmVudEluZGV4OiB2aWV3UG9ydEZpcnN0Um93SW5kZXhcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWNhbGN1bGF0ZXMgdGhlIHRhYmxlXG4gICAqL1xuICByZWNhbGNMYXlvdXQoKTogdm9pZCB7XG4gICAgdGhpcy5yZWZyZXNoUm93SGVpZ2h0Q2FjaGUoKTtcbiAgICB0aGlzLnVwZGF0ZUluZGV4ZXMoKTtcbiAgICB0aGlzLnVwZGF0ZVJvd3MoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFja3MgdGhlIGNvbHVtblxuICAgKi9cbiAgY29sdW1uVHJhY2tpbmdGbihpbmRleDogbnVtYmVyLCBjb2x1bW46IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIGNvbHVtbi4kJGlkO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHJvdyBwaW5uaW5nIGdyb3VwIHN0eWxlc1xuICAgKi9cbiAgc3R5bGVzQnlHcm91cChncm91cDogc3RyaW5nKSB7XG4gICAgY29uc3Qgd2lkdGhzID0gdGhpcy5jb2x1bW5Hcm91cFdpZHRocztcbiAgICBjb25zdCBvZmZzZXRYID0gdGhpcy5vZmZzZXRYO1xuXG4gICAgY29uc3Qgc3R5bGVzID0ge1xuICAgICAgd2lkdGg6IGAke3dpZHRoc1tncm91cF19cHhgXG4gICAgfTtcblxuICAgIGlmIChncm91cCA9PT0gJ2xlZnQnKSB7XG4gICAgICB0cmFuc2xhdGVYWShzdHlsZXMsIG9mZnNldFgsIDApO1xuICAgIH0gZWxzZSBpZiAoZ3JvdXAgPT09ICdyaWdodCcpIHtcbiAgICAgIGNvbnN0IGJvZHlXaWR0aCA9IHRoaXMuaW5uZXJXaWR0aDtcbiAgICAgIGNvbnN0IHRvdGFsRGlmZiA9IHdpZHRocy50b3RhbCAtIGJvZHlXaWR0aDtcbiAgICAgIGNvbnN0IG9mZnNldERpZmYgPSB0b3RhbERpZmYgLSBvZmZzZXRYO1xuICAgICAgY29uc3Qgb2Zmc2V0ID0gb2Zmc2V0RGlmZiAqIC0xO1xuICAgICAgdHJhbnNsYXRlWFkoc3R5bGVzLCBvZmZzZXQsIDApO1xuICAgIH1cblxuICAgIHJldHVybiBzdHlsZXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBpZiB0aGUgcm93IHdhcyBleHBhbmRlZCBhbmQgc2V0IGRlZmF1bHQgcm93IGV4cGFuc2lvbiB3aGVuIHJvdyBleHBhbnNpb24gaXMgZW1wdHlcbiAgICovXG4gIGdldFJvd0V4cGFuZGVkKHJvdzogYW55KTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMucm93RXhwYW5zaW9ucy5sZW5ndGggPT09IDAgJiYgdGhpcy5ncm91cEV4cGFuc2lvbkRlZmF1bHQpIHtcbiAgICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgdGhpcy5ncm91cGVkUm93cykge1xuICAgICAgICB0aGlzLnJvd0V4cGFuc2lvbnMucHVzaChncm91cCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0Um93RXhwYW5kZWRJZHgocm93LCB0aGlzLnJvd0V4cGFuc2lvbnMpID4gLTE7XG4gIH1cblxuICBnZXRSb3dFeHBhbmRlZElkeChyb3c6IGFueSwgZXhwYW5kZWQ6IGFueVtdKTogbnVtYmVyIHtcbiAgICBpZiAoIWV4cGFuZGVkIHx8ICFleHBhbmRlZC5sZW5ndGgpIHtyZXR1cm4gLTE7fVxuXG4gICAgY29uc3Qgcm93SWQgPSB0aGlzLnJvd0lkZW50aXR5KHJvdyk7XG4gICAgcmV0dXJuIGV4cGFuZGVkLmZpbmRJbmRleChyID0+IHtcbiAgICAgIGNvbnN0IGlkID0gdGhpcy5yb3dJZGVudGl0eShyKTtcbiAgICAgIHJldHVybiBpZCA9PT0gcm93SWQ7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgcm93IGluZGV4IGdpdmVuIGEgcm93XG4gICAqL1xuICBnZXRSb3dJbmRleChyb3c6IGFueSk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucm93SW5kZXhlcy5nZXQocm93KSB8fCAwO1xuICB9XG5cbiAgb25UcmVlQWN0aW9uKHJvdzogYW55KSB7XG4gICAgdGhpcy50cmVlQWN0aW9uLmVtaXQoeyByb3cgfSk7XG4gIH1cblxuICBkcmFnT3ZlcihldmVudDogRHJhZ0V2ZW50LCBkcm9wUm93KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLnJvd0RyYWdFdmVudHMuZW1pdCh7XG4gICAgICBldmVudCxcbiAgICAgIHNyY0VsZW1lbnQ6IHRoaXMuX2RyYWdnZWRSb3dFbGVtZW50LFxuICAgICAgZXZlbnRUeXBlOiAnZHJhZ292ZXInLFxuICAgICAgZHJhZ1JvdzogdGhpcy5fZHJhZ2dlZFJvdyxcbiAgICAgIGRyb3BSb3dcbiAgICB9KTtcbiAgfVxuXG4gIGRyYWcoZXZlbnQ6IERyYWdFdmVudCwgZHJhZ1Jvdywgcm93Q29tcG9uZW50KSB7XG4gICAgdGhpcy5fZHJhZ2dlZFJvdyA9IGRyYWdSb3c7XG4gICAgdGhpcy5fZHJhZ2dlZFJvd0VsZW1lbnQgPSByb3dDb21wb25lbnQuX2VsZW1lbnQ7XG4gICAgdGhpcy5yb3dEcmFnRXZlbnRzLmVtaXQoe1xuICAgICAgZXZlbnQsXG4gICAgICBzcmNFbGVtZW50OiB0aGlzLl9kcmFnZ2VkUm93RWxlbWVudCxcbiAgICAgIGV2ZW50VHlwZTogJ2RyYWdzdGFydCcsXG4gICAgICBkcmFnUm93XG4gICAgfSk7XG4gIH1cblxuICBkcm9wKGV2ZW50OiBEcmFnRXZlbnQsIGRyb3BSb3csIHJvd0NvbXBvbmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5yb3dEcmFnRXZlbnRzLmVtaXQoe1xuICAgICAgZXZlbnQsXG4gICAgICBzcmNFbGVtZW50OiB0aGlzLl9kcmFnZ2VkUm93RWxlbWVudCxcbiAgICAgIHRhcmdldEVsZW1lbnQ6IHJvd0NvbXBvbmVudC5fZWxlbWVudCxcbiAgICAgIGV2ZW50VHlwZTogJ2Ryb3AnLFxuICAgICAgZHJhZ1JvdzogdGhpcy5fZHJhZ2dlZFJvdyxcbiAgICAgIGRyb3BSb3dcbiAgICB9KTtcbiAgfVxuXG4gIGRyYWdFbnRlcihldmVudDogRHJhZ0V2ZW50LCBkcm9wUm93LCByb3dDb21wb25lbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMucm93RHJhZ0V2ZW50cy5lbWl0KHtcbiAgICAgIGV2ZW50LFxuICAgICAgc3JjRWxlbWVudDogdGhpcy5fZHJhZ2dlZFJvd0VsZW1lbnQsXG4gICAgICB0YXJnZXRFbGVtZW50OiByb3dDb21wb25lbnQuX2VsZW1lbnQsXG4gICAgICBldmVudFR5cGU6ICdkcmFnZW50ZXInLFxuICAgICAgZHJhZ1JvdzogdGhpcy5fZHJhZ2dlZFJvdyxcbiAgICAgIGRyb3BSb3dcbiAgICB9KTtcbiAgfVxuXG4gIGRyYWdMZWF2ZShldmVudDogRHJhZ0V2ZW50LCBkcm9wUm93LCByb3dDb21wb25lbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMucm93RHJhZ0V2ZW50cy5lbWl0KHtcbiAgICAgIGV2ZW50LFxuICAgICAgc3JjRWxlbWVudDogdGhpcy5fZHJhZ2dlZFJvd0VsZW1lbnQsXG4gICAgICB0YXJnZXRFbGVtZW50OiByb3dDb21wb25lbnQuX2VsZW1lbnQsXG4gICAgICBldmVudFR5cGU6ICdkcmFnbGVhdmUnLFxuICAgICAgZHJhZ1JvdzogdGhpcy5fZHJhZ2dlZFJvdyxcbiAgICAgIGRyb3BSb3dcbiAgICB9KTtcbiAgfVxuXG4gIGRyYWdFbmQoZXZlbnQ6IERyYWdFdmVudCwgZHJhZ1Jvdykge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5yb3dEcmFnRXZlbnRzLmVtaXQoe1xuICAgICAgZXZlbnQsXG4gICAgICBzcmNFbGVtZW50OiB0aGlzLl9kcmFnZ2VkUm93RWxlbWVudCxcbiAgICAgIGV2ZW50VHlwZTogJ2RyYWdlbmQnLFxuICAgICAgZHJhZ1Jvd1xuICAgIH0pO1xuICAgIHRoaXMuX2RyYWdnZWRSb3cgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fZHJhZ2dlZFJvd0VsZW1lbnQgPSB1bmRlZmluZWQ7XG4gIH1cbn1cbiJdfQ==