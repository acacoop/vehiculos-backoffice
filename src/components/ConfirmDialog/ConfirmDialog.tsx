import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { COLORS } from "../../common/colors";
import { ConfirmButton, CancelButton } from "../index";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
};

export default function ConfirmDialog({
  open,
  title = "Confirmar acción",
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "12px",
          padding: "16px",
        },
      }}
    >
      <DialogTitle
        style={{ color: COLORS.primary, fontFamily: '"Urbanist", sans-serif' }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <p style={{ fontFamily: '"Urbanist", sans-serif' }}>{message}</p>
      </DialogContent>
      <DialogActions>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <CancelButton text={cancelText} onClick={onCancel} />
          <ConfirmButton text={confirmText} onClick={onConfirm} />
        </div>
      </DialogActions>
    </Dialog>
  );
}
