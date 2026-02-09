import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import EditGraphDialog from "./EditGraphDialog";
import DeleteGraphDialog from "./DeleteGraphDialog";

interface EditGraphDropDownProps {
  graphTitle: string;
  setGraphTitle: React.Dispatch<React.SetStateAction<string>>;
  titleColor: string;
  setTitleColor: React.Dispatch<React.SetStateAction<string>>;
  offset: number;
  setOffset: React.Dispatch<React.SetStateAction<number>>;
  setZeroPoint: boolean;
  setSetZeroPoint: React.Dispatch<React.SetStateAction<boolean>>;
  graphType: string;
  setGraphType: React.Dispatch<React.SetStateAction<string>>;
  displayedHistory: string;
  setDisplayedHistory: React.Dispatch<React.SetStateAction<string>>;
  deleteGraph: boolean;
  setDeleteGraph: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function EditGraphDropDown({
  graphTitle,
  setGraphTitle,
  titleColor,
  setTitleColor,
  offset,
  setOffset,
  setZeroPoint,
  setSetZeroPoint,
  graphType,
  setGraphType,
  displayedHistory,
  setDisplayedHistory,
  deleteGraph,
  setDeleteGraph,
}: EditGraphDropDownProps) {
  // saving values
  // const [offset, setOffset] = useState(0.0);
  // const [setZeroPoint, setSetZeroPoint] = useState(false);

  // dialog states (Edit and Delete)
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // format offset to 1 decimal
  const formattedOffset = offset.toFixed(1); // UPDATE: is this needed

  return (
    <div className="flex justify-end w-full mt-2">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" aria-label="Open menu">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-40" align="end">
          {/* set offset */}
          <DropdownMenuLabel>Offset</DropdownMenuLabel>
          <div className="flex items-center justify-between px-2 py-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                setOffset((prev) => parseFloat((prev + 0.1).toFixed(1)))
              }
            >
              +
            </Button>

            <span className="text-md w-12 text-center">{formattedOffset}</span>

            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                setOffset((prev) => parseFloat((prev - 0.1).toFixed(1)))
              }
            >
              –
            </Button>
          </div>

          <DropdownMenuSeparator />

          {/* set zero state option */}
          <DropdownMenuItem
            onSelect={() => {
              setSetZeroPoint(!setZeroPoint);
            }}
          >
            Set Zero Point
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* edit button */}
          <DropdownMenuItem
            onSelect={() => {
              setOpenEdit(true);
            }}
          >
            Edit
          </DropdownMenuItem>

          {/* delete button */}
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onSelect={() => {
              setOpenDelete(true);
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* edit component */}
      <EditGraphDialog
        openEdit={openEdit}
        setOpenEdit={setOpenEdit}
        currentTitle={graphTitle}
        setGraphTitle={setGraphTitle}
        currentColor={titleColor}
        setTitleColor={setTitleColor}
        currentOffset={offset}
        setCurrentOffset={setOffset}
        currentGraphType={graphType}
        setCurrentGraphType={setGraphType}
        displayedHistory={displayedHistory}
        setDisplayedHistory={setDisplayedHistory}
      ></EditGraphDialog>

      {/* delete component */}
      <DeleteGraphDialog
        openDelete={openDelete}
        setOpenDelete={setOpenDelete}
        deleteGraph={deleteGraph}
        setDeleteGraph={setDeleteGraph}
      ></DeleteGraphDialog>
    </div>
  );
}
