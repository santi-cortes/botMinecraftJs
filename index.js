const mineflayer = require('mineflayer'); // importar el modulo mineflayer

const { mineflayer: mineflayerViewer } = require('prismarine-viewer'); // importar el modulo mineflayerViewer

const pathfinder = require('mineflayer-pathfinder').pathfinder;
const Movements = require('mineflayer-pathfinder').Movements;
const { GoalNear, GoalNearXZ } = require('mineflayer-pathfinder').goals;

const prefix = '!'; // prefijo del comando

const bot = mineflayer.createBot({
	// crear el bot
	host: '192.168.1.201', // minecraft server ip
	username: 'afkonline', // minecraft username
	// password: '12345678' // minecraft password, comment out if you want to log into online-mode=false servers
	port: 25565, // only set if you need a port that isn't 25565
	version: '1.12.2' // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
	// auth: 'mojang'              // only set if you need microsoft auth, then set this to 'microsoft'
});

bot.loadPlugin(pathfinder);

bot.once('spawn', () => {
	// Once we've spawn, it is safe to access mcData because we know the version
	const mcData = require('minecraft-data')(bot.version);

	// A new movement instance for specific behavior
	const defaultMove = new Movements(bot, mcData);

	defaultMove.allow1by1towers = false;
	defaultMove.canDig = true;
	defaultMove.allowParkour = true;
	defaultMove.allowSprinting = true;
	defaultMove.scafoldingBlocks = [];

	defaultMove.scafoldingBlocks.push(mcData.itemsByName['dirt'].id);

	bot.pathfinder.setMovements(defaultMove);

	mineflayerViewer(bot, { port: 3007, firstPerson: true }); // port is the minecraft server port, if first person is false, you get a bird's-eye view
});

bot.on('chat', (username, message) => {
	if (username == bot.username) return;

	if (!message.startsWith(prefix)) {
		return;
	}
	const args = message.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	if (command == 'di') {
		bot.chat(args.join(' '));
	}
	if (command == 'ven') {
		const target = bot.players[username] ? bot.players[username].entity : null;
		if (!target) {
			bot.chat(
				'No te puedo ver, no se donde estas, prueba de entrar detro de mis chunks o acercarte mas a mi'
			);
			return;
		}
		const player = target.position;
		bot.pathfinder.setGoal(new GoalNear(player.x, player.y, player.z, 1));
	}
	if (command == 'goto') {
		const x = parseInt(args[0]);
		const y = parseInt(args[1]);
		const z = parseInt(args[2]);
		bot.pathfinder.setGoal(new GoalNear(x, y, z, 1));
	}
	if (command == 'xz') {
		const x = parseInt(args[0]);
		const z = parseInt(args[1]);
		bot.pathfinder.setGoal(new GoalNearXZ(x, z, 1));
	}
});

// Muestra los errores en la consola o motivos de expulsacion
bot.on('kicked', console.log);
bot.on('error', console.log);
