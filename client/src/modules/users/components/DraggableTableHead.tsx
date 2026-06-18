import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { useTheme } from '@mui/material';
import { Theme } from '@mui/material/styles';

interface Column {
  id: string;
  label: string;
  sortable: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
}

interface DraggableTableCellProps {
  column: Column;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
  theme: Theme;
}

const DraggableTableCell: React.FC<DraggableTableCellProps> = ({
  column,
  sortBy,
  sortOrder,
  onSort,
  theme,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  };

  return (
    <TableCell
      ref={setNodeRef}
      style={style}
      align={column.align}
      width={column.width}
      {...attributes}
      {...listeners}
    >
      {column.sortable ? (
        <TableSortLabel
          active={sortBy === column.id}
          direction={sortBy === column.id ? sortOrder : 'asc'}
          onClick={() => onSort?.(column.id)}
          sx={{
            color: sortBy === column.id ? theme.palette.primary.light : 'inherit',
            '&:hover': {
              color: theme.palette.primary.light,
            },
            '&.Mui-active': {
              color: theme.palette.primary.light,
            },
            '& .MuiTableSortLabel-icon': {
              color: `${theme.palette.primary.main} !important`,
            },
          }}
        >
          {column.label}
        </TableSortLabel>
      ) : (
        column.label
      )}
    </TableCell>
  );
};

interface DraggableTableHeadProps {
  columns: Column[];
  columnOrder: string[];
  sortBy: string | null;
  sortOrder: 'asc' | 'desc';
  onSort: (columnId: string) => void;
  onReorder: (newOrder: string[]) => void;
}

const DraggableTableHead: React.FC<DraggableTableHeadProps> = ({
  columns,
  columnOrder,
  sortBy,
  sortOrder,
  onSort,
  onReorder,
}) => {
  const theme = useTheme();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over.id as string);
      const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  const orderedColumns = columnOrder.length > 0
    ? columnOrder.map(id => columns.find(col => col.id === id)).filter(Boolean) as Column[]
    : columns;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <TableHead>
        <TableRow
          sx={{
            '& th': {
              backgroundColor: '#171717',
              backgroundImage:
                'linear-gradient(180deg, rgba(255, 140, 0, 0.14), rgba(0, 0, 0, 0) 70%)',
              color: theme.palette.text.primary,
              fontWeight: 700,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              transition: 'color 0.2s ease, background-color 0.2s ease',
              '&:hover': {
                color: theme.palette.primary.light,
                backgroundColor: 'rgba(255, 140, 0, 0.12)',
              },
            },
          }}
        >
          <SortableContext
            items={columnOrder.length > 0 ? columnOrder : columns.map(c => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {orderedColumns.map((column) => (
              <DraggableTableCell
                key={column.id}
                column={column}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                theme={theme}
              />
            ))}
          </SortableContext>
        </TableRow>
      </TableHead>
    </DndContext>
  );
};

export default DraggableTableHead;