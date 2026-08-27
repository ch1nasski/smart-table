import {makeIndex} from "./lib/utils.js";

const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData(sourceData) {
    let sellers;
    let customers;
    let lastResult;
    let lastQuery;
    let fallbackData = [];

    if (sourceData?.sellers && sourceData?.customers && sourceData?.purchase_records) {
        const sellerIndex = makeIndex(sourceData.sellers, 'id', seller => `${seller.first_name} ${seller.last_name}`);
        const customerIndex = makeIndex(sourceData.customers, 'id', customer => `${customer.first_name} ${customer.last_name}`);

        fallbackData = sourceData.purchase_records.map(item => ({
            id: item.receipt_id,
            date: item.date,
            seller: sellerIndex[item.seller_id],
            customer: customerIndex[item.customer_id],
            total: item.total_amount
        }));
    }

    const mapRecords = (records) => records.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }));

    const getIndexes = async () => {
        if (!sellers || !customers) {
            [sellers, customers] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then(res => res.json()),
                fetch(`${BASE_URL}/customers`).then(res => res.json()),
            ]);
        }

        return { sellers, customers };
    };

    const getRecords = async (query, isUpdated = false) => {
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        lastQuery = nextQuery;
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    };

    const getFallbackData = () => fallbackData;

    return {
        getIndexes,
        getRecords,
        getFallbackData
    };
}