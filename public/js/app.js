const app = new Vue({
	el: '#app',
	computed: {
		activePlayers() {
			return this.game.players.length
		},
		gameOver() {
			return this.game.win || this.game.lose
		},
	},
	created() {
		this.socket = io()
		this.askName()
		this.listenDisconnect()
		this.listenSelectLetter()
		this.listenNewPlayer()
		this.onStartGame()
	},
	data: function () {
		return {
			currentPlayer: {
				id: null,
				name: null,
			},
			game: {
				credits: 6,
				currentTurn: {},
				lose: false,
				players: [],
				playing: false,
				playingWord: [],
				keyBoard: [],
				win: false,
			},
			socket: null,
		}
	},
	methods: {
		askName() {
			// let = inputName = prompt('Ingresa tu nombre')
			// if (!inputName || !inputName.trim()) {
			// 	this.askName()
			// } else {
			// this.currentPlayer.name = inputName
			this.currentPlayer.name =
				'Usuario_' + Math.round(Math.random() * 1_000_000)
			this.socket.emit('newPlayer', this.currentPlayer.name)
			// }
		},
		listenDisconnect() {
			this.socket.on('playerDisconnect', (game) => (this.game = game))
		},
		listenNewPlayer() {
			this.socket.on('newPlayer', (game) => {
				this.game = game
				this.currentPlayer = game.players.find(
					(player) => player.name === this.currentPlayer.name
				)
			})
		},
		listenSelectLetter() {
			this.socket.on('selectLetter', (game) => (this.game = game))
		},
		onStartGame() {
			this.socket.on('startGame', (game) => (this.game = game))
		},
		selectLetter(letterName, index) {
			if (this.gameOver) return

			if (this.currentPlayer.id !== this.game.currentTurn.id) {
				this.socket.emit('selectLetter', [letterName, index])
			}
		},
		startGame() {
			let playingWord = prompt('Ingresa la palabra')
			if (playingWord !== null) {
				playingWord = playingWord.trim()
				if (!playingWord) {
					this.startGame()
				} else {
					playingWord = playingWord.toUpperCase().split('')
					this.socket.emit('startGame', playingWord)
				}
			}
		},
	},
	watch: {
		gameOver(val) {
			if (val) {
				setTimeout(() => {
					alert('Juego terminado')
				}, 3000)
			}
		},
	},
})
