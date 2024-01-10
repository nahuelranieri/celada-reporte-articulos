import { Button } from "@mui/material";
import { Download } from "@mui/icons-material";
import * as XLSX from "xlsx";

const ExcelButton = () => {
  return (
    <Button
    startIcon={<Download />}
    >Descargar Excel</Button>
  )
}

export default ExcelButton