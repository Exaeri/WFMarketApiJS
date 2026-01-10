import axios from "axios";

/**
 * Client for Warframe.Market v2 Api
 * Api documentation: https://42bytes.notion.site/WFM-Api-v2-Documentation-5d987e4aa2f74b55a80db1a09932459d
 */
export default class WFMApi {
    static #apiUrl = "https://api.warframe.market/v2";
    static #JWTcookie = null;
    static #language = {value: 'en', available: ['ko', 'ru', 'de', 'fr', 'pt', 'zh-hans', 'zh-hant', 'es', 'it', 'pl', 'uk', 'en']};
    static #crossplay = 'true';
    static #platform = {value: 'pc', available: ['pc', 'ps4', 'xbox', 'switch', 'mobile']};
    static #cooldown = {delay: 500, lastRequestTime: 0};

    /**
     * Set JWT cookie for authentication
     * @param {string} cookie - JWT cookie value
     */
    static set JWT(cookie) {
        if(typeof cookie !== 'string') throw new Error('JWT cookie must be string');
        if(cookie.length === 0) throw new Error('JWT cookie must not be empty');
        this.#JWTcookie = cookie;
    }

    /**
     * Set language (ko, ru, de, fr, pt, zh-hans, zh-hant, es, it, pl, uk, en). Default: en
     * @param {string} language - Language code
     */
    static set language(language) {
        if(typeof language !== 'string') throw new Error('Language must be string');
        if(this.#language.available.indexOf(language) === -1) {
            throw new Error('Language must be one of: ko, ru, de, fr, pt, zh-hans, zh-hant, es, it, pl, uk, en');
        }
        this.#language.value = language;
    }

    /**
     * Set crossplay. Default: true
     * @param {boolean} crossplay - True or False
     */
    static set crossplay(crossplay) {
        if(typeof crossplay !== 'boolean') throw new Error('Crossplay must be boolean');
        this.#crossplay = crossplay ? 'true' : 'false';
    }

    /**
     * Set platform (pc, ps4, xbox, switch, mobile). Default: pc
     * @param {string} platform - Platform code
     */
    static set platform(platform) {
        if(typeof platform !== 'string') throw new Error('Platform must be string');
        if(this.#platform.available.indexOf(platform) === -1) {
            throw new Error('Platform must be one of: pc, ps4, xbox, switch, mobile');
        }
        this.#platform.value = platform;
    }

    /**
     * Set cooldown between requests in milliseconds
     * @param {number} time - Cooldown time in ms
     */
    static set cooldown(time) {
        if(!Number.isInteger(time) || time <= 0) throw new Error('Cooldown must be number and >350');
        if(time <= 350) throw new Error('3 requests per second is the limit, cooldown must be >350ms');
        this.#cooldown.delay = time;
    }

    /**
     * Get current language
     * @returns {string} - Current language value
     */
    static get language() {
        return this.#language.value;
    }

