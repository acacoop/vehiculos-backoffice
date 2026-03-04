import { useState, useEffect, useCallback } from "react";
import { Car, Wrench, CalendarX, AlertTriangle, Gauge } from "lucide-react";
import { StatCardsGrid, type StatCardData } from "../../components/StatCard";
import { TableSelector } from "../../components/TableSelector";
import {
  Table,
  type TableColumn,
  type FilterDefinition,
} from "../../components/Table";
import {
  getRisksSummary,
  getVehiclesWithoutResponsible,
  getOverdueMaintenanceVehicles,
  getOverdueQuarterlyControls,
  getQuarterlyControlsWithErrors,
  getVehiclesWithoutRecentKilometers,
  type RisksSummary,
  type VehicleWithoutResponsible,
  type OverdueMaintenanceVehicleFlat,
  type OverdueQuarterlyControl,
  type QuarterlyControlWithErrors,
  type VehicleWithoutRecentKilometers,
  type OverdueMaintenanceFilters,
  type OverdueQuarterlyControlsFilters,
  type VehiclesWithoutRecentKilometersFilters,
} from "../../services/risks";
import { COLORS } from "../../common";
import "./RisksPage.css";

// ============================================
// Filter Definitions
// ============================================

const toleranceFilterDefinitions: FilterDefinition<OverdueMaintenanceFilters>[] =
  [
    {
      field: "toleranceDays",
      label: "Días de tolerancia",
      type: "number",
      placeholder: "0",
    },
  ];

const toleranceFilterDefinitionsQC: FilterDefinition<OverdueQuarterlyControlsFilters>[] =
  [
    {
      field: "toleranceDays",
      label: "Días de tolerancia",
      type: "number",
      placeholder: "0",
    },
  ];

const kilometersFilterDefinitions: FilterDefinition<VehiclesWithoutRecentKilometersFilters>[] =
  [
    {
      field: "daysWithoutUpdate",
      label: "Días sin actualizar",
      type: "number",
      placeholder: "30",
    },
  ];

// ============================================
// Table Column Definitions
// ============================================

const vehiclesWithoutResponsibleColumns: TableColumn<VehicleWithoutResponsible>[] =
  [
    {
      field: "vehicleLicensePlate",
      headerName: "Patente",
      minWidth: 120,
    },
    {
      field: "lastResponsibleEndDate",
      headerName: "Último responsable hasta",
      minWidth: 180,
      type: "date",
      transform: (value) => value || "Nunca asignado",
    },
  ];

const overdueMaintenanceColumns: TableColumn<OverdueMaintenanceVehicleFlat>[] =
  [
    {
      field: "vehicleLicensePlate",
      headerName: "Patente",
      minWidth: 120,
    },
    {
      field: "maintenanceName",
      headerName: "Mantenimiento",
      minWidth: 180,
    },
    {
      field: "brandName",
      headerName: "Marca",
      minWidth: 120,
    },
    {
      field: "modelName",
      headerName: "Modelo",
      minWidth: 130,
    },
    {
      field: "daysOverdue",
      headerName: "Días vencido",
      minWidth: 110,
      transform: (value) => {
        const num = Number(value);
        return value !== undefined && value !== null && !isNaN(num)
          ? `${num} días`
          : "-";
      },
      color: (value) => {
        const num = Number(value);
        return value !== undefined && value !== null && !isNaN(num)
          ? COLORS.error
          : "";
      },
    },
    {
      field: "kilometersOverdue",
      headerName: "Km excedidos",
      minWidth: 120,
      transform: (value) => {
        const num = Number(value);
        return value !== undefined && value !== null && !isNaN(num)
          ? `${num.toLocaleString()} km`
          : "-";
      },
      color: (value) => {
        const num = Number(value);
        return value !== undefined && value !== null && !isNaN(num)
          ? COLORS.error
          : "";
      },
    },
  ];

