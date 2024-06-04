import { columnsByPin, columnsTotalWidth } from './column';
/**
 * Calculates the Total Flex Grow
 */
export function getTotalFlexGrow(columns) {
    let totalFlexGrow = 0;
    for (const c of columns) {
        totalFlexGrow += c.flexGrow || 0;
    }
    return totalFlexGrow;
}
/**
 * Adjusts the column widths.
 * Inspired by: https://github.com/facebook/fixed-data-table/blob/master/src/FixedDataTableWidthHelper.js
 */
export function adjustColumnWidths(allColumns, expectedWidth) {
    const columnsWidth = columnsTotalWidth(allColumns);
    const totalFlexGrow = getTotalFlexGrow(allColumns);
    const colsByGroup = columnsByPin(allColumns);
    if (columnsWidth !== expectedWidth) {
        scaleColumns(colsByGroup, expectedWidth, totalFlexGrow);
    }
}
/**
 * Resizes columns based on the flexGrow property, while respecting manually set widths
 */
function scaleColumns(colsByGroup, maxWidth, totalFlexGrow) {
    // calculate total width and flexgrow points for columns that can be resized
    for (const attr in colsByGroup) {
        if (colsByGroup.hasOwnProperty(attr)) {
            for (const column of colsByGroup[attr]) {
                if (column.$$oldWidth) {
                    // when manually resized, switch off auto-resize
                    column.canAutoResize = false;
                }
                if (!column.canAutoResize) {
                    maxWidth -= column.width;
                    totalFlexGrow -= column.flexGrow ? column.flexGrow : 0;
                }
                else {
                    column.width = 0;
                }
            }
        }
    }
    const hasMinWidth = {};
    let remainingWidth = maxWidth;
    // resize columns until no width is left to be distributed
    do {
        const widthPerFlexPoint = remainingWidth / totalFlexGrow;
        remainingWidth = 0;
        for (const attr in colsByGroup) {
            if (colsByGroup.hasOwnProperty(attr)) {
                for (const column of colsByGroup[attr]) {
                    // if the column can be resize and it hasn't reached its minimum width yet
                    if (column.canAutoResize && !hasMinWidth[column.prop]) {
                        const newWidth = column.width + column.flexGrow * widthPerFlexPoint;
                        if (column.minWidth !== undefined && newWidth < column.minWidth) {
                            remainingWidth += newWidth - column.minWidth;
                            column.width = column.minWidth;
                            hasMinWidth[column.prop] = true;
                        }
                        else {
                            column.width = newWidth;
                        }
                    }
                }
            }
        }
    } while (remainingWidth !== 0);
    // Adjust for any remaining offset in computed widths vs maxWidth
    const columns = Object.values(colsByGroup).reduce((acc, col) => acc.concat(col), []);
    const totalWidthAchieved = columns.reduce((acc, col) => acc + col.width, 0);
    const delta = maxWidth - totalWidthAchieved;
    if (delta === 0) {
        return;
    }
    // adjust the first column that can be auto-resized respecting the min/max widths
    for (const col of columns.filter(c => c.canAutoResize).sort((a, b) => a.width - b.width)) {
        if ((delta > 0 && (!col.maxWidth || col.width + delta <= col.maxWidth)) ||
            (delta < 0 && (!col.minWidth || col.width + delta >= col.minWidth))) {
            col.width += delta;
            break;
        }
    }
}
/**
 * Forces the width of the columns to
 * distribute equally but overflowing when necessary
 *
 * Rules:
 *
 *  - If combined withs are less than the total width of the grid,
 *    proportion the widths given the min / max / normal widths to fill the width.
 *
 *  - If the combined widths, exceed the total width of the grid,
 *    use the standard widths.
 *
 *  - If a column is resized, it should always use that width
 *
 *  - The proportional widths should never fall below min size if specified.
 *
 *  - If the grid starts off small but then becomes greater than the size ( + / - )
 *    the width should use the original width; not the newly proportioned widths.
 */
