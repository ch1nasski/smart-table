export function initSearching(searchField) {
    const applySearching = (query, state, action) => {
        return state[searchField]
            ? Object.assign({}, query, {
                search: state[searchField]
            })
            : query;
    };

    return {
        applySearching
    };
}