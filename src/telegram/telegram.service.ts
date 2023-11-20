import { Injectable } from "@nestjs/common";
import { Log, TransactionReceipt, ethers, keccak256, toUtf8Bytes } from "ethers";
import { GenericAbi } from "src/constants/abi/erc20.abi";
import { Context, Telegraf } from "telegraf";

@Injectable()
export class
    TelegramService {
    private readonly provider: ethers.JsonRpcProvider;
    public registeredUsers = [5332448886];
    private bot = new Telegraf('6764449576:AAHLWnsdxopFBbD4WAYyuuHjaC5nd6rTzT0');
    constructor() {
        this.provider = new ethers.JsonRpcProvider('https://rpc1-testnet.miraichain.io/');
        this.provider.on('block', async (blockNumber) => {
            const block = await this.provider.getBlock(blockNumber);
            const txReceipt = await this.provider.getTransactionReceipt(block.transactions[0]);
            console.log(await this.provider.getTransaction(block.transactions[0]))
            await this.getLastestErc20TransactionDetail(txReceipt);
        })

        this.bot.start(this.handleStart.bind(this));
        this.bot.launch();
    }


    async handleStart(ctx: Context) {
        const userId = ctx.chat.id;
        console.log(userId);
        await ctx.reply(`Hello! I'm a bot created by Hoang`);
        if (userId) {
            this.registeredUsers.indexOf(userId) === -1 ? this.registeredUsers.push(userId) : console.log("This user already exists");
        }
    }
    async getLastestErc20TransactionDetail(txReceipt: TransactionReceipt) {
        const erc20TransferEventHash = keccak256(toUtf8Bytes("Transfer(address,address,uint256)"));
        const erc20Transfers = [];

        txReceipt.logs.filter(async (log: Log) => {
            if (log.topics[0] === erc20TransferEventHash) {
                console.log(log.topics[0]);
                const transferredFrom = log.topics[1];
                const transferredTo = log.topics[2];
                const amountTrasferred = log.data;
                const token = log.address;
                const contract = new ethers.Contract(token, GenericAbi, this.provider);
                // Extract the actual amount
                const amount = BigInt(amountTrasferred).toString();

                // Format the addresses
                const fromAddress = transferredFrom.toLowerCase();
                const toAddress = transferredTo.toLowerCase();

                erc20Transfers.push({ token, amount: ethers.formatUnits(amount), to: this.convertHexFormat(toAddress), from: this.convertHexFormat(fromAddress) });
                console.log(erc20Transfers);
                const tokenSymbol = await contract.symbol()
                const message = `New ERC-20 transaction detected!\n\nToken: ${tokenSymbol}\nAmount: ${ethers.formatUnits(amount)} ${tokenSymbol}\nFrom: ${this.convertHexFormat(fromAddress)}\nTo: ${this.convertHexFormat(toAddress)}`;
                console.log('registered users: ' + this.registeredUsers);
                for (let userId of this.registeredUsers) {
                    await this.bot.telegram.sendMessage(userId.toString(), message);
                };

            }
        });
        return erc20Transfers;
    }
    convertHexFormat(originalHex: string): string {
        const bigIntValue = BigInt(originalHex);
        const formattedHex = '0x' + bigIntValue.toString(16).toLowerCase();

        return formattedHex;
    }
}