import WFMApi from "./WFMApi.js";

//==========================DEFAULT VALUES (Optional)==========================
WFMApi.language = 'ru'; // ko, ru, de, fr, pt, zh-hans, zh-hant, es, it, pl, uk, en Default: en
WFMApi.crossplay = true; // true or false Default: true
WFMApi.platform = 'pc'; // pc, ps4, xbox, switch, mobile Default: pc
WFMApi.cooldown = 750; // Cooldown between requests in milliseconds Default: 750

//==========================AUTHENTICATION via JWT Cookie (Required for some requests)==========================
const MYJWT = '...JWT cookie value...';
WFMApi.JWT = MYJWT

/*==========================METHODS EXAMPLES==========================
let response = await WFMApi.getAllItems(); //grab all tradable items
let response = await WFMApi.getItemInfo('banshee_prime_set'); //grab specific item info like ID
let response = await WFMApi.getItemInfoWithSet('banshee_prime_set'); //grab specific item info with set parts
let response = await WFMApi.getItemOrders('banshee_prime_set'); //grab all bashee prime set orders
let response = await WFMApi.getTopItemOrders('banshee_prime_set'); //grab top 5 sell and top 5 buy banshee prime set orders

let response = await WFMApi.getOrderInfo('OrderID'); //grab specific order info
let response = await WFMApi.getUserPublicInfo('slug'); //grab specific user public info
let response = await WFMApi.getUserPublicOrders('slug'); //grab specific user public orders

==============================Authentication Reqired===================
let response = await WFMApi.addOrder('68cd5ef5e800bed01fa3482e', 'sell', 150, 2, true, 10);
let response = await WFMApi.closeOrder('OrderID', 1)
let response = await WFMApi.modifyOrder('OrderID', 10, 3, true, 0);
let response = await WFMApi.deleteOrder('OrderID');
let response = await WFMApi.getMyOrders();
let response = await WFMApi.getMyProfile();
*/


//==========================EXAMPLE OF USAGE (PLACING SELL ORDER FOR BANSHEE SET)==========

try {
  let bansheeTopOrders = await WFMApi.getTopItemOrders('banshee_prime_set');
  let actualSellPrice = bansheeTopOrders.sell[0].platinum;
  let itemInfo = await WFMApi.getItemInfo('banshee_prime_set');
  let placedOrder = await WFMApi.addOrder(itemInfo.id, 'sell', actualSellPrice);
  let myInfo = await WFMApi.getMyProfile();
  console.log(`${myInfo.slug} is now selling ${itemInfo.i18n[WFMApi.language].name} for ${actualSellPrice} platinum. Order ID: ${placedOrder.id}`);
} catch (error) {
  console.log(error);
};


