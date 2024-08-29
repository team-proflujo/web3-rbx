require('dotenv').config({
    path: `${__dirname}/.env`,
});
const fs = require('fs');

const { Logger } = require('../helpers/logger');
const RbxContract = require('../index');

const Log = new Logger();

async function test() {
    const args = process.argv.splice(2);
    let action;

    if (args.length > 0) {
        action = args[0];
    }

    if (action === 'deploy' || action === 'getCode' || action === 'call') {
        //
    } else {
        Log.Error('Invalid Arguments.', 'First argument should be either "deploy" or "call".');
        return;
    }

    //

    if (action == 'deploy') {
        let contractFileContent = fs.readFileSync(`${__dirname}/contracts/sayhello/sayhello.sol`).toString();

        const contract = new RbxContract(process.env.RUBIX_RPC, process.env.ACCOUNT_ADDRESS, contractFileContent);
        contract.Logger.Resume();
        let contractAddress;

        try {
            contractAddress = await contract.deploy();
        } catch(err) {
            Log.Error('Error when deploying contract:', err);
        }

        if (contractAddress) {
            Log.Info('Contract Address:', contractAddress);
        }
    } else if (action == 'getCode') {
        let contractFileContent = fs.readFileSync(`${__dirname}/contracts/sayhello/sayhello.sol`).toString();

        const contract = new RbxContract(process.env.RUBIX_RPC, process.env.ACCOUNT_ADDRESS, contractFileContent, process.env.CONTRACT_ADDRESS);
        let contractCode;

        try {
            contractCode = await contract.getCode();
        } catch(err) {
            Log.Error('Error when fetching contract code:', err);
        }

        if (contractCode) {
            Log.Info('Contract Code:', contractCode);
        }
    } else if (action == 'call') {
        let contractFileContent = fs.readFileSync(`${__dirname}/contracts/sayhello/sayhello.sol`).toString();

        const contract = new RbxContract(process.env.RUBIX_RPC, process.env.ACCOUNT_ADDRESS, contractFileContent, process.env.CONTRACT_ADDRESS);
        let result;

        try {
            result = await contract.getCode();
        } catch(err) {
            Log.Error('Error when calling contract method:', err);
        }

        if (result) {
            Log.Info('Result:', result);
        }
    }
}

test().then(() => {
    process.exit(0);
}).catch((err) => {
    Log.Error(err);

    process.exit(1);
});
