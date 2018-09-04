const puppeteer = require('puppeteer');

(async () => {
	const browser = await puppeteer.launch({
		executablePath: '/Users/zhangdad/puppeteer-test/chrome-mac/Chromium.app/Contents/MacOS/Chromium',
		headless: false
	})
	const page = await browser.newPage()

	await page.goto('https://www.jd.com')

	await page.type('input#key.text', '奶茶')
	await page.keyboard.press('Enter')

	let foods = []

	for (let i = 0; i < 3; i++) {
		await page.waitFor(1000)
		let list = await page.evaluate(() => {
			return new Promise((resolve) => {
				let pos = 0
				let i = 0
				let timer = setInterval(() => {
					window.scrollBy(0, 100)
					let scrollTop = document.documentElement.scrollTop
					if (scrollTop === pos) { // 到底了（加载中/加载完成）
						if (i > 100) {
							clearTimeout(timer)
							resolve()
						} else {
							i++
						}
					} else {
						pos = scrollTop
						i = 0
					}
				}, 20)
			}).then(() => {
				const FOOD_LIST = '#J_goodsList ul.gl-warp.clearfix'
				const foodList = Array.from($(FOOD_LIST).find('li.gl-item'))
				const ctn = foodList.map(item => {
					price = $(item).find('.p-price strong i').text()
					title = $(item).find('.p-name.p-name-type-2 a em').text()
					shop = $(item).find('.p-shop span a').text()
					return {
						title: title,
						price: price,
						shop: shop
					}
				})
				return ctn
			})
		})

		foods = [...foods, ...list]

		await page.waitForSelector('a.pn-next')
		await page.click('a.pn-next')
	}

	console.log(foods)

	// 写入文件
  writerStream = fs.createWriteStream('foods.json');
	writerStream.write(JSON.stringify(foods, undefined, 2), 'UTF8');
	writerStream.end();
	

	await browser.close()
})()