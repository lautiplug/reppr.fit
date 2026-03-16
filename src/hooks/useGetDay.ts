import { useState } from "react";

export const useGetDay = () => {

const dias = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const hoy = dias[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
const [diaSeleccionado, setDiaSeleccionado] = useState(hoy);

  return {
    dias,
    hoy,
    diaSeleccionado,
    setDiaSeleccionado
  }
}

