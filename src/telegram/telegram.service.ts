import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Log, TransactionReceipt, ethers, keccak256, toUtf8Bytes } from "ethers";
import { GenericAbi } from "src/constants/abi/erc20.abi";
import { UserEntity } from "src/user/user.entity";
import { UserService } from "src/user/user.service";
import { Context, Telegraf } from "telegraf";

@Injectable()
export class
    TelegramService {
    private readonly provider: ethers.JsonRpcProvider;
    private registeredUsers: Number[] = [];

    private bot = new Telegraf(this.configService.get('bot_token'));
    constructor(
        private configService: ConfigService,
        private userService: UserService,
    ) {
        this.provider = new ethers.JsonRpcProvider(configService.get('RPC'));
        this.provider.on('block', async (blockNumber) => {
            console.log(`got new block: ${blockNumber}`);
            const block = await this.provider.getBlock(blockNumber);
            const txReceipt = await this.provider.getTransactionReceipt(block.transactions[0]);
            console.log(await this.provider.getTransaction(block.transactions[0]))
            await this.getLastestErc20TransactionDetail(txReceipt, await this.getAllRegisteredUser());
        })

        this.bot.start(this.handleStart.bind(this));
        this.bot.launch();
    }
    async getAllRegisteredUser(): Promise<UserEntity[]> {
        return await this.userService.findAll();
    }
    async handleStart(ctx: Context) {
        const userId = ctx.chat.id;
        const username = ctx.message.from.first_name;
        await ctx.reply(`Hello! I'm a bot created by Hoang`);
        if (userId) {
            let createUser = {
                userId: userId,
                username: username,
            }
            await this.userService.registerUser(createUser);
        }
         console.log( await this.provider.getTransaction('0xa22f50ae0e62de22a228905abd293e5a357fa37bf9021626e67e5e1bb28084eb'))
    }


    async getLastestErc20TransactionDetail(txReceipt: TransactionReceipt, registeredUsers: UserEntity[]) {
        const erc20TransferEventHash = keccak256(toUtf8Bytes("Transfer(address,address,uint256)"));
        const erc20Transfers = [];

        txReceipt.logs.filter(async (log: Log) => {
            if (log.topics[0] === erc20TransferEventHash) {
                const transferredFrom = log.topics[1];
                const transferredTo = log.topics[2];
                const amountTrasferred = log.data;
                const token = log.address;
                const contract = new ethers.Contract(token, GenericAbi, this.provider);

                const amount = BigInt(amountTrasferred).toString();
                const fromAddress = transferredFrom.toLowerCase();
                const toAddress = transferredTo.toLowerCase();

                erc20Transfers.push({ token, amount: ethers.formatUnits(amount), to: this.convertHexFormat(toAddress), from: this.convertHexFormat(fromAddress) });

                const tokenSymbol = await contract.symbol();
                const message = `New ERC-20 transaction detected!\n\nToken: ${tokenSymbol}\nAmount: ${ethers.formatUnits(amount)} ${tokenSymbol}\nFrom: ${this.convertHexFormat(fromAddress)}\nTo: ${this.convertHexFormat(toAddress)}`;
                console.log('registered users: ' + registeredUsers.length);
                for (let user of registeredUsers) {
                    await this.bot.telegram.sendMessage(Number(user.userId), message);
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