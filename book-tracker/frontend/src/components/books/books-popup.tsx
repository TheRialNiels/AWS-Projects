// TODO - Implement this actions
import { Download, Trash2, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

export interface BooksPopupProps<TData> {
  selectedBooks: TData[]
  onClearSelection: () => void
}

export function BooksPopup<TData>({
  selectedBooks,
  onClearSelection,
}: BooksPopupProps<TData>) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit flex-wrap items-center justify-center gap-2 rounded-md border bg-background p-2 text-foreground shadow-sm">
      <div className="flex h-7 items-center rounded-md border pr-1 pl-2.5">
        <span className="whitespace-nowrap text-xs">
          {selectedBooks.length} selected
        </span>
        <Separator
          orientation="vertical"
          className="mr-1 ml-2 data-[orientation=vertical]:h-4"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-5"
              onClick={onClearSelection}
            >
              <X className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            sideOffset={10}
            className="bg-secondary text-secondary-foreground [&>span]:hidden"
          >
            <p>Clear selection</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={'secondary'}
              className="size-7 [&>svg]:size-3.5"
              //   disabled={disabled || isPending}
            >
              {/* {isPending ? <Loader className="animate-spin" /> : children} */}
              <Download />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            sideOffset={6}
            className="border bg-accent font-semibold text-foreground [&>span]:hidden"
          >
            <p>Export to CSV</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              className="size-7"
              //   disabled={disabled || isPending}
              onClick={() => console.log('Delete', selectedBooks)}
            >
              {/* {isPending ? <Loader className="animate-spin" /> : children} */}
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            sideOffset={6}
            className="border bg-destructive text-destructive-foreground font-semibold [&>span]:hidden"
          >
            <p>Delete books</p>
          </TooltipContent>
        </Tooltip>
        {/* <button
          onClick={() => console.log('Delete', selectedBooks)}
          className="text-sm font-medium text-red-600 hover:underline"
        >
          Delete selected
        </button> */}
      </div>
    </div>
  )
}
