const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxx7guPyybvHxUAn91xg0uwzrFbXDqj9eJPESVQKjOx34GwvdoKE6-pSPOv4HNKLj5Y/exec';

const orders = [
  'ORDER_1780435813591_2033', // Каролина
  'ORDER_1780459653904_3909', // Ольга
  'ORDER_1780468150986_3470', // Макс
  'ORDER_1780469134265_6689', // Маргарита
  'ORDER_1780469658054_4431', // Юлія
  'ORDER_1780469748432_7919', // Юлія (alternative order)
  'ORDER_1780473387936_3612', // Валерія
  'ORDER_1780474265983_8646', // Лана
  'ORDER_1780564976807_7859', // Олег
  'ORDER_1780570950845_7447', // валерія
  'ORDER_1780658760704_5825', // Олександра
  'ORDER_1780682129631_273',  // Максим
  'ORDER_1780766262154_9780', // Оксана
  'ORDER_1780777275970_1335', // Анастасия
  'ORDER_1780921987436_8654', // Ангеліна
  'ORDER_1780922623012_8623', // Анна
  'ORDER_1780922908217_1496'  // Тетяна
];

async function sync() {
  console.log(`Starting sync of ${orders.length} orders...`);
  
  for (const orderId of orders) {
    try {
      console.log(`Sending update for ${orderId}...`);
      const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          targetSheet: 'Заявки на практикум',
          orderId: orderId,
          status: 'Оплачено'
        })
      });
      const result = await response.json();
      console.log(`Result for ${orderId}:`, result);
    } catch (err) {
      console.error(`Failed to update ${orderId}:`, err.message);
    }
    // Small delay between requests to avoid overloading the Google Script
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('Sync completed!');
}

sync();
