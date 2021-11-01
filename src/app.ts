import 'whatwg-fetch';

const iconUrl = 'https://volt.id/api.json?method=sensibleft.getSensibleFtList';

function fetchIcons() {
  return new Promise((resolve, reject) => {
    fetch(iconUrl)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        let icons;
        // console.log(data);
        if (data.success && data.data.list) {
          icons = {
            bsv: {
              type: 'iconlogo-bitcoin',
            },
          };
          data.data.list.forEach((item) => {
            icons[item.genesis.toString()] = {
              url: item.logo,
            };
          });
        }
        resolve(icons);
      });
  });
}

export async function getInitialState() {
  //获取icon列表
  const icons = await fetchIcons();

  return {
    icons,
  };
}