    static #checkAuth(context) {
        if (!this.#JWTcookie) {
            throw new Error(`JWT cookie is required for \x1b[33mWFMApi.${context}\x1b[0m. Set it with \x1b[33mWFMApi.JWT = 'YOUR_JWT_COOKIE'\x1b[0m`);
        }
    }

    static async #checkCooldown() {
        const currentTime = Date.now();
        const sinceLastRequest = currentTime - this.#cooldown.lastRequestTime;
        if (sinceLastRequest < this.#cooldown.delay) {
            const remaining = this.#cooldown.delay - sinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, remaining));
        }
        
        this.#cooldown.lastRequestTime = Date.now();
    }

    static #getHeaders() {
        const headers = {
            'language': this.#language.value,
            'crossplay': this.#crossplay,
            'platform': this.#platform.value,
            'Content-Type': 'application/json'
        };

        if (this.#JWTcookie) {
            headers.Cookie = `JWT=${this.#JWTcookie}`;
        }

        return headers;
    }

    /**
     * Error handling for axios
     * Axios throws errors for 4xx and 5xx status codes in catch block
     * For 2xx status codes axios returns response
     */
    static #handleErrors(error, context) {
        let errorInfo = {
            error: true,
            message: error.message || 'Unknown error',
            code: error.code || 'UNKNOWN'
        };

        if (error.response) {
            // Response with error (4xx, 5xx)
            errorInfo.status = error.response.status;
            errorInfo.statusText = error.response.statusText;
            errorInfo.message = error.response.data?.error || error.message;
        } else if (error.request) {
            // No response (network errors, timeouts)
            errorInfo.message = 'No response from server';
            errorInfo.code = 'NO_RESPONSE';
        }

        const logMessage = `Request failed in \x1b[33m${context}\x1b[0m method. ${errorInfo.message?.request} (${errorInfo.status || errorInfo.code})`;
        console.error(logMessage);

        if(errorInfo.statusText === 'Unauthorized') {
            throw { error: true, message: `\x1b[31mAuthorization error. JWT cookie is probably incorrect\x1b[0m`};
        }
        throw errorInfo;
    }

    static async #doRequest(options, context = '') {
        await this.#checkCooldown();

        try {
            const response = await axios.request(options);
            return response.data?.data;
        } catch (error) {
            return this.#handleErrors(error, context);
        }
    }

    /**
     * Add a new order
     * @param {string} itemId - Item ID.
     * @param {string} type - Order type ('sell' or 'buy').
     * @param {number} platinum - Price in platinum.
     * @param {number} quantity - Quantity.
     * @param {boolean} [visible] - Is order visible (default: true).
     * @param {number} [rank] - Mod or mystic rank (optional).
     * @returns {Promise<object>} - Return result of adding order.
     */
    static async addOrder(itemId, type, platinum, quantity = 1, visible = true, rank = null) {
        this.#checkAuth('addOrder');

        if(type !== 'sell' && type !== 'buy') throw new Error('Order type must be "sell" or "buy"');
        if(!Number.isInteger(platinum) || platinum <= 0) throw new Error('Platinum must be number and >0');
        if(!Number.isInteger(quantity) || quantity <= 0) throw new Error('Quantity must be number and >0');
        if(typeof visible !== 'boolean') throw new Error('Visible must be boolean');
        if(rank !== null && (!Number.isInteger(rank))) throw new Error('Rank must be number');

        const data = {
            itemId: itemId,
            type: type,
            visible: visible,
            platinum: platinum,
            quantity: quantity
        };

        if (rank !== null) data.rank = rank;

        const options = {
            method: 'POST',
            url: `${this.#apiUrl}/order`,
            headers: this.#getHeaders(),
            data: data
        };

        return await this.#doRequest(options, 'addOrder');
    }

    /**
     * Modify an existing order
     * @param {string} orderId - Order ID.
     * @param {number} platinum - Price in platinum.
     * @param {number} quantity - Quantity.
     * @param {boolean} [visible] - Is order visible (default: true).
     * @param {number} [rank] - Mod or mystic rank (optional).
     * @returns {Promise<object>} - Return result of modifying order.
     */
    static async modifyOrder(orderId, platinum, quantity = 1, visible = true, rank = null) {
        this.#checkAuth('modifyOrder');

        if(!Number.isInteger(platinum) || platinum <= 0) throw new Error('Platinum must be number and >0');
        if(!Number.isInteger(quantity) || quantity <= 0) throw new Error('Quantity must be number and >0');
        if(typeof visible !== 'boolean') throw new Error('Visible must be boolean');
        if(rank !== null && (!Number.isInteger(rank))) throw new Error('Rank must be number');
        
        const data = {
            platinum: platinum,
            quantity: quantity,
            visible: visible
        };

        if (rank !== null) data.rank = rank;

        const options = {
            method: 'PATCH',
            url: `${this.#apiUrl}/order/${orderId}`,
            headers: this.#getHeaders(),
            data: data
        };

        return await this.#doRequest(options, 'modifyOrder');
    }

    /**
     * Delete an order
     * @param {string} orderId - Order ID.
     * @returns {Promise<object>} - Return result of deleting order.
     */
    static async deleteOrder(orderId) {
        this.#checkAuth('deleteOrder');
        const options = {
            method: 'DELETE',
            url: `${this.#apiUrl}/order/${orderId}`,
            headers: this.#getHeaders()
        };

        return await this.#doRequest(options, 'deleteOrder');
    }

    /**
     * Close an order (for transactions logs)
     * @param {string} orderId - Order ID.
     * @param {number} [quantity] - Quantity to close (optional).
     * @returns {Promise<object>} - Return result of closing order.
     */
    static async closeOrder(orderId, quantity = 1) {
        this.#checkAuth('closeOrder');
        if(!Number.isInteger(quantity) || quantity <= 0) throw new Error('Quantity must be number and >0');
        const data = { quantity: quantity };
        
        const options = {
            method: 'POST',
            url: `${this.#apiUrl}/order/${orderId}/close`,
            headers: this.#getHeaders(),
            data: data
        };

        return await this.#doRequest(options, 'closeOrder');
    }

    /**
     * Get order information by order ID
     * @param {string} orderId - Order ID.
     * @returns {Promise<object>} - Return order information.
     */
    static async getOrderInfo(orderId) {
        const options = {
            method: 'GET',
            url: `${this.#apiUrl}/order/${orderId}`,
            headers: this.#getHeaders()
        };

        return await this.#doRequest(options, 'getOrderInfo');
    }

    /**
     * Get authorized user orders
     * @returns {Promise<object>} - Return object with all user orders.
     */
    static async getMyOrders() {
        this.#checkAuth('getMyOrders');
        const options = {
            method: 'GET',
            url: `${this.#apiUrl}/orders/my`,
            headers: this.#getHeaders()
        };

        return await this.#doRequest(options, 'getMyOrders');
    }

    /**
     * Get authorized user profile information
     * @returns {Promise<object>} - Return object with profile info.
     */
    static async getMyProfile() {
        this.#checkAuth('getMyProfile');
        const options = {
            method: 'GET',
            url: `${this.#apiUrl}/me`,
            headers: this.#getHeaders()
        };

        return await this.#doRequest(options, 'getMyProfile');
    }

    /**
     * Get all orders for a specific item
     * @param {string} itemSlug - Item Slug name.
     * @returns {Promise<object>} - Return object with all item orders.
     */
    static async getItemOrders(itemSlug) {
        if(!itemSlug) throw new Error('Item Slug is required');
        const options = {
            method: 'GET',
            url: `${this.#apiUrl}/orders/item/${itemSlug}`,
            headers: this.#getHeaders()
        };

        return await this.#doRequest(options, 'getItemOrders');
    }

    /**
     * Get top 5 orders for a specific item
     * @param {string} itemSlug - Item Slug name.
     * @param {boolean} [maxRank] - Is mod/arcane rank maxed (optional).
     * @returns {Promise<object>} - Return object with top 5 sell and buy orders.
     */
    static async getTopItemOrders(itemSlug, maxRank = false) {
        if(!itemSlug) throw new Error('Item Slug is required');
        let url = `${this.#apiUrl}/orders/item/${itemSlug}/top`;
    
        if(maxRank) {
            let item = await this.getItemInfo(itemSlug);
            if (Number.isInteger(item.maxRank)) {
                url += `?rank=${item.maxRank}`;
            } else {
                console.warn(`\x1b[33m[Warning]\x1b[0m Item "${itemSlug}" has no ranks. Use \x1b[33mmaxRank\x1b[0m argument only for items with ranks like mods/arcanes.`);
            }
        }

        const options = {
            method: 'GET',
            url: url,
            headers: this.#getHeaders()
        };

        return await this.#doRequest(options, 'getTopItemOrders');
    }

    /**
     * Get list of all tradable items
     * @returns {Promise<object>} - Return object with all tradable items.
     */
    static async getAllItems() {
        const options = {
            method: 'GET',
            url: `${this.#apiUrl}/items`,
            headers: this.#getHeaders()
        };

        return await this.#doRequest(options, 'getAllItems');
    }

    /**
     * Get information about a specific item
     * @param {string} itemSlug - Item Slug name.
     * @returns {Promise<object>} - Return information about the item.
     */
    static async getItemInfo(itemSlug) {
        if(!itemSlug) throw new Error('Item Slug is required');
        const options = {
            method: 'GET',
            url: `${this.#apiUrl}/item/${itemSlug}`,
            headers: this.#getHeaders()
        };

        return await this.#doRequest(options, 'getItemInfo');
    }

    /**
     * Get item information including set data
     * @param {string} itemSlug - Item Slug name.
     * @returns {Promise<object>} - Return information about the item including set.
     */
    static async getItemInfoWithSet(itemSlug) {
        if(!itemSlug) throw new Error('Item Slug is required');
        const options = {
            method: 'GET',
            url: `${this.#apiUrl}/item/${itemSlug}/set`,
            headers: this.#getHeaders()
        };
        return await this.#doRequest(options, 'getItemInfoWithSet');
    }

    /**
     * Get specific user public information
     * @param {string} slug - Slug.
     * @returns {Promise<object>} - Return user information.
     */
    static async getUserPublicInfo(slug) {
        if(!slug) throw new Error('Slug is required');
        const options = {
            method: 'GET',
            url: `${this.#apiUrl}/user/${slug}`,
            headers: this.#getHeaders()
        };

        return await this.#doRequest(options, 'getUserPublicInfo');
    }

    /**
     * Get specific user's public orders
     * @param {string} slug - Slug.
     * @returns {Promise<object>} - Return user's public orders.
     */
    static async getUserPublicOrders(slug) {
        if(!slug) throw new Error('Slug is required');
        const options = {
            method: 'GET',
            url: `${this.#apiUrl}/orders/user/${slug}`,
            headers: this.#getHeaders()
        };

        return await this.#doRequest(options, 'getUserPublicOrders');
    }
}
