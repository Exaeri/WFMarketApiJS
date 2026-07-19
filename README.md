📦 WFMApi — Warframe.Market v2 API Client (JavaScript)

A lightweight and easy-to-use JavaScript client for the Warframe.Market v2 API.

<h3>🚀 Features</h3>
✔ Support for v2 endpoints<br>
✔ JWT cookie authentication<br>
✔ Set custom User-Agent for requests<br>
✔ Automatic request cooldown limiter (per API rules)<br>
✔ Custom headers: platform, language, crossplay<br>
✔ Simple promise-based API<br>

<h3>📦 Installation</h3>
Clone or download repo.<br>
Install dependencies by using <code>npm i</code><br>
Import into your project<br>

<h3>⚙ Configuration (Optional)</h3>
<b>WFMApi.language</b><br>
WFM have support for 12 languages:<br>
ko, ru, de, fr, pt, zh-hans, zh-hant, es, it, pl, uk, en<br>
For response data that includes an i18n field, WFM can provide translations in addition to the default English (en) translation. <br>
<br>
<b>WFMApi.crossplay</b><br>
In addition to platforms, we also have cross-play option.<br>
Players across different platforms can trade if they have cross-play enabled in their game settings.<br>
<br>
<b>WFMApi.platform</b><br>
WFM is designed to cater to users across various gaming platforms. It currently supports five platforms: pc, ps4, xbox, switch, mobile<br>
<br>
<b>WFMApi.cooldown</b><br>
Request cooldown in milliseconds<br><br>
<b>WFMApi.userAgent</b><br>
Custom User-Agent for requests<br><br>
<b>WFMApi.JWT</b><br>
Authentication for using Auth-Required Methods
<br><br>
<b>Example:</b><br>
<code>WFMApi.language = 'en';
WFMApi.platform = 'pc';
WFMApi.crossplay = true;
WFMApi.cooldown = 750;
WFMApi.JWT = 'your_token';
WFMApi.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)';
</code>

<h3>📚 API Methods</h3>
Get list of all tradable items
<code>await WFMApi.getAllItems();</code><br>
Get information about a specific item
<code>await WFMApi.getItemInfo(itemSlug);</code><br>
Get item information including set data
<code>await WFMApi.getItemInfoWithSet(itemSlug);</code><br>
Get all orders for a specific item
<code>await WFMApi.getItemOrders(itemSlug);</code><br>
Get top 5 buy & top 5 sell orders
<code>await WFMApi.getTopItemOrders(itemSlug, maxedMod);</code><br>
Get specific user public information
<code>await WFMApi.getUserPublicInfo(user-slug);</code><br>
Get specific user's public orders
<code>await WFMApi.getUserPublicOrders(user-slug);</code><br>
Get order information by order ID
<code>await WFMApi.getOrderInfo('orderId');</code><br>
<br><b>🔑 Auth-Required Methods</b><br>
Get authorized user orders
<code>await WFMApi.getMyOrders();</code><br>
Get authorized user profile information
<code>await WFMApi.getMyProfile();</code><br>
Create an order
<code>await WFMApi.addOrder(itemId, type, platinum, quantity, visible, rank);</code><br>
Modify an order
<code>await WFMApi.modifyOrder(orderId, platinum, quantity, visible, rank);</code><br>
Close an order (for transactions logs)
<code>await WFMApi.closeOrder(orderId, quantity);</code><br>
Delete an order
<code>await WFMApi.deleteOrder(orderId);</code><br>

<br>🧪 Usage Example<br>
Look for examples in <code>index.js</code><br>

📘 Waframe.Market API Documentation:<br>
https://42bytes.notion.site/WFM-Api-v2-Documentation-5d987e4aa2f74b55a80db1a09932459d
