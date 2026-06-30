export interface ProductRow {
  upc?: string | number;
  'id articulo'?: string | number;
  sku?: string | number;
  modelo?: string;
  'id empresa organizacion'?: string | number;
  nombre?: string;
  cantidad?: number;
  'estado fisico'?: string | number;
  'estado fisico nombre'?: string;
  'estado venta'?: string | number;
  'estado venta nombre'?: string;
  tags?: string;
  origen?: string;
  'fecha registro'?: string;
  linea?: string;
  marca?: string;
  grupos?: string;
  categoria?: string;
  ofuscar?: string | boolean;
  'cantidad ofuscada'?: number;
  'id estado ofuscar'?: string | number;
  'total precio contado'?: number;
  _searchString?: string;
  [key: string]: any;
}

export interface FilterState {
  searchTerms: string[];
  linea: string;
  marca: string;
  categoria: string;
}
