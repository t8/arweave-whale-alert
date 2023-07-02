// // remove in prod
// import dotenv from 'dotenv';
// dotenv.config();

import redstone from "redstone-api";
import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';

const currentArPrice = (await redstone.getPrice("AR")).value
function winstonToDollars(winston) {
    const arweave = winston / 10 ** 12;
    const dollarWorth = currentArPrice * arweave;
    const formattedValue = dollarWorth.toLocaleString("en-US", { minimumFractionDigits: 2 });
    return formattedValue;
}


function winstonToArweave(winston) {
    const arweave = winston / 10 ** 12;
    const roundedValue = arweave.toFixed(5);
    return roundedValue;
}


function shortenAddress(address) {
    const shortenedAddress = address.slice(0, 7) + "..." + address.slice(-7);
    return shortenedAddress;
}


async function sendSlackMessage(message) {
    await axios.post('https://slack.com/api/chat.postMessage', { 
        channel: process.env.SLACK_CHANNEL_ID,
        text: message
    }, { headers: { 'Authorization': `Bearer ${process.env.SLACK_TOKEN}`, 'Content-Type': 'application/json' } });
}

async function sendTweet(message) {
    const twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        // Following access tokens are not required if you are
        // at part 1 of user-auth process (ask for a request token)
        // or if you want a app-only client (see below)
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET,      
    });
    await twitterClient.v1.tweet(message);
}


export default async function postToTwitter(whaleTransactions) {

    for (const transaction of whaleTransactions) {
        const message = `🚨 ${winstonToArweave(transaction.quantity)} AR ($${winstonToDollars(transaction.quantity)} USD) transferred to ${shortenAddress(transaction.target)} 
        
        Transaction ID: https://viewblock.io/arweave/tx/${transaction.id}`;
        await sendTweet(message);
        await sendSlackMessage(message);
        console.log(message)
    }

}