export function forceFillColumnWidths(allColumns, expectedWidth, startIdx, allowBleed, defaultColWidth = 300) {
    const columnsToResize = allColumns.slice(startIdx + 1, allColumns.length).filter(c => c.canAutoResize !== false);
    for (const column of columnsToResize) {
        if (!column.$$oldWidth) {
            column.$$oldWidth = column.width;
        }
    }
    let additionWidthPerColumn = 0;
    let exceedsWindow = false;
    let contentWidth = getContentWidth(allColumns, defaultColWidth);
    let remainingWidth = expectedWidth - contentWidth;
    const columnsProcessed = [];
    const remainingWidthLimit = 1; // when to stop
    // This loop takes care of the
    do {
        additionWidthPerColumn = remainingWidth / columnsToResize.length;
        exceedsWindow = contentWidth >= expectedWidth;
        for (const column of columnsToResize) {
            if (exceedsWindow && allowBleed) {
                column.width = column.$$oldWidth || column.width || defaultColWidth;
            }
            else {
                const newSize = (column.width || defaultColWidth) + additionWidthPerColumn;
                if (column.minWidth && newSize < column.minWidth) {
                    column.width = column.minWidth;
                    columnsProcessed.push(column);
                }
                else if (column.maxWidth && newSize > column.maxWidth) {
                    column.width = column.maxWidth;
                    columnsProcessed.push(column);
                }
                else {
                    column.width = newSize;
                }
            }
            column.width = Math.max(0, column.width);
        }
        contentWidth = getContentWidth(allColumns);
        remainingWidth = expectedWidth - contentWidth;
        removeProcessedColumns(columnsToResize, columnsProcessed);
    } while (remainingWidth > remainingWidthLimit && columnsToResize.length !== 0);
    // reset so we don't have stale values
    for (const column of columnsToResize) {
        column.$$oldWidth = 0;
    }
}
/**
 * Remove the processed columns from the current active columns.
 */
function removeProcessedColumns(columnsToResize, columnsProcessed) {
    for (const column of columnsProcessed) {
        const index = columnsToResize.indexOf(column);
        columnsToResize.splice(index, 1);
    }
}
/**
 * Gets the width of the columns
 */
