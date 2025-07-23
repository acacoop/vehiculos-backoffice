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
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        style: {
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle style={{ color: COLORS.primary }}>{title}</DialogTitle>
      <DialogContent>
        <p>{message}</p>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          color="inherit"
          style={{
            textTransform: "none",
            padding: "8px 20px",
            backgroundColor: "#e53935",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#fe9000")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#e53935")
          }
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
            padding: "8px 20px",
            borderRadius: "6px",
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
