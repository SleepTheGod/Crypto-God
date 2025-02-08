// Import necessary libraries
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

// Create a new Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Create an express server
const app = express();
const port = process.env.PORT || 3000;  // Port for the server

// Your bot's token
const botToken = 'YOUR_BOT_TOKEN';  // Replace with your Discord bot token

// Custom responses
const responses = {
  greeting: [
    "Why hello!",
    "Bleep bloop.",
    "How d'ya do?",
    "Greetings!",
    "Good day.",
    "Wonderful weather we're having."
  ],
  success: [
    "Done.",
    "Completed. Bleep bloop.",
    "Taken care of.",
    "You know best, boss.",
    "As you request.",
    "At your service. Bleep bloop.",
    "I wish I would have thought of that myself!"
  ],
  error: [
    "Uh oh!",
    "Woops...",
    "Dang nabbit!",
    "ERR: ID10T. Haha, just kidding. Seriously though..."
  ]
};

// CoinMarketCap API URL and options to fetch cryptocurrency data
const tickerUrl = 'https://api.coinmarketcap.com/v1/ticker/';
const tickerUpdateInterval = 30;  // Update interval in seconds

// Function to fetch ticker data from CoinMarketCap
async function getTickerData() {
  try {
    const response = await axios.get(tickerUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching data from CoinMarketCap:', error);
    return null;
  }
}

// Handle the bot's ready event
client.once('ready', () => {
  console.log(`${randomResponse(responses.greeting)} Logged in as ${client.user.tag}!`);
});

// Handle incoming messages
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;  // Ignore bot messages

  // Command to fetch cryptocurrency information
  if (message.content.startsWith('!cryptobot')) {
    const args = message.content.split(' ');
    const command = args[1]?.toLowerCase();

    if (command === 'help') {
      message.channel.send(`${randomResponse(responses.success)} Here are some commands you can use:\n` +
        '!cryptobot price <coin_symbol> - Get current price of a coin (e.g., !cryptobot price btc)\n' +
        '!cryptobot list - Get a list of available coins\n' +
        '!cryptobot update - Get the latest cryptocurrency data');
    }

    // Command to get price of a coin
    if (command === 'price') {
      const coinSymbol = args[2]?.toUpperCase();

      if (!coinSymbol) {
        return message.channel.send('Please specify a coin symbol. Example: !cryptobot price BTC');
      }

      const data = await getTickerData();
      if (data) {
        const coin = data.find(c => c.symbol.toUpperCase() === coinSymbol);
        if (coin) {
          message.channel.send(`${randomResponse(responses.success)} *${coin.symbol.toUpperCase()}* Price: $${coin.price_usd} USD`);
        } else {
          message.channel.send(`${randomResponse(responses.error)} Coin not found. Please try again with a valid symbol.`);
        }
      } else {
        message.channel.send(`${randomResponse(responses.error)} Failed to fetch coin data. Please try again later.`);
      }
    }

    // Command to get list of available coins
    if (command === 'list') {
      const data = await getTickerData();
      if (data) {
        const coinList = data.map(c => c.symbol).join(', ');
        message.channel.send(`Available coins: ${coinList}`);
      } else {
        message.channel.send(`${randomResponse(responses.error)} Failed to fetch coin data. Please try again later.`);
      }
    }

    // Command to update and fetch the latest coin data
    if (command === 'update') {
      const data = await getTickerData();
      if (data) {
        message.channel.send(`${randomResponse(responses.success)} Here are the latest updates:`);
        data.slice(0, 10).forEach(coin => {
          message.channel.send(`*${coin.symbol.toUpperCase()}*: $${coin.price_usd} USD`);
        });
      } else {
        message.channel.send(`${randomResponse(responses.error)} Failed to fetch the latest data. Please try again later.`);
      }
    }
  }
});

// Function to return a random response from a given array
function randomResponse(responseArray) {
  const randomIndex = Math.floor(Math.random() * responseArray.length);
  return responseArray[randomIndex];
}

// Log the bot in with your token
client.login(botToken);

// Set up Express server
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
