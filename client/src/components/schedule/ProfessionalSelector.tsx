import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Professional {
  id: number;
  name: string;
  initials: string;
}

interface ProfessionalSelectorProps {
  professionals: Professional[];
  onSelect: (professional: Professional) => void;
  selectedProfessional: Professional | null;
}

export function ProfessionalSelector({
  professionals,
  onSelect,
  selectedProfessional
}: ProfessionalSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Adicionar listener para click fora do dropdown
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Filtrar professores com base na busca
  const filteredProfessionals = professionals.filter((prof) =>
    prof.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para selecionar um professor
  const handleSelectProfessional = (professional: Professional) => {
    onSelect(professional);
    setIsDropdownOpen(false);
    setSearchTerm(""); // Limpar o campo de busca após a seleção
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar professor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          className="w-full"
        />
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {isDropdownOpen && filteredProfessionals.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
          {filteredProfessionals.map((prof) => (
            <div
              key={prof.id}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${
                selectedProfessional?.id === prof.id ? "bg-blue-50" : ""
              }`}
              onClick={() => handleSelectProfessional(prof)}
            >
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                  <span className="text-primary-700 font-medium text-xs">{prof.initials}</span>
                </div>
                <span className={selectedProfessional?.id === prof.id ? "font-medium" : "font-normal"}>
                  {prof.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isDropdownOpen && searchTerm && filteredProfessionals.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 text-base sm:text-sm text-center text-gray-500">
          Nenhum professor encontrado
        </div>
      )}
    </div>
  );
}