const overdueQuarterlyControlsColumns: TableColumn<OverdueQuarterlyControl>[] =
  [
    {
      field: "vehicleLicensePlate",
      headerName: "Patente",
      minWidth: 120,
    },
    {
      field: "year",
      headerName: "Año",
      minWidth: 80,
    },
    {
      field: "quarter",
      headerName: "Trimestre",
      minWidth: 100,
      transform: (value) => `Q${value}`,
    },
    {
      field: "intendedDeliveryDate",
      headerName: "Fecha prevista",
      minWidth: 140,
      type: "date",
    },
    {
      field: "daysOverdue",
      headerName: "Días vencido",
      minWidth: 110,
      transform: (value) => `${value} días`,
      color: () => COLORS.error,
    },
    {
      field: "pendingItemsCount",
      headerName: "Estado",
      minWidth: 130,
      transform: (value, row) => {
        if (row.totalItemsCount === 0) return "Sin ítems";
        const pending = Number(value);
        const completed = row.totalItemsCount - pending;
        return `${completed}/${row.totalItemsCount} completados`;
      },
      color: (value, row) => {
        const pending = Number(value);
        return pending === 0
          ? COLORS.success
          : pending === row.totalItemsCount
            ? COLORS.error
            : COLORS.warning;
      },
    },
  ];

const quarterlyControlsWithErrorsColumns: TableColumn<QuarterlyControlWithErrors>[] =
  [
    {
      field: "vehicleLicensePlate",
      headerName: "Patente",
      minWidth: 120,
    },
    {
      field: "year",
      headerName: "Año",
      minWidth: 80,
    },
    {
      field: "quarter",
      headerName: "Trimestre",
      minWidth: 100,
      transform: (value) => `Q${value}`,
    },
    {
      field: "rejectedItemsCount",
      headerName: "Ítems rechazados",
      minWidth: 140,
      color: () => COLORS.warning,
    },
  ];

const vehiclesWithoutRecentKilometersColumns: TableColumn<VehicleWithoutRecentKilometers>[] =
  [
    {
      field: "vehicleLicensePlate",
      headerName: "Patente",
      minWidth: 120,
    },
    {
      field: "lastKilometerDate",
      headerName: "Último registro",
      minWidth: 140,
      type: "date",
      transform: (value) => value || "Nunca",
    },
    {
      field: "lastKilometers",
      headerName: "Último km",
      minWidth: 120,
      transform: (value) =>
        value ? `${Number(value).toLocaleString()} km` : "-",
    },
    {
      field: "daysSinceLastUpdate",
      headerName: "Días sin actualizar",
      minWidth: 150,
      transform: (value) => (value === "-1" ? "Nunca" : `${value} días`),
      color: () => COLORS.warning,
    },
  ];

// ============================================
// Main Component
// ============================================

