export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            const select = elements[elementName];

            if (!select) {
                return;
            }

            select.replaceChildren(new Option('—', '', true, true));
            select.append(
                ...Object.values(indexes[elementName]).map(name => {
                    const el = document.createElement('option');
                    el.textContent = name;
                    el.value = name;
                    return el;
                })
            );
        });
    };

    const applyFiltering = (query, state, action) => {
        if (action && action.name === 'clear') {
            const fieldName = action.dataset.field;
            const filterWrapper = action.parentElement;
            const fieldElement = filterWrapper?.querySelector('input, select');

            if (fieldElement) {
                fieldElement.value = '';
            }

            if (fieldName in state) {
                state[fieldName] = '';
            }
        }

        const filter = {};

        Object.keys(elements).forEach(key => {
            const element = elements[key];

            if (!element) {
                return;
            }

            if (['INPUT', 'SELECT'].includes(element.tagName) && element.value) {
                filter[`filter[${element.name}]`] = element.value;
            }
        });

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
    };

    return {
        updateIndexes,
        applyFiltering
    };
}