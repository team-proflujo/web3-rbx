const axios = require('axios');

async function Http(url, method, data, responseType = false) {
    let axiosOptions = {
        url: url,
        headers: {},
    };

    method = method || 'get';

    axiosOptions['method'] = method.toUpperCase();

    axiosOptions['data'] = data;

    if (typeof(responseType) !== 'undefined' && responseType) {
        axiosOptions['responseType'] = responseType;
    }

    let success = false, response, error;

    try {
        response = await axios(axiosOptions);
        success = true;
    } catch(err) {
        if (err) {
            if (err.hasOwnProperty('response')) {
                error = err.response;
            } else {
                error = err;
            }
        }
    }

    return { success, response, error };
}

function formatURL(...args) {
    let formattedURL;

    if (args.length > 0) {
        formattedURL = '';

        args.forEach((urlPart, i) => {
            if (formattedURL.length > 0) {
                if (formattedURL.endsWith('/')) {
                    if (urlPart.startsWith('/')) {
                        urlPart = urlPart.substr(1);
                    }
                } else {
                    if (!urlPart.startsWith('/')) {
                        urlPart = '/' + urlPart;
                    }
                }
            }

            formattedURL += urlPart;
        });
    }

    return formattedURL;
}

module.exports = {
    Http,
    formatURL,
};