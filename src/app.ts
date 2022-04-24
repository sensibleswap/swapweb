// import 'whatwg-fetch';

// const iconUrl = 'https://volt.id/api.json?method=sensibleft.getSensibleFtList';
// const tokenPriceUrl = 'https://volt.id/api.json?method=wallet.tokenPrice';

// function fetchData(url: string) {
//   return new Promise((resolve, reject) => {
//     fetch(url)
//       .then((res) => {
//         return res.json();
//       })
//       .then((data) => {
//         resolve(data);
//       });
//   });
// }

// async function fetchIcons() {
//   const data = await fetchData(iconUrl);
//   // console.log(data);
//   let icons;
//   if (data.success && data.data.list) {
//     icons = {
//       bsv: {
//         type: 'iconlogo-bitcoin',
//       },
//     };
//     data.data.list.forEach((item) => {
//       icons[item.genesis.toString()] = {
//         url: item.logo,
//       };
//     });
//   }
//   return icons;
// }

// async function fetchTokenPrice() {
//   const data = await fetchData(tokenPriceUrl);
//   return data.data;
// }

// export async function getInitialState() {
//   //获取icon列表
//   const icons = await fetchIcons();

//   const tokenPrice = await fetchTokenPrice();

//   return {
//     icons,
//     tokenPrice
//   };
// }
