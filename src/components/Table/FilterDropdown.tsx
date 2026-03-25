import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { FilterParams } from "../../types/common";
import type { FilterDefinition } from "./types";

interface FilterDropdownProps<TFilters extends FilterParams> {
  definitions: FilterDefinition<TFilters>[];
  activeFilters: Partial<TFilters>;
  onAddFilter: (
    field: keyof TFilters,
    value: string,
    displayLabel?: string,
  ) => void;
}

export function FilterDropdown<TFilters extends FilterParams>({
  definitions,
  activeFilters,
  onAddFilter,
}: FilterDropdownProps<TFilters>) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] =
    useState<FilterDefinition<TFilters> | null>(null);
  const [filterValue, setFilterValue] = useState("");
  const [filterLabel, setFilterLabel] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<
    { label: string; value: string }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const searchDebounceRef = useRef<number | undefined>(undefined);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedFilter(null);
        setFilterValue("");
        setFilterLabel("");
        setSearchTerm("");
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search filter effect
  useEffect(() => {
    if (selectedFilter?.type !== "search") return;

    const minChars = selectedFilter.minChars ?? 1;
    const debounceMs = selectedFilter.debounceMs ?? 300;

    if (searchTerm.length < minChars) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await selectedFilter.searchFn(searchTerm);
        setSearchResults(results);
        setShowSearchDropdown(true);
        setSelectedSearchIndex(-1);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchTerm, selectedFilter]);

  // Get available filters (not already active)
  const availableFilters = definitions.filter(
    (def) =>
      activeFilters[def.field] === undefined ||
      activeFilters[def.field] === null ||
      activeFilters[def.field] === "",
  );

  const handleFilterSelect = (filter: FilterDefinition<TFilters>) => {
    setSelectedFilter(filter);
    setFilterValue("");
    setFilterLabel("");
    setSearchTerm("");
    setSearchResults([]);
    setShowSearchDropdown(false);
    setSelectedSearchIndex(-1);
  };

  const handleApplyFilter = () => {
    if (selectedFilter && filterValue) {
      onAddFilter(selectedFilter.field, filterValue, filterLabel || undefined);
      setSelectedFilter(null);
      setFilterValue("");
      setFilterLabel("");
      setSearchTerm("");
      setSearchResults([]);
      setShowSearchDropdown(false);
      setIsOpen(false);
    }
  };

  const handleSearchResultSelect = (result: {
    label: string;
    value: string;
  }) => {
    setFilterValue(result.value);
    setFilterLabel(result.label);
    setSearchTerm(result.label);
    setShowSearchDropdown(false);
    setSearchResults([]);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showSearchDropdown || searchResults.length === 0) {
      if (e.key === "Enter" && filterValue) {
        handleApplyFilter();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSearchIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSearchIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        selectedSearchIndex >= 0 &&
        selectedSearchIndex < searchResults.length
      ) {
        handleSearchResultSelect(searchResults[selectedSearchIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSearchDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filterValue) {
      handleApplyFilter();
    }
  };

  if (availableFilters.length === 0) return null;

  return (
    <div className="filter-dropdown-container" ref={dropdownRef}>
      <button
        className="filter-add-btn"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        Agregar filtro
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="filter-dropdown-menu">
          {!selectedFilter ? (
            // Step 1: Select filter type
            <div className="filter-dropdown-list">
              {availableFilters.map((filter) => (
                <button
                  key={String(filter.field)}
                  className="filter-dropdown-item"
                  onClick={() => handleFilterSelect(filter)}
                  type="button"
                >
                  {filter.label} <ChevronRight size={16} />
                </button>
              ))}
            </div>
          ) : (
            // Step 2: Enter filter value
            <div className="filter-value-input">
              <span className="filter-value-label">{selectedFilter.label}</span>

              {selectedFilter.type === "select" && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="filter-input-field"
                  autoFocus
                >
                  <option value="">Seleccionar...</option>
                  {selectedFilter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {selectedFilter.type === "text" && (
                <input
                  type="text"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedFilter.placeholder || "Escribir..."}
                  className="filter-input-field"
                  autoFocus
                />
              )}

              {selectedFilter.type === "number" && (
                <input
                  type="number"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedFilter.placeholder || "Número..."}
                  className="filter-input-field"
                  autoFocus
                />
              )}

              {selectedFilter.type === "date" && (
                <input
                  type="datetime-local"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="filter-input-field"
                  autoFocus
                />
              )}

              {selectedFilter.type === "boolean" && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="filter-input-field"
                  autoFocus
                >
                  <option value="">Seleccionar...</option>
                  <option value="true">
                    {selectedFilter.trueLabel || "Sí"}
                  </option>
                  <option value="false">
                    {selectedFilter.falseLabel || "No"}
                  </option>
                </select>
              )}

              {selectedFilter.type === "search" && (
                <div className="filter-search-container">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      // Clear selection if user types again
                      if (filterValue && e.target.value !== filterLabel) {
                        setFilterValue("");
                        setFilterLabel("");
                      }
                    }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={selectedFilter.placeholder || "Buscar..."}
                    className="filter-input-field"
                    autoFocus
                  />
                  {isSearching && (
                    <div className="filter-search-loading">Buscando...</div>
                  )}
                  {showSearchDropdown && searchResults.length > 0 && (
                    <div
                      className="filter-search-dropdown"
                      ref={searchResultsRef}
                    >
                      {searchResults.map((result, index) => (
                        <button
                          key={result.value}
                          className={`filter-search-item ${
                            index === selectedSearchIndex ? "selected" : ""
                          }`}
                          onClick={() => handleSearchResultSelect(result)}
                          type="button"
                        >
                          {result.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {showSearchDropdown &&
                    !isSearching &&
                    searchResults.length === 0 &&
                    searchTerm.length >= (selectedFilter.minChars ?? 1) && (
                      <div className="filter-search-dropdown">
                        <div className="filter-search-no-results">
                          No se encontraron resultados
                        </div>
                      </div>
                    )}
                </div>
              )}

              <div className="filter-value-actions">
                <button
                  className="filter-cancel-btn"
                  onClick={() => {
                    setSelectedFilter(null);
                    setFilterValue("");
                    setFilterLabel("");
                    setSearchTerm("");
                    setSearchResults([]);
                    setShowSearchDropdown(false);
                  }}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="filter-apply-btn"
                  onClick={handleApplyFilter}
                  disabled={!filterValue}
                  type="button"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
