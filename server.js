
import './fetch-polyfill.mjs'
import * as dotenv from 'dotenv';
dotenv.config();
import { ChatGPTAPI } from 'chatgpt';
import express from 'express';
import { Client } from 'whatsapp-web.js';
import { LocalAuth, qrcode } from './shell.cjs';

var app = express();

const clientWP = new Client({
	puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--unhandled-rejections=strict'] }, authStrategy: new LocalAuth({
		clientId: 'chatbot-teste-si',
		dataPath: `./authFolder/chatbot-teste-si`,
	})
});

clientWP.on('loading_screen', (percent, message) => {
	console.log('carregando...', percent, message);
});

clientWP.on("qr", (qr) => {
	console.log(qr);
	qrcode.generate(qr, { small: true });
});

clientWP.on("authenticated", () => {
	console.log("autenticação realizada com sucesso!");
});
clientWP.on("ready", () => {
	console.log("chatbot-teste-si está pronto para uso!");
});

clientWP.on('auth_failure', msg => {
	console.error('autenticação falhou!', msg);
});

clientWP.initialize();

(async () => {
	const api = new ChatGPTAPI({
		apiKey: process.env.OPENAPI_KEY	
	})

	clientWP.on('message', async msg => {
	console.log('mensagem recebida! -> ', msg.body);

	if (msg.body.startsWith('!chatgpt ')) {
		const chat = await msg.getChat();
		chat.sendStateTyping();
		let searchGPT = msg.body.slice(9);      
		const res = await api.sendMessage(searchGPT);
		chat.clearState();
		msg.reply(`🤖: ${res.text} `);   
	} else if (msg.body.startsWith('Obrigado' || 'obrigado' || 'Obrigada' || 'obrigada')) {
		msg.reply(`🤖: Fico feliz em ajudar! 😀`)
	} else if (msg.body.startsWith('!ajuda')) {
		msg.reply(`🤖: Para fazer uma pergunta ao GPT-3, digite "!chatgpt" seguido da sua pergunta.\n\n✏ Exemplo: "!chatgpt Qual o seu nome? 🤖\n\n📌 Para saber mais sobre mim, digite "!sobre" 🙋‍♂️
		`)
	} else if (msg.body.startsWith('!sobre')) {
		msg.reply(`🤖: Sou um chatbot criado pelo @rafaelmaestro_ utilizando a API do GPT-3.\n\n🔨 Ainda estou em desenvolvimento, mas já posso te ajudar com algumas coisas.\n\n🧠 Faça alguma pergunta utilizando  "!chatgpt" ou digite "!ajuda" para saber o que posso fazer. 😀`)
	} else {
		msg.reply(`🤖: Fala meu querido! Meu nome é Mário, esse mesmo que você está pensando... 🤭\n\nEu sou um bot criado pelo @rafaelmaestro_. Ainda estou em desenvolvimento, mas já posso te ajudar com algumas coisas.\n\nFaça alguma pergunta utilizando  "!chatgpt" ou digite "!ajuda" para saber o que posso fazer por você. 😀`)
	}
	});
})();

app.listen(process.env.PORT, () => {
	console.log("Servidor rodando na porta: " + process.env.PORT);
});
