import {rules, createComparison} from "../lib/compare.js";

export function initSearching(searchField) {
    const compare = createComparison([
        'skipEmptyTargetValues'
    ], [
        rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'])
    ]);

    return (data, state, action) => {
        return data.filter(row => compare(row, state));
    }
}