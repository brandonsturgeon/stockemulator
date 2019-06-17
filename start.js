let _modPath;

const scope = GetRootScope()

const log = message => Helpers.ConsoleInfo(`[MOD] Stock Emulator: ${message}`)

const notify = (notification, duration) => GetRootScope().addNotification(notification, duration || 6)

const generateRandomVolatility = () => (0.99 / (Math.random() * 0.99 + 0.01)) / 100

const generateDailyStockPrice = (oldPrice, volatility) => {
	const seed = Math.random() - 0.5

	let changePercent = 2 * volatility * seed

	const changeAmount = oldPrice * changePercent

	const newPrice = oldPrice + changeAmount

	return newPrice
}

const setInitialStockValues = () => {
	log("Setting initial price values")
	const competitors = GetRootScope().settings.competitorProducts

	for(let i = 0; i < competitors.length - 1; i++) {
		const competitor = competitors[i]

		const { history, name } = competitor

		const startingPrice = history[0].stockPrice
		
		const stockVolatility = generateRandomVolatility()

		competitor.stockVolatility = stockVolatility

		for(let n = 0; n <= history.length - 1; n++) {

			let oldPrice = startingPrice

			if (n !== 0) {
				const oldPrice = history[n-1].stockPrice
			}

			const newPrice = generateDailyStockPrice(oldPrice, stockVolatility)

			history[n].stockPrice = newPrice
		}
	}
}

const updateStockPrices = competitors => {
	for(let i = 0; i < competitors.length - 1; i++) {
		const competitor = competitors[i]

		const { history, name, stockVolatility } = competitor

		const oldPrice = history[history.length - 2].stockPrice

		const newPrice = generateDailyStockPrice(oldPrice, stockVolatility)

		log(`Setting new price for ${name}: ${newPrice}`)

		history[history.length -1].stockPrice = newPrice
	}
}

const eachDay = () => {
	Helpers.UpdateCompetitors()

	notify("Updating Stock Prices...")

	const competitors = GetRootScope().settings.competitorProducts

	updateStockPrices(competitors)
}

exports.initialize = modPath => {
	modPath = modPath

	log("Initializing")
}

exports.onLoadGame = settings => {
	if (settings) {
		setInitialStockValues()
	}
}

exports.onNewDay = () => eachDay()

exports.onUnsubscribe = done => {
	delete scope.options.stockEmulator
	scope.saveOptions()
	done()
}