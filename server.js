//server
const path = require('path')
const express = require('express')
const app = express()
const socketIO = require('socket.io')

app.set('port', process.env.PORT || 3000)

app.use(express.static(path.join(__dirname, 'public')))

const server = app.listen(app.get('port'), () => {
	console.log('server listening on port ' + app.get('port'))
})

const io = socketIO.listen(server)

const game = {
	credits: 6,
	currentTurn: {},
	lose: false,
	players: [],
	playing: false,
	playingWord: [],
	win: false,
	keyBoard: [
		{ name: 'A', used: false },
		{ name: 'B', used: false },
		{ name: 'C', used: false },
		{ name: 'D', used: false },
		{ name: 'E', used: false },
		{ name: 'F', used: false },
		{ name: 'G', used: false },
		{ name: 'H', used: false },
		{ name: 'I', used: false },
		{ name: 'J', used: false },
		{ name: 'K', used: false },
		{ name: 'L', used: false },
		{ name: 'M', used: false },
		{ name: 'N', used: false },
		{ name: 'Ñ', used: false },
		{ name: 'O', used: false },
		{ name: 'P', used: false },
		{ name: 'Q', used: false },
		{ name: 'R', used: false },
		{ name: 'S', used: false },
		{ name: 'T', used: false },
		{ name: 'U', used: false },
		{ name: 'V', used: false },
		{ name: 'w', used: false },
		{ name: 'X', used: false },
		{ name: 'Y', used: false },
		{ name: 'Z', used: false },
	],
}

io.on('connection', (socket) => {
	//setPlayers connect
	socket.on('newPlayer', (name) => {
		game.players.push({ name, id: socket.id })
		if (game.players.length === 1) {
			game.currentTurn = game.players[1]
		}
		io.emit('newPlayer', game)
	})

	//start game
	socket.on('startGame', (playingWord) => {
		game.playingWord = playingWord.map((letter) => ({
			name: letter,
			used: false,
		}))
		game.playing = true
		io.emit('startGame', game)
	})

	//onSelectLetter
	socket.on('selectLetter', ([letterName, index]) => {
		game.playingWord.forEach((l, i) => {
			if (l.name === letterName) {
				game.playingWord[i].used = true
			}
		})

		game.keyBoard[index].used = true

		const correctLetter = game.playingWord.some(
			(letter) => letter.name === letterName
		)
		if (correctLetter) {
			game.win = game.playingWord
				.filter((letter) => letter.name.trim())
				.every((letter) => letter.used)
		} else {
			game.credits -= 1
			if (game.credits === 0) {
				game.lose = true
			}
		}
		io.emit('selectLetter', game)
	})

	//end game
	socket.on('disconnect', () => {
		game.players = game.players.filter((player) => player.id !== socket.id)
		game.currentTurn = game.players[0]
		if (game.players.length < 2) {
			game.playingWord = null
			game.playing = false
			game.credits = 6
			game.lose = false
			game.win = false
			game.keyBoard = game.keyBoard.map(({ name }) => ({
				name,
				used: false,
			}))
		}
		io.emit('playerDisconnect', game)
	})
})
