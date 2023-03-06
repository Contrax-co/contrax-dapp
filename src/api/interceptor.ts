import axios from "axios";

/**
 * Cache time to live in milliseconds
 */
const TTL = 1000 * 60 * 5; // 5 minutes

/**
 * Request Interceptor which checks if the request is cached and returns the cached data if it is
 */
axios.interceptors.request.use(
    function (config) {
        // Executes before each request and takes the request `config` object as an argument
        if (config.cache) {
            // Checks if caching is enabled for the request
            const oldDataTimestamp = sessionStorage.getItem(`cache-time ${config.url}`); // Gets the timestamp of the cached data from sessionStorage
            if (oldDataTimestamp && Number(oldDataTimestamp) + TTL > Date.now()) {
                // Checks if the cached data is still valid based on the TTL (time-to-live) and current time
                const oldData = sessionStorage.getItem(`cache ${config.url}`); // Gets the cached data from sessionStorage
                if (oldData) {
                    // Checks if there is actually cached data
                    config.adapter = function (config) {
                        // Overrides the default adapter function with a new function that will return the cached data
                        return new Promise((res, rej) => {
                            return res({
                                data: oldData, // The cached data
                                status: 200, // The HTTP status code
                                statusText: "OK", // The HTTP status message
                                headers: { "content-type": "application/json; charset=utf-8", cache: true }, // The response headers
                                config,
                                request: {},
                            });
                        });
                    };
                }
            } else {
                // If the cached data is not valid or doesn't exist, remove it from sessionStorage
                sessionStorage.removeItem(`cache-time ${config.url}`);
                sessionStorage.removeItem(`cache ${config.url}`);
            }
        }
        return config; // Returns the modified or unmodified request config object
    },
    function (error) {
        return Promise.reject(error); // Returns a rejected Promise in case of an error
    }
);

// Add a response interceptor
axios.interceptors.response.use(
    function (config) {
        // Executes after each successful response and takes the response `config` object as an argument
        sessionStorage.setItem(`cache ${config.config.url}`, JSON.stringify(config.data)); // Stores the response data in sessionStorage as a stringified JSON object
        sessionStorage.setItem(`cache-time ${config.config.url}`, Date.now().toString()); // Stores the current timestamp in sessionStorage to use for cache validation later
        return config; // Returns the response config object
    },
    function (error) {
        return Promise.reject(error); // Returns a rejected Promise in case of an error
    }
);

export {};
