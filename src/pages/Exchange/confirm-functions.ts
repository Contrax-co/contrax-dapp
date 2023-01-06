export const priceToken = async (address: any, setPrice: any) => {
    await fetch(`https://coins.llama.fi/prices/current/arbitrum:${address}`)
        .then((response) => response.json())
        .then((data) => {
            const prices = JSON.stringify(data);

            const parse = JSON.parse(prices);

            const price = parse[`coins`][`arbitrum:${address}`][`price`];
            setPrice(price);
        });
};
