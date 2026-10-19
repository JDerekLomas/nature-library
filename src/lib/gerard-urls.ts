// Page-image and reader URLs for Gerard's Herball (1597) in the Source Library — safe for client and server
export const GERARD_BOOK = "6957ebcc57a4c14a9879ab9c";
export const gerardPage = (page: number) => `https://images.sourcelibrary.org/pages/${GERARD_BOOK}/${String(page).padStart(4, "0")}.jpg`;
export const gerardUrl = (page: number) => `https://sourcelibrary.org/book/the-herball-or-generall-historie-of-plantes-gerard?page=${page}`;
