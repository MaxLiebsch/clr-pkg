export interface PaginationElement {
    type: string;
    sel: string;
    nav: string;
    wait?: boolean;
    initialUrl?: {
      type: string;
      regexp: string;
    };
    scrollToBottom: boolean;
    paginationUrlSchema?: PaginationUrlSchema;
    calculation: Calculation;
  }
  
  export interface PaginationUrlSchema {
    replace: string;
    withQuery: boolean;
    parseAndReplace?: {
      regexp: string;
      replace: string;
    };
    calculation: {
      method: string;
      replace?: {
        use?: string;
        skip?: number;
        search: string;
        replace?: string;
      }[];
      offset: number;
    };
  }
  
  export interface Calculation {
    method: string;
    last: string;
    productsPerPage?: number;
    textToMatch?: string;
    dynamic?: boolean;
    sel: string;
  }