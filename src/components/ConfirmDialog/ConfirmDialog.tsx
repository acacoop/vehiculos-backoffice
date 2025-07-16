import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { COLORS } from "../../common/colors";

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
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle style={{ color: COLORS.primary }}>{title}</DialogTitle>
      <DialogContent>
        <p>{message}</p>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          color="inherit"
          style={{ textTransform: "none", color: COLORS.error }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          style={{
            backgroundColor: COLORS.primary,
            color: "#fff",
            transition: "background-color 0.2s",
            textTransform: "none",
          }}
          variant="contained"
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = COLORS.secondary)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = COLORS.primary)
          }
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