export default function RisksPage() {
  // Summary state
  const [summary, setSummary] = useState<RisksSummary[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<string>(
    "vehicles-without-responsible",
  );

  // Load summary
  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(false);
    const result = await getRisksSummary();
    if (result.success) {
      setSummary(result.data);
    } else {
      setSummaryError(true);
    }
    setSummaryLoading(false);
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  // Get count from summary by key (show "-" indicator when error via -1)
  const getCount = (key: string): number => {
    if (summaryError) return -1;
    return summary.find((s) => s.key === key)?.count ?? 0;
  };
  const getSeverity = (key: string) =>
    summary.find((s) => s.key === key)?.severity ?? "low";

  // Static card definitions with order and spans
  const statCards: StatCardData[] = [
    {
      key: "vehicles-without-responsible",
      label: "Vehículos sin responsable",
      count: getCount("vehicles-without-responsible"),
      severity: getSeverity("vehicles-without-responsible"),
      icon: Car,
      span: 2,
    },
    {
      key: "overdue-maintenance",
      label: "Mantenimientos vencidos",
      count: getCount("overdue-maintenance"),
      severity: getSeverity("overdue-maintenance"),
      icon: Wrench,
      span: 2,
    },
    {
      key: "overdue-quarterly-controls",
      label: "Controles trimestrales vencidos",
      count: getCount("overdue-quarterly-controls"),
      severity: getSeverity("overdue-quarterly-controls"),
      icon: CalendarX,
      span: 2,
    },
    {
      key: "quarterly-controls-with-errors",
      label: "Controles con rechazos",
      count: getCount("quarterly-controls-with-errors"),
      severity: getSeverity("quarterly-controls-with-errors"),
      icon: AlertTriangle,
      span: 3,
    },
    {
      key: "vehicles-without-recent-kilometers",
      label: "Sin registro de km reciente",
      count: getCount("vehicles-without-recent-kilometers"),
      severity: getSeverity("vehicles-without-recent-kilometers"),
      icon: Gauge,
      span: 3,
    },
  ];

  // Handle card click - updates selected risk for TableSelector
  const handleCardClick = (key: string) => {
    setSelectedRisk(key);
  };

  // Handle tab change from TableSelector
  const handleTabChange = (tabId: string) => {
    setSelectedRisk(tabId);
  };

  return (
    <div className="risks-container">
      <div className="header-risks">
        <h1 className="title">Riesgos</h1>
      </div>

      <StatCardsGrid
        cards={statCards}
        onCardClick={handleCardClick}
        loading={summaryLoading}
      />

      <TableSelector
        selectedTab={selectedRisk}
        onTabChange={handleTabChange}
        tabs={[
          {
            id: "vehicles-without-responsible",
            label: "Sin responsable",
            icon: Car,
            table: (
              <Table<Record<string, never>, VehicleWithoutResponsible>
                getRows={(opts) => getVehiclesWithoutResponsible(opts)}
                columns={vehiclesWithoutResponsibleColumns}
                header={{ title: "Vehículos sin responsable asignado" }}
                search={{ enabled: true, placeholder: "Buscar por patente..." }}
                actionColumn={{
                  route: "/vehicles",
                }}
                minHeight="400px"
              />
            ),
          },
          {
            id: "overdue-maintenance",
            label: "Mantenimientos vencidos",
            icon: Wrench,
            table: (
              <Table<OverdueMaintenanceFilters, OverdueMaintenanceVehicleFlat>
                getRows={(opts) => getOverdueMaintenanceVehicles(opts)}
                columns={overdueMaintenanceColumns}
                header={{ title: "Vehículos con mantenimiento vencido" }}
                search={{
                  enabled: true,
                  placeholder: "Buscar por patente, mantenimiento...",
                }}
                filters={{ definitions: toleranceFilterDefinitions }}
                actionColumn={{
                  route: "/vehicles",
                  idField: "vehicleId",
                }}
                minHeight="400px"
              />
            ),
          },
          {
            id: "overdue-quarterly-controls",
            label: "Controles vencidos",
            icon: CalendarX,
            table: (
              <Table<OverdueQuarterlyControlsFilters, OverdueQuarterlyControl>
                getRows={(opts) => getOverdueQuarterlyControls(opts)}
                columns={overdueQuarterlyControlsColumns}
                header={{ title: "Controles trimestrales vencidos" }}
                search={{ enabled: true, placeholder: "Buscar por patente..." }}
                filters={{ definitions: toleranceFilterDefinitionsQC }}
                actionColumn={{
                  route: "/quarterly-controls",
                }}
                minHeight="400px"
              />
            ),
          },
          {
            id: "quarterly-controls-with-errors",
            label: "Controles con rechazos",
            icon: AlertTriangle,
            table: (
              <Table<Record<string, never>, QuarterlyControlWithErrors>
                getRows={(opts) => getQuarterlyControlsWithErrors(opts)}
                columns={quarterlyControlsWithErrorsColumns}
                header={{
                  title: "Controles trimestrales con ítems rechazados",
                }}
                search={{ enabled: true, placeholder: "Buscar por patente..." }}
                actionColumn={{
                  route: "/quarterly-controls",
                }}
                minHeight="400px"
              />
            ),
          },
          {
            id: "vehicles-without-recent-kilometers",
            label: "Sin km reciente",
            icon: Gauge,
            table: (
              <Table<
                VehiclesWithoutRecentKilometersFilters,
                VehicleWithoutRecentKilometers
              >
                getRows={(opts) => getVehiclesWithoutRecentKilometers(opts)}
                columns={vehiclesWithoutRecentKilometersColumns}
                header={{
                  title: "Vehículos sin registro de kilometraje reciente",
                }}
                search={{ enabled: true, placeholder: "Buscar por patente..." }}
                filters={{ definitions: kilometersFilterDefinitions }}
                actionColumn={{
                  route: "/vehicles",
                }}
                minHeight="400px"
              />
            ),
          },
        ]}
      />
    </div>
  );
}
