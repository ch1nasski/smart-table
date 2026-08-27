import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";
import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";

const api = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    const state = collectState();
    let query = {};

    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action);

    const hasTotalRange = state.totalFrom || state.totalTo;
    const requestQuery = hasTotalRange ? {...query, limit: 1000} : query;
    const { total, items } = await api.getRecords(requestQuery);

    let filteredItems = [...items];

    if (hasTotalRange) {
        const totalFrom = state.totalFrom !== '' ? Number(state.totalFrom) : null;
        const totalTo = state.totalTo !== '' ? Number(state.totalTo) : null;

        filteredItems = filteredItems.filter(item => {
            const value = Number(item.total);

            if (totalFrom !== null && value < totalFrom) {
                return false;
            }

            if (totalTo !== null && value > totalTo) {
                return false;
            }

            return true;
        });
    }

    const rowsPerPage = Number(state.rowsPerPage) || 10;
    const totalRows = hasTotalRange ? filteredItems.length : total;
    const page = Math.max(1, Number(state.page) || 1);
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageItems = hasTotalRange ? filteredItems.slice(start, end) : items;

    updatePagination(totalRows, { page, limit: rowsPerPage });
    sampleTable.render(pageItems);
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

const { applySearching } = initSearching('search');

const { applyFiltering, updateIndexes } = initFiltering(sampleTable.filter.elements);

const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

const { applyPagination, updatePagination } = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

const fallbackRows = api.getFallbackData();
if (fallbackRows.length) {
    sampleTable.render(fallbackRows.slice(0, 10));
    updatePagination(fallbackRows.length, { page: 1, limit: 10 });
}

async function init() {
    const indexes = await api.getIndexes();

    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });

    return indexes;
}

init().then(render);
