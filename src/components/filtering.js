import {createComparison, defaultRules} from "../lib/compare.js";

function normalizeState(state) {
    const nextState = {...state};
    const fromValue = state.totalFrom;
    const toValue = state.totalTo;

    if (fromValue !== undefined || toValue !== undefined) {
        nextState.total = [
            fromValue === '' || fromValue === undefined || fromValue === null ? undefined : Number(fromValue),
            toValue === '' || toValue === undefined || toValue === null ? undefined : Number(toValue)
        ];
    }

    return nextState;
}

export function initFiltering(elements, indexes) {
    const compare = createComparison(defaultRules);

    Object.keys(indexes).forEach((elementName) => {
        const select = elements[elementName];

        if (!select) {
            return;
        }

        select.replaceChildren(new Option('—', '', true, true));
        select.append(
            ...Object.values(indexes[elementName]).map(name => {
                return new Option(name, name);
            })
        );
    });

    return (data, state, action) => {
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

        return data.filter(row => compare(row, normalizeState(state)));
    }
}