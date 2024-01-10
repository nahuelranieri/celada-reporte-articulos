import { useState, useEffect, useMemo } from 'react'
import './App.css'
import { postApi, getApi } from './hooks/api';
import { DataGrid, GridToolbar, GridToolbarContainer, GridToolbarFilterButton } from '@mui/x-data-grid';
import datita from './MOCK_DATA(6).json'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { FileDownload, PictureAsPdf, Refresh } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import ExcelButton from './components/ExcelButton';
import * as XLSX from "xlsx";
import * as ExcelJS from "exceljs";
import { saveAs } from 'file-saver';

function App() {

  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {

    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getApi();
        setApiData(data);
      } catch (error) {
        console.error('Error al obtener datos de la API:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    setRefreshData(false);

  }, [refreshData]);

  const columns = useMemo(
    () => [
      {
        header: 'imagen',
        accessorKey: 'imagen',
        filterVariant: 'multi-select',
        Cell: ({ cell }) => <img src={cell.getValue()} />,
        enableColumnFilterModes: false,
      },
      {
        header: 'origen',
        accessorKey: 'origen',
        filterVariant: 'multi-select',
        enableColumnFilterModes: false,
      },
      {
        header: 'tienda',
        accessorKey: 'tienda',
        filterVariant: 'multi-select',
        enableColumnFilterModes: false,
      },
      {
        header: 'orden',
        accessorKey: 'orden',
        filterVariant: 'multi-select',
        enableColumnFilterModes: false,
        enableColumnFilter: false,
      },
      {
        header: 'transporte',
        accessorKey: 'transporte',
        filterVariant: 'multi-select',
        enableColumnFilterModes: false,
      },
      {
        header: 'modalidad',
        accessorKey: 'modalidad',
        filterVariant: 'multi-select',
        enableColumnFilterModes: false,
      },
      {
        header: 'fecha',
        accessorKey: 'fecha',
        filterVariant: 'date-range',
        enableColumnFilterModes: false,
      },
    ],
    [],
  );

  const handlePrintPdfRows = async (rows) => {
    const rowData = rows.map((row) => row.original);
    const ordenYOrigen = rowData.map((data) => ({ orden: data.orden, origen: data.origen })).slice(0, 30);
    try {
      const response = await postApi(ordenYOrigen);
      const baseUrl = 'https://market.sevensport.com.ar/api/batchs';
      const url1 = `${baseUrl}/get/${response}/false`;
      const url2 = `${baseUrl}/get-meli-labels/${response}/`;

      window.open(url1, '_blank');
      window.open(url2, '_blank');


    } catch (error) {
      console.log('Error al crear el pdf:', error);
    } finally {
      setRefreshData(true);
      setRowSelection({})
    }
  };

  const getImageAsBase64 = async (imageUrl) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const handleExportRows = async (rows) => {
    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Agregar encabezados de columna
    worksheet.addRow(['Imagen', 'Origen', 'Tienda', 'Orden', 'Transporte', 'Fecha']);

    // Mapear la información de las filas y agregar al libro de Excel
    for (const row of rows) {
        const rowData = row.original;

        // Obtener la imagen como Base64
        const base64Image = await getImageAsBase64(rowData.imagen);

        // Agregar datos a las celdas del libro de Excel
        worksheet.addRow([
            { type: 'image', base64: base64Image, hyperlink: rowData.imagen },
            rowData.origen,
            rowData.tienda,
            rowData.orden,
            rowData.transporte,
            rowData.fecha,
        ]);
    }

    // Guardar el libro de Excel en un blob
    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Utilizar FileSaver.js para descargar el archivo
        FileSaver.saveAs(blob, 'output.xlsx');

        console.log('Excel exportado correctamente');
    }).catch((error) => {
        console.error('Error al exportar a Excel:', error);
    });
};

  // const handleExportRows = (rows) => {
  //   const rowData = rows.map((row) => row.original);

  //   // Crear un nuevo libro y hoja
  //   const libro = XLSX.utils.book_new();
  //   const hoja = XLSX.utils.json_to_sheet(rowData);

  //   // Iterar sobre los datos y agregar las imágenes
  //   rowData.forEach((row, index) => {
  //     // Asumiendo que la URL de la imagen está en la propiedad 'imagenUrl' del objeto de datos
  //     const imageUrl = row.imagenUrl;

  //     // Crear un objeto de estilo para la celda con la imagen
  //     const imgStyle = {
  //       patternType: 'solid',
  //       fgColor: { rgb: 'FFFFFF' }, // Color de fondo blanco
  //       backgroundImage: imageUrl,
  //       backgroundSize: 'contain',
  //       backgroundPosition: 'center',
  //       backgroundRepeat: 'no-repeat',
  //     };

  //     // Crear un rango para la celda con la imagen
  //     const range = XLSX.utils.decode_range(`${XLSX.utils.encode_col(0)}${index + 2}`);

  //     // Aplicar el estilo al rango
  //     for (let R = range.s.r; R <= range.e.r; ++R) {
  //       for (let C = range.s.c; C <= range.e.c; ++C) {
  //         const cellAddress = { r: R, c: C };
  //         XLSX.utils.cell_set(cellAddress, 's', imgStyle, hoja);
  //       }
  //     }
  //   });

  //   // Agregar la hoja al libro
  //   XLSX.utils.book_append_sheet(libro, hoja);

  //   // Guardar el archivo
  //   XLSX.writeFile(libro, "Ejemplo.xlsx");;
  // };

  useEffect(() => {

    console.info({ rowSelection }); //read your managed row selection state

    // console.info(table.getState().rowSelection); //alternate way to get the row selection state

  }, [rowSelection]);

  const table = useMaterialReactTable({
    columns,
    // data: apiData,
    data: datita,
    initialState: { showColumnFilters: false, density: 'compact' },
    enableRowSelection: true,
    enableFacetedValues: true,
    enableColumnFilterModes: true,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableColumnResizing: true,
    positionToolbarAlertBanner: 'bottom',
    onRowSelectionChange: setRowSelection,
    state: {
      showSkeletons: loading,
      rowSelection
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{
          display: 'flex',
          gap: '16px',
          padding: '8px',
          flexWrap: 'wrap',
        }}
      >
        <Button
          onClick={() => {
            if (table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) {
              handlePrintPdfRows(table.getSelectedRowModel().rows)
            } else {
              handlePrintPdfRows(table.getPrePaginationRowModel().rows)
            }
          }}
          startIcon={<PictureAsPdf />}
        >
          Print PDF
        </Button>
        <Button
          startIcon={<Refresh />}
          onClick={() => { setRefreshData(true) }}
        >
          Refresh
        </Button>

        <Button
          disabled={!Object.keys(rowSelection).length}
          onClick={() => {
            if (table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) {
              handleExportRows(table.getSelectedRowModel().rows)
            } else {
              handleExportRows(table.getPrePaginationRowModel().rows)
            }
          }}
          startIcon={<FileDownload />}
        >
          Export
        </Button>
      </Box>
    )
  });

  return (
    <>
      <MaterialReactTable
        table={table}

      />
    </>
  )
}

export default App
