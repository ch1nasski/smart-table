import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();

    return (data, state, action) => {
        const rowsPerPage = Number(state.rowsPerPage) || 10;
        const pageCount = Math.max(1, Math.ceil(data.length / rowsPerPage));
        let page = Math.max(1, Math.min(pageCount, Number(state.page) || 1));

        if (action) {
            switch (action.name) {
                case 'first':
                    page = 1;
                    break;
                case 'prev':
                    page = Math.max(1, page - 1);
                    break;
                case 'next':
                    page = Math.min(pageCount, page + 1);
                    break;
                case 'last':
                    page = pageCount;
                    break;
            }
        }

        const visiblePages = getPages(page, pageCount, 5);
        pages.replaceChildren(...visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            return createPage(el, pageNumber, pageNumber === page);
        }));

        fromRow.textContent = (page - 1) * rowsPerPage + 1;
        toRow.textContent = Math.min((page * rowsPerPage), data.length);
        totalRows.textContent = data.length;

        const skip = (page - 1) * rowsPerPage;
        return data.slice(skip, skip + rowsPerPage);
    }
}