function getContentWidth(allColumns, defaultColWidth = 300) {
    let contentWidth = 0;
    for (const column of allColumns) {
        contentWidth += column.width || defaultColWidth;
    }
    return contentWidth;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1kYXRhdGFibGUvc3JjL2xpYi91dGlscy9tYXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFM0Q7O0dBRUc7QUFDSCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsT0FBYztJQUM3QyxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7SUFFdEIsS0FBSyxNQUFNLENBQUMsSUFBSSxPQUFPLEVBQUU7UUFDdkIsYUFBYSxJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO0tBQ2xDO0lBRUQsT0FBTyxhQUFhLENBQUM7QUFDdkIsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxVQUFlLEVBQUUsYUFBa0I7SUFDcEUsTUFBTSxZQUFZLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkQsTUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkQsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRTdDLElBQUksWUFBWSxLQUFLLGFBQWEsRUFBRTtRQUNsQyxZQUFZLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztLQUN6RDtBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsWUFBWSxDQUFDLFdBQWdCLEVBQUUsUUFBYSxFQUFFLGFBQWtCO0lBQ3ZFLDRFQUE0RTtJQUM1RSxLQUFLLE1BQU0sSUFBSSxJQUFJLFdBQVcsRUFBRTtRQUM5QixJQUFJLFdBQVcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDcEMsS0FBSyxNQUFNLE1BQU0sSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RDLElBQUks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LE1BQU0sSUFBSSxlQUFlLEVBQUU7UUFDcEMsTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7S0FDdkI7QUFDSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLHNCQUFzQixDQUFDLGVBQXNCLEVBQUUsZ0JBQXVCO0lBQzdFLEtBQUssTUFBTSxNQUFNLElBQUksZ0JBQWdCLEVBQUU7UUFDckMsTUFBTSxLQUFLLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QyxlQUFlLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNsQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsZUFBZSxDQUFDLFVBQWUsRUFBRSxrQkFBMEIsR0FBRztJQUNyRSxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7SUFFckIsS0FBSyxNQUFNLE1BQU0sSUFBSSxVQUFVLEVBQUU7UUFDL0IsWUFBWSxJQUFJLE1BQU0sQ0FBQyxLQUFLLElBQUksZUFBZSxDQUFDO0tBQ2pEO0lBRUQsT0FBTyxZQUFZLENBQUM7QUFDdEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNvbHVtbnNCeVBpbiwgY29sdW1uc1RvdGFsV2lkdGggfSBmcm9tICcuL2NvbHVtbic7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgVG90YWwgRmxleCBHcm93XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb3RhbEZsZXhHcm93KGNvbHVtbnM6IGFueVtdKSB7XG4gIGxldCB0b3RhbEZsZXhHcm93ID0gMDtcblxuICBmb3IgKGNvbnN0IGMgb2YgY29sdW1ucykge1xuICAgIHRvdGFsRmxleEdyb3cgKz0gYy5mbGV4R3JvdyB8fCAwO1xuICB9XG5cbiAgcmV0dXJuIHRvdGFsRmxleEdyb3c7XG59XG5cbi8qKlxuICogQWRqdXN0cyB0aGUgY29sdW1uIHdpZHRocy5cbiAqIEluc3BpcmVkIGJ5OiBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZml4ZWQtZGF0YS10YWJsZS9ibG9iL21hc3Rlci9zcmMvRml4ZWREYXRhVGFibGVXaWR0aEhlbHBlci5qc1xuICovXG5leHBvcnQgZnVuY3Rpb24gYWRqdXN0Q29sdW1uV2lkdGhzKGFsbENvbHVtbnM6IGFueSwgZXhwZWN0ZWRXaWR0aDogYW55KSB7XG4gIGNvbnN0IGNvbHVtbnNXaWR0aCA9IGNvbHVtbnNUb3RhbFdpZHRoKGFsbENvbHVtbnMpO1xuICBjb25zdCB0b3RhbEZsZXhHcm93ID0gZ2V0VG90YWxGbGV4R3JvdyhhbGxDb2x1bW5zKTtcbiAgY29uc3QgY29sc0J5R3JvdXAgPSBjb2x1bW5zQnlQaW4oYWxsQ29sdW1ucyk7XG5cbiAgaWYgKGNvbHVtbnNXaWR0aCAhPT0gZXhwZWN0ZWRXaWR0aCkge1xuICAgIHNjYWxlQ29sdW1ucyhjb2xzQnlHcm91cCwgZXhwZWN0ZWRXaWR0aCwgdG90YWxGbGV4R3Jvdyk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXNpemVzIGNvbHVtbnMgYmFzZWQgb24gdGhlIGZsZXhHcm93IHByb3BlcnR5LCB3aGlsZSByZXNwZWN0aW5nIG1hbnVhbGx5IHNldCB3aWR0aHNcbiAqL1xuZnVuY3Rpb24gc2NhbGVDb2x1bW5zKGNvbHNCeUdyb3VwOiBhbnksIG1heFdpZHRoOiBhbnksIHRvdGFsRmxleEdyb3c6IGFueSkge1xuICAvLyBjYWxjdWxhdGUgdG90YWwgd2lkdGggYW5kIGZsZXhncm93IHBvaW50cyBmb3IgY29sdW1ucyB0aGF0IGNhbiBiZSByZXNpemVkXG4gIGZvciAoY29uc3QgYXR0ciBpbiBjb2xzQnlHcm91cCkge1xuICAgIGlmIChjb2xzQnlHcm91cC5oYXNPd25Qcm9wZXJ0eShhdHRyKSkge1xuICAgICAgZm9yIChjb25zdCBjb2x1bW4gb2YgY29sc0J5R3JvdXBbYXR0cl0pIHtcbiAgICAgICAgaWYgKGNvbHVtbi4kJG9sZFdpZHRoKSB7XG4gICAgICAgICAgLy8gd2hlbiBtYW51YWxseSByZXNpemVkLCBzd2l0Y2ggb2ZmIGF1dG8tcmVzaXplXG4gICAgICAgICAgY29sdW1uLmNhbkF1dG9SZXNpemUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbHVtbi5jYW5BdXRvUmVzaXplKSB7XG4gICAgICAgICAgbWF4V2lkdGggLT0gY29sdW1uLndpZHRoO1xuICAgICAgICAgIHRvdGFsRmxleEdyb3cgLT0gY29sdW1uLmZsZXhHcm93ID8gY29sdW1uLmZsZXhHcm93IDogMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb2x1bW4ud2lkdGggPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgaGFzTWluV2lkdGggPSB7fTtcbiAgbGV0IHJlbWFpbmluZ1dpZHRoID0gbWF4V2lkdGg7XG5cbiAgLy8gcmVzaXplIGNvbHVtbnMgdW50aWwgbm8gd2lkdGggaXMgbGVmdCB0byBiZSBkaXN0cmlidXRlZFxuICBkbyB7XG4gICAgY29uc3Qgd2lkdGhQZXJGbGV4UG9pbnQgPSByZW1haW5pbmdXaWR0aCAvIHRvdGFsRmxleEdyb3c7XG4gICAgcmVtYWluaW5nV2lkdGggPSAwO1xuXG4gICAgZm9yIChjb25zdCBhdHRyIGluIGNvbHNCeUdyb3VwKSB7XG4gICAgICBpZiAoY29sc0J5R3JvdXAuaGFzT3duUHJvcGVydHkoYXR0cikpIHtcbiAgICAgICAgZm9yIChjb25zdCBjb2x1bW4gb2YgY29sc0J5R3JvdXBbYXR0cl0pIHtcbiAgICAgICAgICAvLyBpZiB0aGUgY29sdW1uIGNhbiBiZSByZXNpemUgYW5kIGl0IGhhc24ndCByZWFjaGVkIGl0cyBtaW5pbXVtIHdpZHRoIHlldFxuICAgICAgICAgIGlmIChjb2x1bW4uY2FuQXV0b1Jlc2l6ZSAmJiAhaGFzTWluV2lkdGhbY29sdW1uLnByb3BdKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdXaWR0aCA9IGNvbHVtbi53aWR0aCArIGNvbHVtbi5mbGV4R3JvdyAqIHdpZHRoUGVyRmxleFBvaW50O1xuICAgICAgICAgICAgaWYgKGNvbHVtbi5taW5XaWR0aCAhPT0gdW5kZWZpbmVkICYmIG5ld1dpZHRoIDwgY29sdW1uLm1pbldpZHRoKSB7XG4gICAgICAgICAgICAgIHJlbWFpbmluZ1dpZHRoICs9IG5ld1dpZHRoIC0gY29sdW1uLm1pbldpZHRoO1xuICAgICAgICAgICAgICBjb2x1bW4ud2lkdGggPSBjb2x1bW4ubWluV2lkdGg7XG4gICAgICAgICAgICAgIGhhc01pbldpZHRoW2NvbHVtbi5wcm9wXSA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb2x1bW4ud2lkdGggPSBuZXdXaWR0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gd2hpbGUgKHJlbWFpbmluZ1dpZHRoICE9PSAwKTtcblxuICAvLyBBZGp1c3QgZm9yIGFueSByZW1haW5pbmcgb2Zmc2V0IGluIGNvbXB1dGVkIHdpZHRocyB2cyBtYXhXaWR0aFxuICBjb25zdCBjb2x1bW5zID0gT2JqZWN0LnZhbHVlczx7XG4gICAgd2lkdGg6IG51bWJlcixcbiAgICBjYW5BdXRvUmVzaXplOiBib29sZWFuLFxuICAgIG1pbldpZHRoOiBudW1iZXIsXG4gICAgbWF4V2lkdGg6IG51bWJlclxuICB9Pihjb2xzQnlHcm91cCkucmVkdWNlKChhY2MsIGNvbCkgPT4gYWNjLmNvbmNhdChjb2wpLCBbXSk7XG5cbiAgY29uc3QgdG90YWxXaWR0aEFjaGlldmVkID0gY29sdW1ucy5yZWR1Y2UoKGFjYywgY29sKSA9PiBhY2MgKyBjb2wud2lkdGgsIDApO1xuICBjb25zdCBkZWx0YSA9IG1heFdpZHRoIC0gdG90YWxXaWR0aEFjaGlldmVkO1xuXG4gIGlmIChkZWx0YSA9PT0gMCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgLy8gYWRqdXN0IHRoZSBmaXJzdCBjb2x1bW4gdGhhdCBjYW4gYmUgYXV0by1yZXNpemVkIHJlc3BlY3RpbmcgdGhlIG1pbi9tYXggd2lkdGhzXG4gIGZvciAoY29uc3QgY29sIG9mIGNvbHVtbnMuZmlsdGVyKGMgPT4gYy5jYW5BdXRvUmVzaXplKS5zb3J0KChhLCBiKSA9PiBhLndpZHRoIC0gYi53aWR0aCkpIHtcbiAgICBpZiAoXG4gICAgICAoZGVsdGEgPiAwICYmICghY29sLm1heFdpZHRoIHx8IGNvbC53aWR0aCArIGRlbHRhIDw9IGNvbC5tYXhXaWR0aCkpIHx8XG4gICAgICAoZGVsdGEgPCAwICYmICghY29sLm1pbldpZHRoIHx8IGNvbC53aWR0aCArIGRlbHRhID49IGNvbC5taW5XaWR0aCkpXG4gICAgKSB7XG4gICAgICBjb2wud2lkdGggKz0gZGVsdGE7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBGb3JjZXMgdGhlIHdpZHRoIG9mIHRoZSBjb2x1bW5zIHRvXG4gKiBkaXN0cmlidXRlIGVxdWFsbHkgYnV0IG92ZXJmbG93aW5nIHdoZW4gbmVjZXNzYXJ5XG4gKlxuICogUnVsZXM6XG4gKlxuICogIC0gSWYgY29tYmluZWQgd2l0aHMgYXJlIGxlc3MgdGhhbiB0aGUgdG90YWwgd2lkdGggb2YgdGhlIGdyaWQsXG4gKiAgICBwcm9wb3J0aW9uIHRoZSB3aWR0aHMgZ2l2ZW4gdGhlIG1pbiAvIG1heCAvIG5vcm1hbCB3aWR0aHMgdG8gZmlsbCB0aGUgd2lkdGguXG4gKlxuICogIC0gSWYgdGhlIGNvbWJpbmVkIHdpZHRocywgZXhjZWVkIHRoZSB0b3RhbCB3aWR0aCBvZiB0aGUgZ3JpZCxcbiAqICAgIHVzZSB0aGUgc3RhbmRhcmQgd2lkdGhzLlxuICpcbiAqICAtIElmIGEgY29sdW1uIGlzIHJlc2l6ZWQsIGl0IHNob3VsZCBhbHdheXMgdXNlIHRoYXQgd2lkdGhcbiAqXG4gKiAgLSBUaGUgcHJvcG9ydGlvbmFsIHdpZHRocyBzaG91bGQgbmV2ZXIgZmFsbCBiZWxvdyBtaW4gc2l6ZSBpZiBzcGVjaWZpZWQuXG4gKlxuICogIC0gSWYgdGhlIGdyaWQgc3RhcnRzIG9mZiBzbWFsbCBidXQgdGhlbiBiZWNvbWVzIGdyZWF0ZXIgdGhhbiB0aGUgc2l6ZSAoICsgLyAtIClcbiAqICAgIHRoZSB3aWR0aCBzaG91bGQgdXNlIHRoZSBvcmlnaW5hbCB3aWR0aDsgbm90IHRoZSBuZXdseSBwcm9wb3J0aW9uZWQgd2lkdGhzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9yY2VGaWxsQ29sdW1uV2lkdGhzKFxuICBhbGxDb2x1bW5zOiBhbnlbXSxcbiAgZXhwZWN0ZWRXaWR0aDogbnVtYmVyLFxuICBzdGFydElkeDogbnVtYmVyLFxuICBhbGxvd0JsZWVkOiBib29sZWFuLFxuICBkZWZhdWx0Q29sV2lkdGg6IG51bWJlciA9IDMwMFxuKSB7XG4gIGNvbnN0IGNvbHVtbnNUb1Jlc2l6ZSA9IGFsbENvbHVtbnMuc2xpY2Uoc3RhcnRJZHggKyAxLCBhbGxDb2x1bW5zLmxlbmd0aCkuZmlsdGVyKGMgPT4gYy5jYW5BdXRvUmVzaXplICE9PSBmYWxzZSk7XG5cbiAgZm9yIChjb25zdCBjb2x1bW4gb2YgY29sdW1uc1RvUmVzaXplKSB7XG4gICAgaWYgKCFjb2x1bW4uJCRvbGRXaWR0aCkge1xuICAgICAgY29sdW1uLiQkb2xkV2lkdGggPSBjb2x1bW4ud2lkdGg7XG4gICAgfVxuICB9XG5cbiAgbGV0IGFkZGl0aW9uV2lkdGhQZXJDb2x1bW4gPSAwO1xuICBsZXQgZXhjZWVkc1dpbmRvdyA9IGZhbHNlO1xuICBsZXQgY29udGVudFdpZHRoID0gZ2V0Q29udGVudFdpZHRoKGFsbENvbHVtbnMsIGRlZmF1bHRDb2xXaWR0aCk7XG4gIGxldCByZW1haW5pbmdXaWR0aCA9IGV4cGVjdGVkV2lkdGggLSBjb250ZW50V2lkdGg7XG4gIGNvbnN0IGNvbHVtbnNQcm9jZXNzZWQ6IGFueVtdID0gW107XG4gIGNvbnN0IHJlbWFpbmluZ1dpZHRoTGltaXQgPSAxOyAvLyB3aGVuIHRvIHN0b3BcblxuICAvLyBUaGlzIGxvb3AgdGFrZXMgY2FyZSBvZiB0aGVcbiAgZG8ge1xuICAgIGFkZGl0aW9uV2lkdGhQZXJDb2x1bW4gPSByZW1haW5pbmdXaWR0aCAvIGNvbHVtbnNUb1Jlc2l6ZS5sZW5ndGg7XG4gICAgZXhjZWVkc1dpbmRvdyA9IGNvbnRlbnRXaWR0aCA+PSBleHBlY3RlZFdpZHRoO1xuXG4gICAgZm9yIChjb25zdCBjb2x1bW4gb2YgY29sdW1uc1RvUmVzaXplKSB7XG4gICAgICBpZiAoZXhjZWVkc1dpbmRvdyAmJiBhbGxvd0JsZWVkKSB7XG4gICAgICAgIGNvbHVtbi53aWR0aCA9IGNvbHVtbi4kJG9sZFdpZHRoIHx8IGNvbHVtbi53aWR0aCB8fCBkZWZhdWx0Q29sV2lkdGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBuZXdTaXplID0gKGNvbHVtbi53aWR0aCB8fCBkZWZhdWx0Q29sV2lkdGgpICsgYWRkaXRpb25XaWR0aFBlckNvbHVtbjtcblxuICAgICAgICBpZiAoY29sdW1uLm1pbldpZHRoICYmIG5ld1NpemUgPCBjb2x1bW4ubWluV2lkdGgpIHtcbiAgICAgICAgICBjb2x1bW4ud2lkdGggPSBjb2x1bW4ubWluV2lkdGg7XG4gICAgICAgICAgY29sdW1uc1Byb2Nlc3NlZC5wdXNoKGNvbHVtbik7XG4gICAgICAgIH0gZWxzZSBpZiAoY29sdW1uLm1heFdpZHRoICYmIG5ld1NpemUgPiBjb2x1bW4ubWF4V2lkdGgpIHtcbiAgICAgICAgICBjb2x1bW4ud2lkdGggPSBjb2x1bW4ubWF4V2lkdGg7XG4gICAgICAgICAgY29sdW1uc1Byb2Nlc3NlZC5wdXNoKGNvbHVtbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29sdW1uLndpZHRoID0gbmV3U2l6ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb2x1bW4ud2lkdGggPSBNYXRoLm1heCgwLCBjb2x1bW4ud2lkdGgpO1xuICAgIH1cblxuICAgIGNvbnRlbnRXaWR0aCA9IGdldENvbnRlbnRXaWR0aChhbGxDb2x1bW5zKTtcbiAgICByZW1haW5pbmdXaWR0aCA9IGV4cGVjdGVkV2lkdGggLSBjb250ZW50V2lkdGg7XG4gICAgcmVtb3ZlUHJvY2Vzc2VkQ29sdW1ucyhjb2x1bW5zVG9SZXNpemUsIGNvbHVtbnNQcm9jZXNzZWQpO1xuICB9IHdoaWxlIChyZW1haW5pbmdXaWR0aCA+IHJlbWFpbmluZ1dpZHRoTGltaXQgJiYgY29sdW1uc1RvUmVzaXplLmxlbmd0aCAhPT0gMCk7XG5cbiAgLy8gcmVzZXQgc28gd2UgZG9uJ3QgaGF2ZSBzdGFsZSB2YWx1ZXNcbiAgZm9yIChjb25zdCBjb2x1bW4gb2YgY29sdW1uc1RvUmVzaXplKSB7XG4gICAgY29sdW1uLiQkb2xkV2lkdGggPSAwO1xuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBwcm9jZXNzZWQgY29sdW1ucyBmcm9tIHRoZSBjdXJyZW50IGFjdGl2ZSBjb2x1bW5zLlxuICovXG5mdW5jdGlvbiByZW1vdmVQcm9jZXNzZWRDb2x1bW5zKGNvbHVtbnNUb1Jlc2l6ZTogYW55W10sIGNvbHVtbnNQcm9jZXNzZWQ6IGFueVtdKSB7XG4gIGZvciAoY29uc3QgY29sdW1uIG9mIGNvbHVtbnNQcm9jZXNzZWQpIHtcbiAgICBjb25zdCBpbmRleCA9IGNvbHVtbnNUb1Jlc2l6ZS5pbmRleE9mKGNvbHVtbik7XG4gICAgY29sdW1uc1RvUmVzaXplLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXRzIHRoZSB3aWR0aCBvZiB0aGUgY29sdW1uc1xuICovXG5mdW5jdGlvbiBnZXRDb250ZW50V2lkdGgoYWxsQ29sdW1uczogYW55LCBkZWZhdWx0Q29sV2lkdGg6IG51bWJlciA9IDMwMCk6IG51bWJlciB7XG4gIGxldCBjb250ZW50V2lkdGggPSAwO1xuXG4gIGZvciAoY29uc3QgY29sdW1uIG9mIGFsbENvbHVtbnMpIHtcbiAgICBjb250ZW50V2lkdGggKz0gY29sdW1uLndpZHRoIHx8IGRlZmF1bHRDb2xXaWR0aDtcbiAgfVxuXG4gIHJldHVybiBjb250ZW50V2lkdGg7XG59XG4iXX0=