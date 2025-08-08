import "./DateTimePicker.css";

interface DateTimePickerProps {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  onStartDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndDateChange: (date: string) => void;
  onEndTimeChange: (time: string) => void;
  disabled?: boolean;
  minDate?: string;
}

export default function DateTimePicker({
  startDate,
  startTime,
  endDate,
  endTime,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  disabled = false,
  minDate,
}: DateTimePickerProps) {
  // Calcular fecha mínima (hoy si no se especifica)
  const minimumDate = minDate || new Date().toISOString().split("T")[0];

  return (
    <div className="datetime-picker">
      {/* Fila de inicio: Fecha de inicio y Hora de inicio */}
      <div className="datetime-row">
        <div className="datetime-field">
          <label htmlFor="startDate" className="datetime-label">
            Fecha de Inicio
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            min={minimumDate}
            disabled={disabled}
            required
            className="datetime-input"
          />
        </div>

        <div className="datetime-field">
          <label htmlFor="startTime" className="datetime-label">
            Hora de Inicio
          </label>
          <input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            disabled={disabled}
            required
            className="datetime-input"
          />
        </div>
      </div>

      {/* Fila de fin: Fecha de fin y Hora de fin */}
      <div className="datetime-row">
        <div className="datetime-field">
          <label htmlFor="endDate" className="datetime-label">
            Fecha de Fin
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={startDate || minimumDate}
            disabled={disabled}
            required
            className="datetime-input"
          />
        </div>

        <div className="datetime-field">
          <label htmlFor="endTime" className="datetime-label">
            Hora de Fin
          </label>
          <input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            disabled={disabled}
            required
            className="datetime-input"
          />
        </div>
      </div>
    </div>
  );
}
